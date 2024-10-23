
import { setPort } from './proxyConfig';
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

// 启动 quote.eastmoney.com 的代理服务器
export async function startProxyServer() {
    const PORT = await findAvailablePort(7100); // 从7100端口开始寻找

    const server = http.createServer((req: any, res: any) => {
        const proxy = createProxyMiddleware({
        target: 'https://quote.eastmoney.com',
        changeOrigin: true,
        onProxyReq: (proxyReq: { setHeader: (arg0: string, arg1: string) => void; }, req: any) => {
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
        proxy(req, res);
    });

    server.listen(PORT, () => {
      const address = server.address();
      const port = typeof address === 'string' ? 0 : address?.port;

      if (port) {
        setPort(port); // 设置端口号
        console.log(`Proxy server running at http://localhost:${port}`);
      }
        console.log(`Proxy server running at http://localhost:${PORT}`);
    });
}
/**
 * 检测端口是否可用
 */
function isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.listen(port, () => {
        server.close(() => resolve(true));
      }).on('error', () => resolve(false));
    });
  }
  
  /**
   * 找到未占用的端口
   */
  async function findAvailablePort(startPort = 7100): Promise<number> {
    let port = startPort;
    while (!(await isPortAvailable(port))) {
      port++;
    }
    return port;
  }


export default startProxyServer;