最近有个需求是实现报文的一个展示，需要满足 xml，json、普通字符串的展示及高亮，网上查阅资料后，使用 hljs 和 vkbeautify 组合的居多。
首先是 vkbeautify，他是一个做格式化的工具，可以将 xml、json 字符串做格式化处理，处理后的字符串直接放入 pre+code 的标签就会直接显示格式化好的样子，hljs 是一个做代码高亮的工具，他们搭配正好可以实现报文的格式化和高亮
使用方法很简单

```javascript
import vkbeautify from 'vkbeautify'
import hljs from 'highlight.js/lib/core'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import plaintext from 'highlight.js/lib/languages/plaintext'
//vscode风格的代码高亮
import 'highlight.js/styles/vs2015.css'
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('plaintext', plaintext)
//此处使用了按需引入的方式,hljs本身支持按需和全量,全量引入无需registerLanguage
//vkbeautify.xml() vkbeautify.json() 分别为对xml和json格式化
//对指定的el进行高亮
document.querySelectorAll('pre code').forEach(el => {
  hljs.highlightElement(el)
})
```

```xml
<pre style={{ overflowX: "auto" }}>
                    <code data-type={index} className={"language-" + item.type}>
                    {/*item.code是通过vkbeautify 格式化后的string*/}
                      {item.code}
                    </code>
                    {/* <code className={"language-" + item.type}>{item.code}</code> */}
                  </pre>
```

##### 需注意的点

1.vkbeautify.json 方法格式化会调用 JSON.parse,需考虑处理 json 格式不规范的 error
2.hljs 默认不进行换行处理,换行要加上`.hljs{
	white-space: pre-wrap;
	word-wrap: break-word;
}` 3.处理巨量内容时 hljs 会慢,可以考虑异步渲染,首先显示出内容,然后再异步调用 hljs.highlightElement
