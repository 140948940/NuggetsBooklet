### ts 曾经碰到过这个问题

```typescript
type Test<T extends Record<symbol, unknown>> = T

type Result = Test<{
  a: string
}>
//这个例子本意是限制只能使用symbol做为属性，可当传入a属性时，竟然是符合的
```

后来找到了[答案](https://stackoverflow.com/questions/71230709/why-isnt-it-working-t-extends-recordsymbol-unknown/71230886#71230886)
也引出了隐式索引签名

> 隐式索引签名
> 如果对象文字中的所有已知属性都可以分配给该索引签名，则对象文字类型现在可以分配给具有索引签名的类型。这使得可以将使用对象文字初始化的变量作为参数传递给需要映射或字典的函数：
> function httpService(path: string, headers: { [x: string]: string }) {}
> const headers = {
> "Content-Type": "application/x-www-form-urlencoded",
> };
> httpService("", { "Content-Type": "application/x-www-form-urlencoded" }); // Ok
> httpService("", headers); // Now ok, previously wasn't

解决方案是将 string 和 number 做为 key 时的类型限制为 never

```typescript
type Test<T extends Record<symbol, unknown> & Record<string | number, never>> =
  T

type Result = Test<{
  // ! error, string/number keys should be type never
  a: string
}>
```

### 判断对象是否为空对象

```typescript
type isEmpty<T extends Record<string | symbol, unknown>> = keyof T extends never
  ? true
  : false
```

### 将 T 类型的 K 属性变为可选

在使用 delete 操作符时经常会遇到的问题，我们希望必须传入这个属性但在后面的使用中可能会删除它

```typescript
// Omit从T中取出除了K以外的属性  Partial作用是将传入的属性变为可选项.Pick从T中取出一系列K的属性
type makeTypeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
```
