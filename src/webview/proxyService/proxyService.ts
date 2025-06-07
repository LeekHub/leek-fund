
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');
import { setPort } from './proxyConfig';
import { findAvailablePort } from '../../shared/findAvailablePort';

// 启动 eastmoney.com 的代理服务器
export async function startProxyServer(target?: string, middleware?: (req: any, res: any) => void) {
  const availablePort = await findAvailablePort(16100); // 从16100端口开始寻找

  const server = http.createServer((req: any, res: any) => {
    const proxy = createProxyMiddleware({
      target: target || 'https://quote.eastmoney.com',
      changeOrigin: true,
      onProxyReq: (proxyReq: { setHeader: (arg0: string, arg1: string) => void; }) => {
        // 设置 User-Agent 和 Cookie
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3');
        // 设置 fullscreengg cookie解决页面频繁弹出广告
        proxyReq.setHeader('Cookie', 'fullscreengg=1');
      },
      onError: (err: any, req: any, res: { writeHead: (arg0: number, arg1: { 'Content-Type': string; }) => void; end: (arg0: string) => void; }) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Something went wrong while proxying the request.');
      },
    });
    middleware?.(req, res);
    proxy(req, res);
  });

  server.listen(availablePort, () => {
    const address = server.address();
    const port = typeof address === 'string' ? 0 : address?.port;

    if (port) {
      setPort(port); // 设置端口号
      console.log(`🚀 ~ Proxy server running at http://localhost:${port}`);
    } else {
      console.log(`🚀 ~ Proxy server running at http://localhost:${availablePort}`);
    }

  });
}



export default startProxyServer;
