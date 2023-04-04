# cropper - 裁剪图片 - IE9+

## 使用 cropperjs

```javascript
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
this.myCropper = new Cropper('被裁剪对象', '配置对象') //返回一个cropper对象

this.myCropper.getCroppedCanvas().toDataURL('image/jpeg') //拿到裁剪后的base64的图片
this.myCropper.getCropBoxData() //获取裁剪框数据
this.myCropper.setCropBoxData() //设置裁剪框数据
this.myCropper.getCanvasData() //获取图片数据
this.myCropper.setCanvasData() //设置图片数据
```

## 配置对象

> https://github.com/fengyuanchen/cropperjs
> **注意：第一个值为默认值**

- viewMode 视图控制
  - 0 无限制
  - 1 限制裁剪框不能超出图片的范围
  - 2 限制裁剪框不能超出图片的范围 且图片填充模式为 cover 最长边填充
  - 3 限制裁剪框不能超出图片的范围 且图片填充模式为 contain 最短边填充
- dragMode 拖拽图片模式
  - crop 形成新的裁剪框
  - move 图片可移动
  - none 什么也没有
- initialAspectRatio 裁剪框宽高比的初始值 默认与图片宽高比相同 只有在 aspectRatio 没有设置的情况下可用
- aspectRatio 设置裁剪框为固定的宽高比
- data 之前存储的裁剪后的数据 在初始化时会自动设置 只有在 autoCrop 设置为 true 时可用
- preview 预览 设置一个区域容器预览裁剪后的结果
  - Element, Array (elements), NodeList or String (selector)
- responsive 在窗口尺寸调整后 进行响应式的重渲染 默认 true
- restore 在窗口尺寸调整后 恢复被裁剪的区域 默认 true
- checkCrossOrigin 检查图片是否跨域 默认 true 如果是 会在被复制的图片元素上加上属性 crossOrigin 并且在 src 上加上一个时间戳 避免重加载图片时因为浏览器缓存而加载错误
- checkOrientation 检查图片的方向信息（仅 JPEG 图片有）默认 true 在旋转图片时会对图片方向值做一些处理 以解决 IOS 设备上的一些问题
- modal 是否显示图片和裁剪框之间的黑色蒙版 默认 true
- guides 是否显示裁剪框的虚线 默认 true
- center 是否显示裁剪框中间的 ‘+’ 指示器 默认 true
- highlight 是否显示裁剪框上面的白色蒙版 （很淡）默认 true
- background 是否在容器内显示网格状的背景 默认 true
- autoCrop 允许初始化时自动的裁剪图片 配合 data 使用 默认 true
- autoCropArea 设置裁剪区域占图片的大小 值为 0-1 默认 0.8 表示 80%的区域
- movable 是否可以移动图片 默认 true
- rotatable 是否可以旋转图片 默认 true
- scalable 是否可以缩放图片（可以改变长宽） 默认 true
- zoomable 是否可以缩放图片（改变焦距） 默认 true
- zoomOnTouch 是否可以通过拖拽触摸缩放图片 默认 true
- zoomOnWheel 是否可以通过鼠标滚轮缩放图片 默认 true
- wheelZoomRatio 设置鼠标滚轮缩放的灵敏度 默认 0.1
- cropBoxMovable 是否可以拖拽裁剪框 默认 true
- cropBoxResizable 是否可以改变裁剪框的尺寸 默认 true
- toggleDragModeOnDblclick 是否可以通过双击切换拖拽图片模式（move 和 crop）默认 true 当拖拽图片模式为 none 时不可切换 该设置必须浏览器支持双击事件
- minContainerWidth（200）、minContainerHeight（100）、minCanvasWidth（0）、minCanvasHeight（0）、minCropBoxWidth（0）、minCropBoxHeight（0） 容器、图片、裁剪框的 最小宽高 括号内为默认值 注意 裁剪框的最小高宽是相对与页面而言的 并非相对图片

## 方法

**注意：如果方法没有被设置返回任何值，那么它会返回一个 cropper 的实例 因此多个方法可以使用链式写法**

- crop() 手动显示裁剪框
- reset() 重置图片和裁剪框为初始状态
- replace(url[, hasSameSize]) 替换图片路径并且重建裁剪框
  - url 新路径
  - hasSameSize 默认值 false 设置为 true 表示新老图片尺寸一样 只需要更换路径无需重建裁剪框
- enable() 解冻 裁剪框
- disable() 冻结 裁剪框
- destroy() 摧毁裁剪框并且移除 cropper 实例
- move(offsetX[, offsetY]) 移动图片指定距离 一个参数代表横纵向移动距离一样
- moveTo(x[, y]) 移动图片到一个指定的点 一个参数代表横纵向移动距离一样
- zoom(ratio) 缩放 ratio 大于零是放大 小于零缩小
- zoomTo(ratio[, pivot]) 缩放并设置中心点的位置
- rotate(degree) 旋转 类似 css
- rotateTo(degree) 旋转到绝对角度
- scale(scaleX[, scaleY])、scaleX(scaleX)、scaleY(scaleY) 缩放 一个参数代表横纵向缩放值一样
- getData([rounded]) 返回裁剪区域基于原图片!原尺寸!的位置和尺寸 rounded 默认为 false 表示是否显示四舍五入后的数据 有了这些数据可以直接在原图上进行裁剪显示
- setData(data) 改变裁剪区域基于原图的位置和尺寸 仅当 viewMode 不为 0 时有效
- getContainerData()、getImageData()、getCanvasData()、setCanvasData(data)、getCropBoxData()、setCropBoxData(data) 容器、图片容器（画布）、图片、裁剪区域相对容器的数据设置和获取
- getCroppedCanvas([options]) 得到被裁剪图片的一个 canvas 对象 options 设置这个 canvas 的一些数据
  - width、height、minWidth、minHeight、maxWidth、maxHeight、fillColor、imageSmoothingEnabled（图片是否是光滑的 默认 true）、imageSmoothingQuality（图片的质量 默认 low 还有 medium、high）
- setAspectRatio(aspectRatio) 改变裁剪区域的宽高比
- setDragMode([mode]) 设置拖拽图片模式

## 事件

- ready 渲染前（图片已经被加载、cropper 实例已经准备完毕）的准备工作事件
- cropstart、cropmove、cropend、crop 开始画裁剪框（或画布）、画裁剪框（或画布）的中途、裁剪框（或画布）画完、进行裁剪事件 event.detail.originalEvent、event.detail.action
  - 当 autoCrop 为 true crop 事件会在 ready 之前触发
- zoom 裁剪框缩放事件
