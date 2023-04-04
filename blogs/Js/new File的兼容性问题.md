
**采用bable+core.js在现代前端是最好的方案**
## 以下作废
~~今天遇到了有客户说在edge浏览器下无法上传图片的问题，寻找了个老的edge浏览器测了一下，果然不行，原因是new File在老版edge上不支持，当然ie也不用想了，解决方案是采用blob上传~~
```javascript
// base64 转 files   这是原来的写法
dataURLtoFile(dataURI, fileName) {
				var arr = dataURI.split(',');
				var byteString = atob(arr[1]);
				var mime = arr[0].match(/:(.*?);/)[1];
				var ab = new ArrayBuffer(byteString.length);
				var ia = new Uint8Array(ab);
				for (var i = 0; i < byteString.length; i++) {
					ia[i] = byteString.charCodeAt(i);
				}
				return new File([ia], fileName, {
					type: mime,
					lastModified: Date.now()
				})
			}
			
let formData = new FormData();
let resFile = this.dataURLtoFile(resbase64,'filename_' + files[i].name);
formData.append('file', resFile);
```
后来的写法

```javascript
 base64 转 Blob
dataURLtoBlob(toDataURL) {
				var arr = toDataURL.split(","),
					mime = arr[0].match(/:(.*?);/)[1],
					bstr = atob(arr[1]),
					n = bstr.length,
					u8arr = new Uint8Array(n);
				while (n--) {
					u8arr[n] = bstr.charCodeAt(n);
				}
				return new Blob([u8arr], {
					type: mime
				});
			},
//转成file
blobToFile(Blob, fileName) {
				Blob.lastModifiedDate = new Date();
				Blob.name = fileName;
				return Blob;
			}



let formData = new FormData();
let bold = this.dataURLtoBlob(resbase64);
//this看情况，我是用的vue写在methods里的，正常当然不用this
let resFile = this.blobToFile(bold, 'filename_' + files[i].name);
formData.append('file', resFile);
```
