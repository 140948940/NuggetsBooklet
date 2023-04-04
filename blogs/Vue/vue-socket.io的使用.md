- vue-socket.io 其实就和 vue-i18n 等一样，在原版（socket.io）的基础上进行的二次封装，使其可以直接在 vue 里通过插件安装使用。
- 使用版本为 3.0.10，基于 socket.io2.x 封装，由于其文档新版进行过修改，所以百度出来的许多用法其实是过时了的

```javascript
//在对后台事件监听时，并非使用
this.socket.on('message', data => {
  console.log('message:' + data)
})
//而是
this.sockets.subscribe('message', data => {
  this.msg = data.message
  console.log('message', data)
})
//，在向后台发送时，仍使用
this.$socket.emit('connect')
//，人类迷惑行为，在取消监听时，使用
//unsubscribe方法，如果想和socket.io一样对connection进行其他配置时，
//需要先引入socket.io 不需要再安装一次socket.io ，前文说了socket.io 是vue-socket.io 的依赖项
import SocketIO from 'socket.io-client'
Vue.use(
  new VueSocketIO({
    connection: SocketIO('ws://localhost:8080?token=' + token, {
      transports: ['websocket'],
    }), //options object is Optional
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_',
    },
  })
)
```

- 要注意的是，vue-socket.io 的连接默认为自动连接，如需手动连接，应将 connection 改为

```javascript
connection: SocketIO(process.env.VUE_APP_WS + "?token=" + token, {
        transports: ["websocket"],
        autoConnect: false
      }),

//在需要连接时调用this.$socket.open()，关闭时使用this.$socket.close(),如需改变token再连接，再new一次即可
```

- 说实话，vue-socket.io 的使用体验并不好，修改了原 socket.io 的一些方法，但其文档又简单的离谱，需要一边看 vue-socket.io 文档一边看 socket.io 文档，完全不如直接使用 socket.io 好用
