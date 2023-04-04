```javascript
heightToTop(ele) {
			//ele为指定跳转到该位置的DOM节点
			let root = document.body
			let height = 0
			do {
				height += ele.offsetTop
				ele = ele.offsetParent
			} while (ele !== root)
			return height
		},
		// 定位element的Erro
		eleScrollErro() {
			this.$nextTick(() => {
				let isError = document.getElementsByClassName('is-error')
				// console.log(isError)
				// alert(isError[0].offsetTop)
				document
					.querySelector('.main-container')
					.scrollTo({ behavior: 'smooth', top: this.heightToTop(isError[0]) - 60 })
			}, 500)
		},
		// 定位非element的Erro
		scrollErro(sectionWp) {
			document
				.querySelector('.main-container')
				.scrollTo({ behavior: 'smooth', top: this.$refs[sectionWp].offsetTop })
		},
```
