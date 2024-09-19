import { defineConfig } from 'vitepress'
import { sharedConfig } from './shared'
import { zhConfig } from './zh'
// export default {
//   // ...other Vite config options...

// };
// function updateBlogsRoute() {
//   return {
//     name: 'update-blogs-route-plugin',
//     // configureServer(server) {
//     //   console.log('server',server)
//     //   server?.handleHotUpdate((...args) => {
//     //     // console.log(`File ${path} changed (${event})`);
//     //     console.log('args',...args)
//     //   })  }
// }
export default defineConfig({
  ...sharedConfig,
  base: '/a-soul-blog/',
  vite: {
    // log/',
    //   vite:{
    // te:{e// :{
    // ite:{
    //   updateBlogsRoute()
    // gsRoute()
    // ]   // ]
  },
  ignoreDeadLinks: [
    // 忽略精确网址 "/playground"
    // '/playground',
    // 忽略所有 localhost 链接
    /^https?:\/\/localhost/,
    // 忽略所有包含 "/repl/" 的链接
    // /\/repl\//,,
    // 自定义函数，忽略所有包含 "ignore "的链接
    // (url) => {
    //   return url.toLowerCase().includes('ignore')
    // }
  ],
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', link: '/', ...zhConfig },
  },
})
