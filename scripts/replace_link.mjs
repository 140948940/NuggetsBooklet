import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function replaceLinksInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const replacedContent = content.replace(/!\[.*?\]\(https:\/\/[^?]*?juejin\.byteimg\.com[^?]*?\?$/g, '![$1]($1)')
  // const replacedContent = content.replace(
  //   /(http:\/\/localhost:[0-9]+)/g,
  //   (match, p1) => `<a href="${p1}" target="_blank" rel="noreferrer">${match}</a>`
  // );
  fs.writeFileSync(filePath, replacedContent, 'utf8');
}

// 处理所有 Markdown 文件
function processMarkdownFiles(directoryPath) {
  fs.readdirSync(directoryPath).forEach((file) => {
    const filePath = path.join(directoryPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      processMarkdownFiles(filePath);
    } else if (filePath.endsWith('.md')) {
      replaceLinksInFile(filePath);
    }
  });
}

// 调用函数处理 Markdown 文件
processMarkdownFiles(path.join(__dirname,'../blogs'));