## 起因
 由于业务需求，出于代码效率考虑，对于某报告的详情采用动态路由+动态组件的方式，对于详情的路由入口页面进行数据封装，通过componet传入数据，每个详情页面只需要处理渲染，但在import函数使用过程中却遇到了Cannot read property ‘range‘ of null的报错，网上百度的方案是改为require函数
 ## 探究原因
 在今天加班的时候，详情这块功能基本结束，但还是好奇为什么import函数为什么会报错，毕竟在路由里使用并没有问题，他们之间的区别是一个是在js使用一个是在vue文件里使用，所以首先怀疑的是是不是vue文件编译导致import函数出现了问题，于是将import函数写入了js文件并mixin入vue中，结果依旧。这时候有点挠头了，不应该啊，于是我试了试把router那里的import粘过来，报错取消了，这说明import函数是能使用的，难道是动态参数的原因？将原来代码的动态参数去掉后依旧报错，而此时，他和能正常运行的代码只有一个差距，报错的代码使用了es6的模板字符串。
 ## 结论
 在使用import函数的时候，当使用了es6的模板字符串作为参数时会报Cannot read property ‘range‘ of null这个错误，将其改为正常的字符串即可（可能是我所使用的版本对于没有进行编译的es6语法的支持问题）

> 补充下import函数，import函数会通过promise引入其参数路径的文件，实现vue组件的异步引入，常用在vue路由中，它的参数必须是一个表达式，这个表达式的结果应该是一个字符串
> 以下为webpack5的相关文档
> import()
function(string path):Promise
动态的加载模块。调用 import 的之处，被视为分割点，意思是，被请求的模块和它引用的所有子模块，会分割到一个单独的 chunk 中。
Tip
ES2015 Loader 规范 定义了 import() 方法，可以在运行时动态地加载 ES2015 模块。
if (module.hot) {
  import('lodash').then((_) => {
    // Do something with lodash (a.k.a '_')...
  });
}
Warning
import() 特性依赖于内置的 Promise。如果想在低版本浏览器中使用 import()，记得使用像 es6-promise 或者 promise-polyfill 这样 polyfill 库，来预先填充(shim) Promise 环境。
import() 中的表达式
不能使用完全动态的 import 语句，例如 import(foo)。是因为 foo 可能是系统或项目中任何文件的任何路径。
import() 必须至少包含一些关于模块的路径信息。打包可以限定于一个特定的目录或文件集，以便于在使用动态表达式时 - 包括可能在 import() 调用中请求的每个模块。例如， import(\`./locale/\${language}.json\`) 会把 .locale 目录中的每个 .json 文件打包到新的 chunk 中。在运行时，计算完变量 language 后，就可以使用像 english.json 或 german.json 的任何文件。
// 想象我们有一个从 cookies 或其他存储中获取语言的方法
const language = detectVisitorLanguage();
import(\`./locale/\${language}.json\`).then((module) => {
  // do something with the translations
});
Tip
使用 webpackInclude and webpackExclude 选项可让你添加正则表达式模式，以减少 webpack 打包导入的文件数量。
Magic Comments
内联注释使这一特性得以实现。通过在 import 中添加注释，我们可以进行诸如给 chunk 命名或选择不同模式的操作。
// 单个目标
import(
  /\* webpackChunkName: "my-chunk-name" \*/
  /\* webpackMode: "lazy" \*\/
  /\* webpackExports: ["default", "named"] \*/
  'module'
);
// 多个可能的目标
import(
  /\* webpackInclude: /\.json\$/ \*/
  /\* webpackExclude: /\.noimport\.json\$/ \*/
  /\* webpackChunkName: "my-chunk-name" \*/
  /\* webpackMode: "lazy" \*/
  /\* webpackPrefetch: true \*/
  /\* webpackPreload: true \*/
  \`./locale/\${language}\`
);
import(/\* webpackIgnore: true \*/ 'ignored-module.js');
webpackIgnore：设置为 true 时，禁用动态导入解析。
Warning
注意：将 webpackIgnore 设置为 true 则不进行代码分割。
webpackChunkName: 新 chunk 的名称。 从 webpack 2.6.0 开始，占位符 [index] 和 [request] 分别支持递增的数字或实际的解析文件名。 添加此注释后，将单独的给我们的 chunk 命名为 [my-chunk-name].js 而不是 [id].js。
webpackMode：从 webpack 2.6.0 开始，可以指定以不同的模式解析动态导入。支持以下选项：
'lazy' (默认值)：为每个 import() 导入的模块生成一个可延迟加载（lazy-loadable）的 chunk。
'lazy-once'：生成一个可以满足所有 import() 调用的单个可延迟加载（lazy-loadable）的 chunk。此 chunk 将在第一次 import() 时调用时获取，随后的 import() 则使用相同的网络响应。注意，这种模式仅在部分动态语句中有意义，例如 import(\`./locales/\${language}.json\`)，其中可能含有多个被请求的模块路径。
'eager'：不会生成额外的 chunk。所有的模块都被当前的 chunk 引入，并且没有额外的网络请求。但是仍会返回一个 resolved 状态的 Promise。与静态导入相比，在调用 import() 完成之前，该模块不会被执行。
'weak'：尝试加载模块，如果该模块函数已经以其他方式加载，（即另一个 chunk 导入过此模块，或包含模块的脚本被加载）。仍会返回 Promise， 但是只有在客户端上已经有该 chunk 时才会成功解析。如果该模块不可用，则返回 rejected 状态的 Promise，且网络请求永远都不会执行。当需要的 chunks 始终在（嵌入在页面中的）初始请求中手动提供，而不是在应用程序导航在最初没有提供的模块导入的情况下触发，这对于通用渲染（SSR）是非常有用的。
webpackPrefetch：告诉浏览器将来可能需要该资源来进行某些导航跳转。查看指南，了解有关更多信息 how webpackPrefetch works。
webpackPreload：告诉浏览器在当前导航期间可能需要该资源。 查阅指南，了解有关的更多信息 how webpackPreload works。
Tip
注意：所有选项都可以像这样组合 /\* webpackMode: "lazy-once", webpackChunkName: "all-i18n-data" \*/。这会按没有花括号的 JSON5 对象去解析。它会被包裹在 JavaScript 对象中，并使用 node VM 执行。所以你不需要添加花括号。
webpackInclude：在导入解析（import resolution）过程中，用于匹配的正则表达式。只有匹配到的模块才会被打包。
webpackExclude：在导入解析（import resolution）过程中，用于匹配的正则表达式。所有匹配到的模块都不会被打包。
Tip
注意，webpackInclude 和 webpackExclude 不会影响到前缀，例如 ./locale。
webpackExports: 告知 webpack 只构建指定出口的动态 import() 模块。它可以减小 chunk 的大小。从 webpack 5.0.0-beta.18 起可用。
##### 以下是相关依赖的版本，希望对后续遇到此问题的人有帮助，如有错误，请指正
    "@vue/cli-plugin-babel": "~4.5.0",
    "@vue/cli-plugin-eslint": "~4.5.0",
    "@vue/cli-plugin-router": "~4.5.0",
    "@vue/cli-plugin-vuex": "~4.5.0",
    "@vue/cli-service": "~4.5.0",
    "babel-eslint": "^10.1.0",
    "babel-plugin-import": "^1.13.0",
    "babel-plugin-transform-remove-console": "^6.9.4",
    "eslint": "^6.7.2",
    "eslint-plugin-vue": "^6.2.2",
    "node-sass": "^4.14.1",
    "postcss-pxtorem": "^5.1.1",
    "sass-loader": "^8.0.2",
    "script-ext-html-webpack-plugin": "^2.1.4",
    "vue-template-compiler": "^2.6.11",
    "webpack-bundle-analyzer": "^3.8.0"
