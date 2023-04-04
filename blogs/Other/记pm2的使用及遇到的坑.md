# pm2的部分使用方法

## pm2开机自启动项目
### 以下为windows版本
1.全局安装pm2
```sh
npm install pm2 -g 
```
2.全局安装pm2 Win自启包：pm2-windows-startup：
```sh
npm install pm2-windows-startup -g
```

3.安装配置包：pm2-startup

pm2-startup install

4.使用方式
```sh
pm2 start xx.py #pm2 start xx.js
pm2 save
```

## pm2向原有的js或python程序提供命令行参数

```sh
pm2 start app.py --interpreter-args="arg1 arg2 arg3"  #pm2 start index.js --interpreter-args="arg1 arg2 arg3"
```

## pyhony程序使用pm2启动后log中文乱码 （windows系统）
```sh
pm2 start app.py --name myapp --env LANG=zh_CN.UTF-8
```


## 启动一个main.py程序设置中文log不乱码、传入--demo命令行参数，将其设置为开机自启动程序,name设置为demo
```sh
pm2 start ./main.py --name demo --env LANG=zh_CN.UTF-8 -- --demo  #前面命令在windows中并不起作用可以采用下面的方案
```
### 在windows下-- --demo 命令似乎有问题可以采取配置文件的形式启动 
1.新建一个ecosystem.config.js，写入
```javascript
module.exports = {
    apps : [{
      name   : "demo",//--name
      script : "./main.py",
      args   : "--demo" , //string containing all arguments passed via CLI to script包含通过CLI传递给脚本的所有参数的字符串
      interpreter:'python',//   解释器（字符串）“/usr/bin/python”解释器绝对路径（默认为node）
    }]
  }
```
```sh
pm2 start ./ecosystem.config.js --env LANG=zh_CN.UTF-8 --no-color   #--no-color在某些情况下可以防止pm2自身日志的乱码
#当需要删除时
pm2 delete ./ecosystem.config.js
```
我使用的项目用了loguru作为日志库，他在pm2中依旧会将中文乱码
可以采用以下方案
这几行代码应该放在引入其他第三方库之前
```python
#coding=utf-8
import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
```
--name demo --env LANG=zh_CN.UTF-8
```sh
pm2 save
pm2 list  #查看pm2当前运行的程序
```

> - [pm2官方文档](https://pm2.keymetrics.io/)
> - [pm2 github](https://github.com/Unitech/pm2)