## vue实现类似于el-table-column的当内容过长被隐藏时显示 tooltip的组件
### 前言

最近这家公司的项目有很多仅作展示的类似于报告的页面，但设计稿设计的极不合理的，在小屏宽度自适应的时候经常会出现文字展示不全或换行的问题，为了优化这类的显示效果，采用了给对应元素的设置title办法解决。但title的问题在于不管文字展示全不全都会展示，而且样式不能自定义。在element-ui的table组件中，可以通过设置show-overflow-tooltip属性来实现当内容过长被隐藏时显示 tooltip的效果，我们可以参考其原理实现类似的组件

### show-overflow-tooltip的实现原理

通过查看其源码可以发现，在对td渲染时，对td绑定了mouseenter和mouseleave两个事件，这两个事件对应的方法就是其原理，
```javascript 
return (
              <td
                style={ this.getCellStyle($index, cellIndex, row, column) }
                class={ this.getCellClass($index, cellIndex, row, column) }
                rowspan={ rowspan }
                colspan={ colspan }
                on-mouseenter={ ($event) => this.handleCellMouseEnter($event, row) }
                on-mouseleave={ this.handleCellMouseLeave }>
                {
                  column.renderCell.call(
                    this._renderProxy,
                    this.$createElement,
                    data,
                    columnsHidden[cellIndex]
                  )
                }
              </td>
            );
          }) 
```
#### handleCellMouseEnter方法：

```javascript 
handleCellMouseEnter(event, row) {
      const table = this.table;
      const cell = getCell(event);

      if (cell) {
        const column = getColumnByCell(table, cell);
        const hoverState = table.hoverState = {cell, column, row};
        table.$emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, event);
      }

      // 判断是否text-overflow, 如果是就显示tooltip
      const cellChild = event.target.querySelector('.cell');
      if (!(hasClass(cellChild, 'el-tooltip') && cellChild.childNodes.length)) {
        return;
      }
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange();
      range.setStart(cellChild, 0);
      range.setEnd(cellChild, cellChild.childNodes.length);
      const rangeWidth = range.getBoundingClientRect().width;
      const padding = (parseInt(getStyle(cellChild, 'paddingLeft'), 10) || 0) +
        (parseInt(getStyle(cellChild, 'paddingRight'), 10) || 0);
      if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth) && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip;
        // TODO 会引起整个 Table 的重新渲染，需要优化
        this.tooltipContent = cell.innerText || cell.textContent;
        tooltip.referenceElm = cell;
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none');
        tooltip.doDestroy();
        tooltip.setExpectedState(true);
        this.activateTooltip(tooltip);
      }
    },
```
排除多余的判断代码以及emit事件，其实这个方法只做了两件事：

1. 判断是否有省略号出现
 通过document.createRange方法获取对应cell元素所有子节点显示出来需要多少宽度，将计算的宽度与cell元素offsetWidth比较，如果计算的宽度大于offsetWidth说明元素产生了省略号；但其实不考虑兼容性更实用的方法其实应该是其后面的对cell元素的scrollWidth和offsetWidth的比较，scrollWidth的长度其实一般就是通过document.createRange计算的大小，但其在不同浏览器可能存在差异，可以看到源码里有几行注释写了为什么使用document.createRange方法计算的原因
2. 展示对应的tooltip，并对其设置tooltip需要展示的文字。使用cell.innerText || cell.textContent的原因而非innerHTML是因为存在传入了标签的原因；tooltip就是el-tooltip组件实例

到这里，我们已经可以实现判断一个元素是否有省略号的方法了，对于tooltip的相关代码我们可以放到后面分析

实现自己的isOverflow:

```javascript
isOverflow(el) {
      const computedStyle = document.defaultView.getComputedStyle(el, '')
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange()
      range.setStart(el, 0)
      range.setEnd(el, el.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      const padding =
    (parseInt(computedStyle['paddingLeft'], 10) || 0) +
    (parseInt(computedStyle['paddingRight'], 10) || 0)
      if (
        rangeWidth + padding > el.offsetWidth ||
    el.scrollWidth > el.offsetWidth
      ) {
        return true
      }
      return false
    }
```

