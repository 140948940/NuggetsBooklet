import { spawn } from 'child_process'
import path from 'path'
import {fileURLToPath} from 'url'
import { execa } from "execa";
const __dirname=path.dirname(fileURLToPath(import.meta.url))
const codeProcess = spawn('node', [path.join(__dirname,'./setRouterConfig.mjs'),'--watchBlog'], { stdio: 'inherit' });
codeProcess.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  process.exit(1)
});
console.log('preDoc运行')
execa('npm', ['run', 'docs'],{ stdio: "inherit"})

