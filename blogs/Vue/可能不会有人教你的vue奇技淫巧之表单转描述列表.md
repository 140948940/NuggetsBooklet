# 可能不会有人教你的 vue 奇技淫巧之表单转描述列表

**恰逢大概率接下来会失去工作的机会，把近些年做的一些东西整理下，给面试吹牛逼用**

**偶尔看到的几段源码可能会在之后帮到你大忙。**

**免责声明：原来没写注释，现在的注释 MarsCode 加的，有问题找它**

## 简介

起源是我在工作中遇到的一个比较奇葩的需求，一般给表单做回显时，都是加个 disabled 状态做回显，省事并且数据展示都和提交时一致，但是需求方嫌丑，要求把表单做成描述列表（element-ui 的 Descriptions 组件）。

## 思路

然而当时整个系统开发了能有一年多了，大大小小累积的表单组件数不胜数，摆在我面前的路就是挨个写过去，吗？虽然有其他小伙伴协助，这也是个大工程。这需求除了费时间也没啥技术量，但我寻思着都是 key-value 形式，能否把表单里的 key 和 value 想个办法提取出来，直接用用 Descriptions 组件展示呢？key 无非就是 label 属性或者 lable slot 里的内容，而 value 就是每个 el-form-item 里的组件展示出来的值。
最开始的思路是通过原生的 DOM 方法取值，然后找出 key 和 value，可实际上哪有那么简单，这个匹配方法写出来我估计人都升天了，更何况还有小部分的表单是表格之类的，做不了一点。
最后我的决定是试试能不能通过 vue 实例来拿到表单里的组件，通过 vue 实例的$children 来递归拿到所有的 el-form-item 组件，然后尝试提取出 key 和 value。
首先写一下找对应组件实例的代码:

```javascript
/**
 * 在给定的组件中查找指定名称的组件
 * @param {VueComponent} component - 要搜索的组件
 * @param {string} name - 要查找的组件的名称
 * @param {boolean} [deep=false] - 是否深度搜索子组件
 * @param {boolean} [greedy=false] - 是否在找到第一个匹配项后停止搜索
 * @return {VueComponent[]} - 找到的组件列表
 */
export function findComponentByName(
  component,
  name,
  deep = false,
  greedy = false
) {
  let componentList = []
  const children = component?.$children || []
  children.forEach(com => {
    if (com.$options.name === name) {
      componentList.push(com)
      if (greedy) return
    }
    if (deep) {
      componentList = componentList.concat(
        findComponentByName(com, name, deep, greedy)
      )
    }
  })

  return componentList
}
```

ok，现在找到了所有的 el-form-item 组件，接下来就是提取 key 和 value 了，但要注意的是，并不是所有组件都是需要提取的，比如我上面说的表格、或者是一些上传完成回显的组件等等，所以难点其实不是在提取 key 和 value 上，而是在不展示 value 的时候，如何将原来的组件原样展示。正好 vue 能做到这点，众所周知 vue 采用虚拟 dom patch 生成的真实 dom，只要拿到虚拟 dom 就等于拿到了这个组件渲染后的数据，如果看过点 vue 源码或者 console 过 vue 实例就知道每个实例对应的 vnode 其实就是 vm.$vnode。
提取 key（label）有两种方式，但我们一直没用过 slot 的方式，所以直接取 el-form-item 实例的 label 即可。
提取 value 则是拿到 el-form-item 下的所有子组件，针对不同组件做不同的处理即可，只需要看下对应组件的源码，例如 el-input 用的 value、el-select 用的 selected 或者 selectedLabel 等。

