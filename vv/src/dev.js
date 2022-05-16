import express from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import { extname, join } from 'path';
import { transformCode, transformCss, transformJSX } from './transform';

const targetRootPath = join(__dirname, '../target');

/**
 * 1. 启动服务
 * 2. 拦截入口请求，返回html文件
 * 3. 加入 热更新 HMR
 */
export async function dev() {
  const app = express();

  app.get('/', (req, res) => {
    res.set('Content-Type', 'text/html');
    const htmlPath = join(__dirname, '../target', 'index.html');
    let html = readFileSync(htmlPath, 'utf-8');
    // TODO
    html = html.replace('<head>','<head><script type="module" src="/@vite/client"></script>');
    res.send(html);
  })

  // 客户端
  app.get('/@vite/client', (req, res) => {
    res.set('Content-Type', 'application/javascript');
    res.send(transformCode({
      code: readFileSync(join(__dirname, 'client.js'), 'utf-8')
    }).code);
  });

  // 静态文件
  app.get('/target/*', (req, res) => {
    console.log('path >>>>>', req.path)
    // 完整文件路径 - 绝对路径
    const filePath = join(__dirname, '..', req.path.slice(1));

    if ('import' in req.query) {
      res.set('Content-Type', 'application/javascript');
      res.send(`export default "${req.path}"`);
      return;
    }

    switch(extname(req.path)) {
      case '.svg':
        res.set('Content-Type', 'image/svg+xml');
        res.send(readFileSync(filePath, 'utf-8'));
        break;
      case '.css':
        res.set('Content-Type', 'application/javascript');
        res.send(transformCss({
            path: req.path,
            code: readFileSync(filePath, 'utf-8')
          }));
        break;
      default:
        res.set('Content-Type', 'application/javascript');
        res.send(transformJSX({
            appRoot: join(__dirname, '../target'),
            path: req.path,
            code: readFileSync(filePath, 'utf-8')
          }).code);
        break;
    }
  });

  const server = createServer(app);
  const port = 3002;
  server.listen(port, () => {
    console.log('App is running at 127.0.0.1:3002');
  });
}