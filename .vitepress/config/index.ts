import { defineConfig } from 'vitepress'
import { sharedConfig } from './shared'
import { zhConfig } from './zh'
function updateBlogsRoute() {
  return {
    name: 'update-blogs-route-plugin',
    // configureServer(server) {
    //   console.log('server',server)
    //   server?.handleHotUpdate((...args) => {
    //     // console.log(`File ${path} changed (${event})`);
    //     console.log('args',...args)
    //   });
    // }
  }
}
export default defineConfig({
  ...sharedConfig,
  base: '/a-soul-blog/',
  vite: {
    // plugins:[
    //   updateBlogsRoute()
    // ]
  },
  locales: {
    root: { label: '简体中文', lang: 'zh-CN', link: '/', ...zhConfig },
  },
})
