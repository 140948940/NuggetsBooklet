import fs from 'fs'
import path from 'path'
import { execa } from 'execa'
import { fileURLToPath } from 'url'
import chokidar from 'chokidar'
import minimist from 'minimist'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = minimist(process.argv.slice(2))
const { watchBlog } = args
const blacklist = ['.github', '.git', '.gitignore', 'README.md']
const whitelist = [['/xy-sea', '/xy-sea/markdown']]
const blogsPath = path.join(__dirname, '../blogs')
console.log('blogsPath', blogsPath)
// 辅助函数：检查一个路径是否是另一个路径的子路径
function isSubPath(parentPath, childPath) {
  const parentResolved = path.resolve(parentPath)
  const childResolved = path.resolve(childPath)
  return childResolved.startsWith(parentResolved + path.sep)
}
function getDirectoryTree(dirPath) {
  // for (let i = 0; i < whitelist.length; i++) {
  //   const dir = whitelist[i][0]
  //   const joinDir = whitelist[i][1]
  //   const regDir = path.join(blogsPath + dir)

  //   if (isSubPath(regDir, dirPath)) {
  //     const path1 = path.join(dirPath)
  //     // console.log(path1, path.join(blogsPath + joinDir))
  //     if (isSubPath(path.join(blogsPath + joinDir), path1)) {
  //       // return true
  //     } else {
  //       return false
  //     }

  //   }
  // }
  // return
  const name = path.basename(dirPath)
  const stats = fs.statSync(dirPath)
  let tree = {
    name,
    type: stats.isDirectory() ? 'directory' : 'file',
  }
  if (tree.type === 'file') {
    tree.name = encodeURIComponent(tree.name)
  }
  if (stats.isDirectory()) {
    const files = fs.readdirSync(dirPath)
    files.sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        caseFirst: 'upper',
      })
    )
    const children = files
      .filter(item => !blacklist.includes(item))
      .filter(item => {
        for (let i = 0; i < whitelist.length; i++) {
          const dir = whitelist[i][0]
          const joinDir = whitelist[i][1]
          const regDir = path.join(blogsPath + dir)

          if (isSubPath(regDir, dirPath)) {
            const path1 = path.join(dirPath, item)
            if (isSubPath(path.join(blogsPath + joinDir), path1)) {
              return true
            } else {
              return false
            }
          }
        }
        return true
      })
      .map(child => {
        console.log('child', child)

        // if(child.type==='file'){

        //   // console.log('child',child)
        // }
        return getDirectoryTree(path.join(dirPath, child))
      })
      .filter(item => item)
      .sort()
    if (children.length > 0) {
      tree.children = children
    } else {
      tree = undefined
    }
  }
  return tree
}
if (watchBlog) {
  console.log('preDoc子线程运行')
  const watcher = chokidar.watch(path.join(__dirname, '../blogs'), {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
  })
  watcher
    .on('add', async path => {
      await setRouterConfig()
      console.log(`File ${path} has been added`)
    })
    .on('unlink', async path => {
      await setRouterConfig()
      console.log(`File ${path} has been removed`)
    })
}

setRouterConfig()
async function setRouterConfig() {
  try {
    const tree = getDirectoryTree(path.join(__dirname, '../blogs'))
    const RouterConfig = `
    // 该文件自动生成 by scripts/setRouterConfig.mjs
    export default ${JSON.stringify(tree.children)}`
    const fsPath = path.join(__dirname, '../config/router.js')
    fs.writeFileSync(fsPath, RouterConfig)
    const prettier = path.join(__dirname, '../node_modules/.bin/prettier')
    await execa(prettier, ['--write', fsPath], {
      stdio: 'pipe',
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
