const http = require('http');

/**
 * 检测端口是否可用
 */
export function isPortAvailable(port: number): Promise<boolean> {
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
export async function findAvailablePort(startPort = 16100): Promise<number> {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
}