使用的是xcopy命令，文档地址在[xcopy | Microsoft Docs](https://docs.microsoft.com/zh-cn/windows-server/administration/windows-commands/xcopy)
在复制前端项目时，依赖过于多，多个项目尤其难受
使用`xcopy 要复制的文件夹路径 复制到的路径 /s /e /exclude:一个文本文档的路径如11.txt`
在文本文档内写入`node_modules`将排除目录 node_modules下的所有文件或扩展名为 .node_modules的所有文件。详细文档上文已贴出。
