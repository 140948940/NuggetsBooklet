好久没写博客了，最近事事不顺心...
谈下uniapp热更新的实现，其实东西多百度下，在Dcloud官方论坛也能找到，但里面优劣不一，看的比较痛苦

实现原理很简单，就是在app启动时即onLaunch里(首页也行，首页甚至可以写出更好的效果，也可以在onLaunch里判断跳转的路径)进行版本号校验请求（这里完全就是按需求校验了），当后台返回了下载链接时，启用下载，下载完成后进行安装


```javascript
 updateVersion() {
      // #ifdef APP-PLUS
      let plateform = "";
      if (plus.os.name == "Android") {
        plateform = "android";
      } else {
        plateform = "ios";
      }
      let self = this;
      // plus.runtime.getProperty所查询到的version为配置文件里的版本号，plus.runtime.version所查询到的version为打包时的version，在热更新后plus.runtime.getProperty会变为热更包的version，但plus.runtime.version不会变
      plus.runtime.getProperty(plus.runtime.appid, function (widgetInfo) {
        self.$http
          .get("/api/update", {
            params: {
              version: widgetInfo.version,
              // version:plus.runtime.version,
              // version:'1.0.1',
              name: plateform,
            },
          })
          .then((res) => {
            console.log({
              params: {
                version: widgetInfo.version,
                // version:plus.runtime.version,
                // version:'1.0.1',
                name: plateform,
              },
            });
            console.log(res, "res");
            console.log(res.code, "res.code");
            if (res.code === 0) {
              console.log(res.data.update, "res.data.update");
              console.log(res.data.wgt_url, "res.data.wgt_url");
			  
              if (res.data.update == true && res.data.wgt_url !== null) {
				  uni.showLoading({
				  	title:'更新资源中'
				  })
                uni.downloadFile({
                  url: res.data.wgt_url,
                  success: (downloadResult) => {
					  uni.showLoading({
					  	title:'更新应用中'
					  })
                    if (downloadResult.statusCode === 200) {
                      console.log("下载");
                      console.log(downloadResult.tempFilePath);
                      plus.runtime.install(
                        downloadResult.tempFilePath,
                        {
                        //false为更新热更包时进行版本校验，true为不校验
                          force: false,
                        },
                        function (e) {
							uni.hideLoading()
                          console.log(e, "成功");
                          // 重启应用
                          plus.runtime.restart();
                        },
                        function (e) {
							uni.showLoading({
								title:'更新资源失败'
							})
                          console.log(e, "失败");
                          uni.showModal({
                            title: `热更新版本号校验失败，是否进行热更新`,

                            content: res.data.note || "最新版本",

                            // showCancel: false,

                            success: (res) => {
                              if (res.confirm) {
                                plus.runtime.install(
                                  downloadResult.tempFilePath,
                                  {
                                    force: true,
                                  },
                                  function (e) {
                                    console.log(e, "成功");
                                    // self.loginOut();
                                    plus.runtime.restart();
                                  },
                                  function (e) {
                                    console.log(e, "失败");
                                  }
                                );
                              }
                            },
                          });
                        }
                      );
                    }
                  },
                  fail(err) {
					  uni.hideLoading()
					  uni.showToast({
					  	title:'更新失败',
						icon:'none'
					  })
                    console.log(err, "err");
                  },
                });
              }
              if (res.data.update == true && res.data.pkg_url !== null) {
                let pkg_url = res.data.pkg_url;
                uni.showModal({
                  //提醒用户更新
                  title: `版本：${res.data.version}`,
                  content: res.data.note || "最新版本",
                  showCancel: false,
                  success: (res) => {
                    if (res.confirm) {
                      plus.runtime.openURL(pkg_url);
                    }
                  },
                });
              }
            }
          })
          .catch((err) => {
            console.log(err, "err");
          });
      });
      // #endif
    }
```

 - 热更新后应用出现问题大概率是由于打包的wgt包出了问题，重新打包一个即可，无法安装热更新包有可能是因为未添加安装权限（推测...）
 -  // 安装权限
                    "<uses-permission android:name=\"android.permission.INSTALL_PACKAGES\"/>",
                    "<uses-permission android:name=\"android.permission.REQUEST_INSTALL_PACKAGES\"/>"
 
 - 若有不对之处，望指正
