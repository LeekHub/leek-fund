// 定义端口号变量，初始值为 undefined
let eastmoneyPort: number | undefined = undefined;

/**
 * 设置端口号
 */
export function setEastmoneyPort(port: number) {
  eastmoneyPort = port;
}

export function getEastmoneyPort(): number | undefined {
  return eastmoneyPort;
}
/**
 * 获取代理Host
 */
export function getEastMoneyHost() {
    if(eastmoneyPort === undefined) {
        return `https://quote.eastmoney.com`;
    } else {
        return `http://localhost:${eastmoneyPort}`;
    }
}