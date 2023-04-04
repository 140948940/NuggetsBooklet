 - 最近有加pc端的分享的需求，百度+自己写写了个整合的函数，以备后用
  

```javascript
	var imageUrl
	// 分享图片链接
	var title, url, description, keywords;
	
	function shareTo(types) {

		

		//获取文章标题
		title = document.title;

		//当内容中没有图片时，设置分享图片为网站logo

		//获取当前网页url
		url = document.location.href;

		//获取网页描述
		description = document.querySelector('meta[name="description"]').getAttribute('content');

		//获取网页关键字
		keywords = document.querySelector('meta[name="keywords"]').getAttribute('content');

		//qq空间接口的传参
		if (types == 'qzone') {
			window.open('https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + url + '&sharesource=qzone&title=' +
				title + '&pics=' + imageUrl + '&summary=' + description);
		}
		//新浪微博接口的传参
		if (types == 'sina') {
			window.open('http://service.weibo.com/share/share.php?url=' + url + '&sharesource=weibo&title=' + title+' ' +description+ '&pic=' +
				imageUrl + '&appkey=2706825840');
		}
		//qq好友接口的传参
		if (types == 'qq') {
			window.open('http://connect.qq.com/widget/shareqq/index.html?url=' + url + '&sharesource=qzone&title=' + title +
				'&pics=' + imageUrl + '&summary=' + description + '&desc=' + keywords);
		}
		//生成二维码给微信扫描分享
		if (types == 'wechat') {
			//以下为jquery插件jquery.qrcode.min.js，最好提前生成划过或点击时显示
			jQuery('.qrcode').qrcode({
			    render: "canvas", //也可以替换为table
			    width: 100,
			    height: 100,
			    text: window.location.href
			});
			
		}
		//豆瓣
		if (types=='douban'){
			window.open('http://www.douban.com/recommend/?url='+encodeURIComponent(document.location.href)+'&title='+encodeURIComponent(document.title));
		}
		// 复制
		if (types=='copy'){
			var input = document.createElement('input');
			   document.body.appendChild(input);
			   input.setAttribute('value', window.location.href);
			   input.select();
			   if (document.execCommand('copy')) {
			       document.execCommand('copy');
			       // console.log('复制成功');
				   // 使用的layui，复制成功后操作自己写
				   layer.msg('<div class="jyalert"><div class="hd">' + '复制成功' + '</div></div>', {
						area: 'auto',
						title: '<i class="logo"></i>',
						shade: [0.7, '#222e39'],
						scrollbar: false,
						closeBtn: false,
						time: 2000,
						btn: false,
					}, function() {

					});
			   }
			document.body.removeChild(input);
		}

	}
```
