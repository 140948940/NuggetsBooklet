 - 原内容在[[反馈]使用qiankun时，vue-devtools无法调试子项目](https://github.com/umijs/qiankun/issues/601)
 - 我采用了作者推荐的第二种方案进行解决
 

```javascript
instance = new Vue({
		router,
		store,
		i18n,
		render: h => h(App),
	}).$mount(container ? container.querySelector('#app') : '#app')
	if (process.env.NODE_ENV === 'development') {
		// vue-devtools  加入此处代码即可
		let instanceDiv = document.createElement('div')
		instanceDiv.__vue__ = instance
		document.body.appendChild(instanceDiv)
	}
```
