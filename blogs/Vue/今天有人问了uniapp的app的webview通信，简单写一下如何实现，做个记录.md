 1. 思路实现是基于uniapp的一位大佬的贴子[Simple nvue向网页传参，网页向nvue传参](https://ext.dcloud.net.cn/plugin?id=1120)，其实看下原帖也就会了，以下纯属娱乐.
 2. `<web-view :src="url" @message="handlePostMessage"></web-view>`@message是webview向app通信时触发的函数，在script里面
```javascript
 var currentWebview；
  //当前页面
 var wv;
 //webview
	export default {
		data() {
			return {
				url: null,
				timmer: null,
				token: null
			};
		},
		onLoad(option) {
			console.log(option)
			this.url = option.url
			currentWebview = this.$scope.$getAppWebview();
			setTimeout(function() {
				wv = currentWebview.children()[0]
				// wv.setStyle({top:150,height:300})
				console.log(wv)
			}, 1000);
		},
		onShow() {
			if (getApp().globalData.token) {
			//注入token判断登录
				wv.evalJS(`
					islog("${getApp().globalData.token}")			`
				)
			}
		},
		methods: {
		//webview发送消息时通过字段不同进行判断
			handlePostMessage: function(data) {
				// 获取网页的参数
				console.log("得到参数", data.detail);
				wv = currentWebview.children()[0]
				console.log("wv", wv)
				console.log(wv.evalJS)
				console.log(getApp().globalData.isLog)
				var message = data.detail.data[data.detail.data.length - 1]
				//本次通信传入的数据
				console.log("message", message)
				if (message.islogin && message.islogin == "login") {
					// loagin是否需要判断登录，需要为login
					// 如果登录显示返回信息
					if (getApp().globalData.isLog) {
						uni.hideLoading()
						if (message.res) {
							if (message.res.status == 200) {
								uni.showToast({
									title: message.res.msg,
									duration: 2000,
									icon: "success"
								})
							} else {
								uni.showToast({
									title: message.res.msg,
									duration: 2000,
									icon: "none"
								})
							}
						}
						// 如果未登录前去登录
					} else {
						uni.hideLoading()
						uni.showToast({
							title: "请登录",
							duration: 2000,
							icon: "none"
						})
						// if()
						this.timmer = setTimeout(() => {
							uni.navigateTo({
								url: "/pages/login/login"
							})
						}, 2000)
						return
					}
				}
				// 如果想在ajax时显示loading框
				if (message.loading == "load") {
					uni.showLoading({
						title: "加载中"
					})
				}
				// 如果传的是路径
				if (message.url && message.url.type == "tab") {
					console.log("tiaozhuan")
					uni.switchTab({
						url: '/pages' + message.url.data
					})
					return
				} else if (message.url && message.url.type != "tab") {
					uni.navigateTo({
						url: '/pages' + message.url.data
					})
					return
				}
				// 如果登录给webview传入token
				if (getApp().globalData.token) {
					wv.evalJS(
					`islog("${getApp().globalData.token}")`
					)
				}
			},
		},
		onUnload() {
			clearTimeout(this.timmer)
		},
		onHide() {
			clearTimeout(this.timmer)
		}
	}
```

在webview里，

```javascript
			var uniIsReady = false
			var token
			var URL="https://www.**.com/api/"
			// var URL="https://www.jieyingshipin.com/api/"
			window.islog = function(fun) {
				// fun()
				token = fun
			}


	document.addEventListener('UniAppJSBridgeReady', function() {
	//可以通信app
		uniIsReady = true
		uni.postMessage({
			data: {
				action: 'message'
			}
		});
		uni.getEnv(function(res) {
			console.log('当前环境：' + JSON.stringify(res));
		});
	});
	//vue...
	let vm = new Vue({
		el: "#app",
		data() {
			return {
				timer: null,
				// postNum:
			}
		},
		methods: {
		//通过什么事件触发什么函数随意，uni.postMessage的数据必须和app端约定好
			ling() {
				if (uniIsReady) {
					uni.postMessage({
						data: {
							islogin: 'login',
							// 传入方法必须为methods，以数组形式
							// methods: [{
							// 	/* isasync，是否异步，如果异步则fun为promise */
							// 	isasync: true,
							// 	fun() {
							// 		console.log(haha)
							// 	},
							// }],
							// 变量名
							jssrc:"",
							loading:"load"
						}
					})
					//如果登录
					if(token){
						fetch(URL+"****",{
							method: 'GET',
							　　headers: {
							  　　'Authorization': 'Bearer ' + token,
							  }
						}).then(response => response.json()).then(res=>{
							console.log(res.data)
							uni.postMessage({
								data: {
									// 是否判断登录
									islogin: 'login',
									// 传入方法必须为methods，以数组形式
									// methods: [{
									// 	/* isasync，是否异步，如果异步则fun为promise */
									// 	isasync: true,
									// 	fun() {
									// 		console.log(haha)
									// 	},
									// }],
									// 变量名
									jssrc:"",
									res:res,
									a:"A"
								}
							})
						})

					}else{
						
					}
				} else {
					this.timer = setTimeout(() => {
						this.ling()
					}, 1000)
				}
			},
			start() {
				console.log("start")
				if (uniIsReady) {
					uni.postMessage({
						data: {
							// islogin: 'login',
							// 传入方法必须为methods，以数组形式
							methods: [{
								/* isasync，是否异步，如果异步则fun为promise */
								isasync: true,
								fun() {
									console.log(haha)
								},
							}],
							// 变量名
							jssrc:"",
							url:{
								type:"tab",
								data:"/tem/tem"
							},
							
						}
					})
					// alert(token)
				} else {
					this.timer = setTimeout(() => {
						this.ling()
					}, 1000)
				}
			}
		}
	})
```

以上只是个例子，具体怎么写还是看个人思路，核心思想就是通过监听webview向app端发送数据从而让app端实现各种效果，或者注入js实现向webview的通信（webview发送postMessage，app端通过其中信息再注入js到webview）


	