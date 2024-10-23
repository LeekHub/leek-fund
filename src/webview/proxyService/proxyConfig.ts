// 定义端口号变量，初始值为 undefined
let PORT: number | undefined = undefined;

/**
 * 设置端口号
 */
export function setPort(port: number) {
  PORT = port;
}

/**
 * 获取代理Host
 */
export function getEastmoneyHost() {
    if(PORT === undefined) {
        return `https://quote.eastmoney.com`;
    } else {
        return `http://localhost:${PORT}`;
    }
}