```javascript
/**
 * 获取指定组件实例的值和虚拟节点
 * @param {string} componentName - 组件的名称
 * @param {VueComponent} elInstance - 组件实例
 * @return {Object} - 包含值、虚拟节点和是否有枚举的对象
 */
export function getElementComponentValue(componentName, elInstance) {
  function timePicker(elInstance) {
    return !elInstance.ranged
      ? elInstance.displayValue
      : (elInstance.displayValue && elInstance.displayValue[0]) +
          elInstance.rangeSeparator +
          (elInstance.displayValue && elInstance.displayValue[1])
  }
  function input(elInstance) {
    return elInstance.value ? elInstance.value : ''
  }
  function elInputNumber(e) {
    return e.value ? e.value : ''
  }
  // 将组件名称映射到对应的取值函数或属性名
  const valueEnum = {
    ElInput: input,
    ElInputNum: 'inputValue',
    ElCascader(elInstance) {
      return elInstance.multiple
        ? elInstance.presentTags.map(item => item.text)
        : elInstance.presentText
        ? elInstance.presentText
        : ''
    },
    ElSelect(elInstance) {
      return elInstance.multiple
        ? elInstance.selected.map(item => item.currentLabel)
        : elInstance.selectedLabel
    },
    ElInputNumber: elInputNumber,
    ElDatePicker: timePicker,
    ElTimePicker: timePicker,
  }
  let value = null
  let vnode = null
  let hasEnum = true
  // 检查是否有对应组件名称的取值函数或属性
  if (valueEnum[componentName]) {
    // 调用对应的取值函数或获取属性值
    value =
      typeof valueEnum[componentName] === 'function'
        ? valueEnum[componentName](elInstance)
        : elInstance[valueEnum[componentName]]
  } else {
    hasEnum = false
  }
  // 克隆组件的虚拟节点
  vnode = cloneVNode(elInstance.$vnode, elInstance.$createElement)
  return {
    value,
    vnode,
    hasEnum,
  }
}
```

该有的东西都有了，下面该思考的是如何以最小成本对相应的组件进行改动了。一种思路，直接重写 el-form，使其能直接渲染出描述列表，但这种太暴力了，会影响到部分不需要转为描述列表做展示的，并且写出 bug 的很大。另一种思路就是针对需要转换的页面进行处理，在 el-form 外层嵌套一层组件，该组件针对不同的属性做出不同的处理，最简单的就是传个值，需要展示表单就不做处理，不需要展示就把表单隐藏展示描述列表里。
以下是完整示例，可供参考：

```vue
<script>
// 导入自定义工具函数
import { findComponentByName, getElementComponentValue } from './util.js'
export default {
  name: 'FormToDescription', // 组件名称
  props: {
    descriptionVisiable: {
      // 用于控制描述区域的显示与隐藏
      type: Boolean,
      default: null,
    },
  },
  data() {
    return {
      isShowDescription: false, // 用于标识当前描述区域的显示状态
      descriptionData: [], // 用于存储描述数据
    }
  },
  provide() {
    return {}
  },
  computed: {},
  watch: {
    descriptionVisiable(val) {
      this.$nextTick(() => {
        this.isShowDescription = val
        this.getDescriptionData()
      })
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.isShowDescription = this.descriptionVisiable
      this.getDescriptionData()
    })
  },
  methods: {
    getSlotInstance() {
      // 获取所有插槽实例
      return this.$scopedSlots.default().map(t => t.componentInstance)
    },
    getFormItemInstance() {
      // 获取所有 form-item 实例
      const formItemInstance = this.getSlotInstance().flatMap(t =>
        findComponentByName(t, 'ElFormItem', true)
      )
      return formItemInstance
    },
    getDescriptionData() {
      // 获取描述数据
      const formItemInstance = this.getFormItemInstance()
      const keyValue = []
      formItemInstance.forEach(vm => {
        vm.$children.forEach(cvm => {
          // 排除 label-wrap 组件的子组件
          if (cvm.$vnode?.componentOptions?.tag === 'label-wrap') return
          const { value = null, vnode = null } = getElementComponentValue(
            cvm.$options.name,
            cvm
          )
          keyValue.push({
            label: vm.label,
            value,
            vnode,
          })
        })
      })
      this.descriptionData = keyValue
    },
    description() {
      // 渲染描述区域
      const keyValue = this.descriptionData
      return (
        <el-descriptions border>
          {keyValue.map(item => (
            <el-descriptions-item label={item.label}>
              {item.value || <span />}
              {item.value !== null ? null : item.vnode}
            </el-descriptions-item>
          ))}
        </el-descriptions>
      )
    },
    setDescriptionVisiable(val) {
      this.isShowDescription = val
    },
    hadleClick() {
      // 处理点击事件，切换描述区域的显示状态
      this.setDescriptionVisiable(!this.isShowDescription)
    },
  },
  render() {
    return (
      <div>
        {this.descriptionVisiable === null && (
          <el-button disabled={false} onClick={this.hadleClick}>
            点击
          </el-button>
        )}
        <div style={{ display: this.descriptionVisiable ? 'none' : '' }}>
          {this.$scopedSlots.default()}
        </div>
        {this.isShowDescription ? this.description() : ''}
      </div>
    )
  },
}
</script>
```
