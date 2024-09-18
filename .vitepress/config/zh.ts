import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'
import generateRoutes from '../../config/router'
export const META_URL = 'https://140948940.github.io/a-soul-blog/'
export const META_TITLE = 'A SOUL BLOG'
export const META_DESCRIPTION = '个人博客存档'
type gRouteTypeFile = {
  type: 'file'
}

type gRouteTypeDirectory = {
  type: 'directory'
  children: gRouteType[]
}

type gRouteType =
  | Array<Expand<(gRouteTypeFile | gRouteTypeDirectory) & { name: string }>>
  | []
enum nameEnum {
  Other = '其他',
}
const gRoutes = generateRoutes as gRouteType
function findBottomNode(node) {
  if (!node.items || node.items.length === 0) {
    return node
  } else {
    let deepestChild = node.items[0]
    return findBottomNode(deepestChild)
  }
}
function formatRoute(gRoutes, deep = 1, parentRoute = '/blogs') {
  const arr = []
  for (let i = 0; i < gRoutes.length; i++) {
    const item = gRoutes[i]
    const obj = {
      name: item.name,
      text: decodeURIComponent(item.name),
      path: parentRoute + `/${item.name}`,
      collapsed: item.type === 'file' ? null : true,
      items: undefined,
      link: undefined,
    }
    if (item.type === 'directory') {
      if (item.children?.length) {
        obj.items = formatRoute(item.children, deep + 1, obj.path)
        if (!obj.link) {
          obj.link = findBottomNode(obj).path || '/no-blog.md'
        }
      } else {
        obj.link = '/no-blog.md'
      }
    } else {
      obj.link = obj.path
    }
    arr[i] = obj
  }
  return arr
}
const sidebarArr = formatRoute(gRoutes)
const nav = sidebarArr.map((item, index) => {
  return {
    ...item,
    activeMatch: '^' + item.path,
  }
})
export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  description: META_DESCRIPTION,
  head: [
    ['meta', { property: 'og:url', content: META_URL }],
    ['meta', { property: 'og:description', content: META_DESCRIPTION }],
    ['meta', { property: 'twitter:url', content: META_URL }],
    ['meta', { property: 'twitter:title', content: META_TITLE }],
    ['meta', { property: 'twitter:description', content: META_DESCRIPTION }],
  ],

  themeConfig: {
    editLink: {
      pattern: 'https://github.com/140948940/a-soul-blog/edit/main/:path',
      text: '对本页提出修改建议',
    },

    outlineTitle: '本页内容',

    nav: nav,
    // {
    //   text: '相关链接',
    //   items: [
    //     {
    //       text: 'Discussions',
    //       link: 'https://github.com/140948940/add-page-watermark/discussions',
    //     },
    //     {
    //       text: '更新日志',
    //       link: 'https://github.com/140948940/add-page-watermark/blob/main/packages/router/CHANGELOG.md',
    //     },
    //   ],
    // },
    sidebar: {
      '/': sidebarArr,
      // '/api/': [
      //   {
      //     text: 'packages',
      //     items: [{ text: 'add-page-watermark', link: '/api/' }],
      //   },
      // ],
      // '/': [
      //   {
      //     items: [
      //       {
      //         text: '介绍',
      //         link: '/introduction.html',
      //       },
      //       {
      //         text: '安装',
      //         link: '/installation.html',
      //       },
      //     ],
      //   },
      //   {
      //     text: '基础',
      //     collapsed: false,
      //     items: [
      //       {
      //         text: '入门',
      //         link: '/guide/',
      //       }
      //     ],
      //   },
      // ],
    },
    // alias:sidebarArr.reduce((acc, cur) => {
    //   acc[cur.link]=(cur?.items&&cur?.items[0]?.link)||'/no-blog.md'
    //   return acc;
    // }, {})
  },
}
