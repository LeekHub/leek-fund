import Axios from "axios";


export const defaultXueQiuHeaders = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  Connection: 'keep-alive',
  Host: 'xueqiu.com', // 股票的话这里写 stock.xueqiu.com
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36};',
};

export async function getXueQiuToken() {
  let cookies = '';
  const response = await Axios.get(`http://xueqiu.com/`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/3.0 Safari/536.11',
    }
  });
  const cookiesHeader = response.headers['set-cookie'];
  cookies +=
    cookiesHeader
      .map((h: string) => {
        let content = h.split(';')[0];
        return content.endsWith('=') ? '' : content;
      })
      .filter((h: string) => h !== '')
      .join(';') + ';';


  return cookies;
}