#### handleCellMouseLeave方法：

```javascript 
handleCellMouseLeave(event) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        tooltip.setExpectedState(false);
        tooltip.handleClosePopper();
      }
      const cell = getCell(event);
      if (!cell) return;

      const oldHoverState = this.table.hoverState || {};
      this.table.$emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
    },
```
这个方法就相对的简单，只是对tooltip进行了隐藏

### el-tooltip一些文档没有的使用方法

在前文中可以看到，在对tooltip显示时，首先将对tooltip实例的referenceElm设置为了当前鼠标划入的元素，然后对popper元素进行隐藏，执行doDestroy，执行setExpectedState(true);最后调用this.activateTooltip(tooltip);
搜索代码可以发现this.activateTooltip其实只是对tooltip.handleShowPopper进行了防抖处理本质还是执行tooltip实例的handleShowPopper方法。前面这些步骤中referenceElm是设置在滑动入哪个元素时会显示的变量，接下来的时执行一些去除副作用代码，最后的setExpectedState(true)和handleShowPopper()才是真正的显示tooltip的方法，和tooltip源码的show方法相同，show方法会在元素focus时触发
```javascript 
show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    }
```
在对tooltip隐藏时，执行了两个方法setExpectedState(false)，handleClosePopper();和tooltip源码的hide方法相同
```javascript       
hide() {
    this.setExpectedState(false);
    this.debounceClose();
},
```
debounceClose就是对handleClosePopper的防抖

关于el-tooltip的源码有200行的main.js和200行的vue-popper.js，并借助了第三方库popper.js有兴趣的可以看看；popper.js很多ui框架都在用的

### 实现自己的overflow-tooltip组件

直接贴代码
```html
<script>
export default {
  props: {
    tooltipProps: {
      type: Object,
      default() {
        return {
          placement: 'top'
        }
      }
    }
  },
  data() {
    return {
      isShowTooltip: false,
      content: ''
    }
  },
  mounted() {
  },
  beforeDestroy() {
  },
  methods: {
    handleMouseEnter(event) {
      const el = this.$el
      this.isShowTooltip = this.isOverflow(el)
      this.content = el.innerText || el.textContent
      this.isShowTooltip && this.show()
    },
    handleMouseLeave(event) {
      this.hide()
    },
    show() {
      const tooltip = this.$refs.tooltip
      // TODO 会引起整个 Table 的重新渲染，需要优化
      tooltip.referenceElm = this.$el
      tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
      tooltip.doDestroy()
      tooltip.setExpectedState(true)
      tooltip.handleShowPopper()
    },
    hide() {
      const tooltip = this.$refs.tooltip
      if (tooltip) {
        tooltip.setExpectedState(false)
        tooltip.handleClosePopper()
      }
    },
    isOverflow(el) {
      const computedStyle = document.defaultView.getComputedStyle(el, '')
      // use range width instead of scrollWidth to determine whether the text is overflowing
      // to address a potential FireFox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
      const range = document.createRange()
      range.setStart(el, 0)
      range.setEnd(el, el.childNodes.length)
      const rangeWidth = range.getBoundingClientRect().width
      const padding =
    (parseInt(computedStyle['paddingLeft'], 10) || 0) +
    (parseInt(computedStyle['paddingRight'], 10) || 0)
      if (
        rangeWidth + padding > el.offsetWidth ||
    el.scrollWidth > el.offsetWidth
      ) {
        return true
      }
      return false
    }
  },
  render(h) {
    const { tooltipProps, content } = this
    return (
      <div class='overflow-tooltip'
        onMouseenter={ this.handleMouseEnter }
        onMouseleave={ this.handleMouseLeave }>
        <ElTooltip {...{ attrs: tooltipProps }} ref='tooltip' content={ content } ></ElTooltip>
        { this.$scopedSlots.default?.() }
      </div>
    )
  }

}
</script>

<style scoped>
.overflow-tooltip>*{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
```
tooltipProps属性是设置el-tooltip的各个props。通过实现show和hide方法以及修改对应的标签，可以将各种第三方的tooltip或者自己封装的tooltip组合使用