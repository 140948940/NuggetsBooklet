## 最近chatGPT特别火，突发奇想的想到了用ai进行代码重构的话会不会有奇效，于是拿出了一段以前写的计算所有sku组合的代码

```javascript
let arr1 = [
  ["a", "b", "c"],
  ["1", "2", "3"],
  ["找", "和", "是"],
  ["无语", "拒绝", "天啊"],
];
function cp(arr) {
  let count = 0;
  let finallyArr = [];
  let needCombinationArr = [];
  finallyArr = arr[count];
  for (let i = 0; i < arr.length-1; i++) {
    needCombinationArr = [finallyArr, arr[count + 1]];
    finallyArr = combination(needCombinationArr);
    count++;
  }
  return finallyArr
}
function combination(needCombinationArr) {
    let item1 = needCombinationArr[0];
    let item2 = needCombinationArr[1];
    let ji = [];
    for (let index1 = 0; index1 < item1.length; index1++) {
      const element1 = item1[index1];
      for (let index2 = 0; index2 < item2.length; index2++) {
        const element2 = item2[index2];
        let element = Array.isArray(element1) ? element1 : [element1];
        ji.push([...element, element2]);
      }
    }
    return ji;
  }
cp(arr1)
```
输入这段代码，让ai进行优化
ai输出
```javascript
function cp(arr) {
    let finallyArr = arr[0];
    for (let i = 1; i < arr.length; i++) {
      finallyArr = combination(finallyArr, arr[i]);
    }
    return finallyArr
  }
  function combination(arr1, arr2) {
    console.log(arr1,arr2)
      let ji = [];
      for (let index1 = 0; index1 < arr1.length; index1++) {
        const element1 = arr1[index1];
        for (let index2 = 0; index2 < arr2.length; index2++) {
          const element2 = arr2[index2];
          let element = Array.isArray(element1) ? element1 : [element1];
          console.log(element1,element2)
          ji.push([...element, element2]);
        }
      }
      return ji;
    }
  cp(arr1)
```
可以看到，ai优化后的代码去掉了其实并没啥用的count，将needCombinationArr 的值直接用入参进行了接收，大大减少了代码量，还是挺简洁的。
分析一下代码，会发现cp函数其实主要功能就是循环调用combination，并将combination返回值再次传入给combination，是不是和数组方法reduce特别像呢，这次继续将原有代码进行传入，并让它使用reduce方法优化，生成后的代码如下：
```javascript
  let arr1 = [
    ["a", "b", "c"],
    ["1", "2", "3"],
    ["找", "和", "是"],
    ["无语", "拒绝", "天啊"],
  ];
  
  function cp(arr) {
    return arr.reduce((pre, cur) => {
      let temp = [];
      pre.forEach(item1 => {dan
        cur.forEach(item2 => {
          let element = Array.isArray(item1) ? item1 : [item1];
          temp.push([...element, item2]);
        });
      });
      return temp;
    });
  }
  cp(arr1)
```
当我尝试对ai再加入写上注释这个条件时
```javascript
function cp(arr) {
    return arr.reduce((pre, cur) => {
      // 将上一次返回的结果和当前项进行组合，得到最新结果
      return combination([pre, cur]);
    });
  }
  function combination(needCombinationArr) {
      let item1 = needCombinationArr[0];
      let item2 = needCombinationArr[1];
      let ji = [];
      for (let index1 = 0; index1 < item1.length; index1++) {
        const element1 = item1[index1];
        for (let index2 = 0; index2 < item2.length; index2++) {
          const element2 = item2[index2];
          let element = Array.isArray(element1) ? element1 : [element1];
          ji.push([...element, element2]);
        }
      }
      return ji;
    }
  cp(arr1)
```
后面又试了将代码转为ts代码，发现也是可行的，这样看来以后的代码重构貌似真有可能可以让ai来实现了