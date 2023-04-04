# 前言

关于 table 的合并，官方给的案例及其简单，所以当项目遇到此类问题，踩坑是无法避免的，其合并原理类似 html 的 table 合并。

## 例如：

我需要合并第一行到第三行，列为第一列时，其第一行的 col 是 3，row 为 1，第一列的第二行第三行已被合并，则应返回 col 为 0，row 为 0。即

```javascript
objectSpanMethod({ rowIndex, columnIndex }) {
     const rowspan = 3
       if (columnIndex === 0) {
         if (rowIndex === 0) {
           return {
             rowspan: rowspan,
             colspan: 1
           }
         } else if (rowIndex < rowspan) {
           return [0, 0]
         }
       }
  }
```

当你返回 col 为 1，row 为 1 时，其进行的合并操作其实是自己合并自己，相当于没有合并

## 合并第一列

### 一般方案

```javascript

<el-table
      :data="tableData"
      :span-method="objectSpanMethod"
      border
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="categoryName" label="品类名称" align="center" width="180" />
      <el-table-column prop="userName" label="选品人" align="center" />
      <el-table-column prop="goodsId" label="商品编号" align="center" />
      <el-table-column prop="goodsName" label="商品名称" align="center" />
</el-table>




computed: {
    mergingRows() { // 表格数据列合并预处理,生成一个与行数相同的数组记录每一行设置的合并数
    // 如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
    // 如果不是第一条记录，则判断它与前一条记录是否相等，如果相等，
    // 则向mergingRows中添入元素0，并将前一位元素+1，表示合并行数+1，
    // 以此往复，得到所有行的合并数，0即表示该行不显示。
      const mergingRows = []
      let mergingPos = 0
      for (let i = 0; i < this.tableData.length; i++) { // tabledata 表格数据源
        if (i === 0) {
          mergingRows.push(1)
          mergingPos = 0
        } else {
          if (this.tableData[i].categoryName === this.tableData[i - 1].categoryName) {
          // 哪些数据是要合并的 合并的条件是什么 此处合并条件为categoryName 相同则进行合并
            mergingRows[mergingPos] += 1
            mergingRows.push(0)
          } else {
            mergingRows.push(1)
            mergingPos = i
          }
        }
      }
      return mergingRows
    }
  },
  methods:{
  objectSpanMethod({ rowIndex, columnIndex }) {
      if (columnIndex === 0) { // 第一列
        const _row = this.mergingRows[rowIndex]
        const _col = _row > 0 ? 1 : 0
        return {
          rowspan: _row,
          colspan: _col
        }
      }
    }
   }
```

### 优化后的方案

由于我们在使用过程中经常会有一个组件使用多个表格的情况，所以使用 computed 这种并不泛用，可以将其封装为一个高阶函数

```javascript
//支持传入tableData，返回一个objectSpanMethod方法，可根据实际需求修改
function objectSpan(tableData) {
  const mergingRows = tableData => {
    // 表格数据列合并预处理,生成一个与行数相同的数组记录每一行设置的合并数
    // 如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
    // 如果不是第一条记录，则判断它与前一条记录是否相等，如果相等，
    // 则向mergingRows中添入元素0，并将前一位元素+1，表示合并行数+1，
    // 以此往复，得到所有行的合并数，0即表示该行不显示。
    const mergingRows = []
    let mergingPos = 0
    for (let i = 0; i < tableData.length; i++) {
      // tabledata 表格数据源
      if (i === 0) {
        mergingRows.push(1)
        mergingPos = 0
      } else {
        if (tableData[i].name === tableData[i - 1].name) {
          // 哪些数据是要合并的 合并的条件是什么 此处合并条件为name 相同则进行合并
          mergingRows[mergingPos] += 1
          mergingRows.push(0)
        } else {
          mergingRows.push(1)
          mergingPos = i
        }
      }
    }
    return mergingRows
  }
  const data = mergingRows(tableData)
  return ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex === 0) {
      // 第一列
      const _row = data[rowIndex]
      const _col = _row > 0 ? 1 : 0
      return {
        rowspan: _row,
        colspan: _col,
      }
    }
  }
}
```

## 更加通用的方案

一般来说，首列的行合并已经可以满足绝大多数需求了，但有些时候，可能需要的是更复杂的全列行合并
在上面的方案中，通过判断 columnIndex===0 来将第一行的合并逻辑返回，同样的，我们可以创建一个数组，数组的每一项都是一个 mergingRows 的返回值，数组的顺序对应着行的顺序即可

```javascript
const tableColumn = [
  {
    label: 'a',
    prop: 'a',
    width: '220px',
  },
  {
    label: 'b',
    prop: 'b',
    width: '220px',
  },
]

function objectSpan(tableData) {
  const mergingRows = (tableData, prop) => {
    // 表格数据列合并预处理,生成一个与行数相同的数组记录每一行设置的合并数
    // 如果是第一条记录（索引为0），向数组中加入1，并设置索引位置；
    // 如果不是第一条记录，则判断它与前一条记录是否相等，如果相等，
    // 则向mergingRows中添入元素0，并将前一位元素+1，表示合并行数+1，
    // 以此往复，得到所有行的合并数，0即表示该行不显示。
    const mergingRows = []
    let mergingPos = 0
    for (let i = 0; i < tableData.length; i++) {
      // tabledata 表格数据源
      if (i === 0) {
        mergingRows.push(1)
        mergingPos = 0
      } else {
        if (prop === 'creditAmountUsed') {
          console.log(
            tableData[i][prop],
            tableData[i - 1][prop],
            tableData[i][prop] === tableData[i - 1][prop]
          )
        }
        if (tableData[i][prop] === tableData[i - 1][prop]) {
          // 哪些数据是要合并的 合并的条件是什么 此处合并条件为[prop]相同则进行合并
          mergingRows[mergingPos] += 1
          mergingRows.push(0)
        } else {
          mergingRows.push(1)
          mergingPos = i
        }
      }
    }
    return mergingRows
  }
  // tableColumn是一个描述你所写的el-table-column的
  let arr = tableColumn.map(item => item.prop)
  arr.unshift(arr[0])
  arr.push(arr[0])
  // 往前后各添加一条数据是因为对前面或后面没有放入tableColumn的采用与a相同的合并策略，此处按实际情况即可
  arr = arr.map(item => mergingRows(tableData, item))
  return ({ row, column, rowIndex, columnIndex }) => {
    // 对于arr后面没有进行描述的列采取不进行行合并
    if (columnIndex >= arr.length) return
    const _row = arr[columnIndex][rowIndex]
    const _col = _row > 0 ? 1 : 0
    return {
      rowspan: _row,
      colspan: _col,
    }
  }
}
```
