import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { QuickPickItem, window } from 'vscode';
import globalState from '../globalState';
import { LeekFundConfig } from './leekConfig';
import { LeekTreeItem } from './leekTreeItem';
import { SortType, StockCategory } from './typed';

const stockTimes = allStockTimes();

const formatNum = (n: number) => {
  const m = n.toString();
  return m[1] ? m : '0' + m;
};

export const objectToQueryString = (queryParameters: Object): string => {
  return queryParameters
    ? Object.entries(queryParameters).reduce((queryString, [key, val]) => {
        const symbol = queryString.length === 0 ? '?' : '&';
        queryString += typeof val !== 'object' ? `${symbol}${key}=${val}` : '';
        return queryString;
      }, '')
    : '';
};

export const formatDate = (val: Date | string | undefined, seperator = '-') => {
  let date = new Date();
  if (typeof val === 'object') {
    date = val;
  } else {
    date = new Date(val || '');
  }
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day].map(formatNum).join(seperator);
};

// 时间格式化
export const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return (
    [year, month, day].map(formatNum).join('-') +
    ' ' +
    [hour, minute, second].map(formatNum).join(':')
  );
};

/**
 * 数组去重
 */
export const uniq = (elements: Array<string | number>) => {
  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.filter((element, index) => index === elements.indexOf(element));
};

/**
 * 清除数组里面的非法值
 */
export const clean = (elements: Array<string | number>) => {
  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.filter((element) => !!element);
};

/**
 * toFixed 解决js精度问题，使用方式：toFixed(value)
 * @param {Number | String} value
 * @param {Number} precision 精度，默认2位小数，需要取整则传0
 * @param {Number} percent 倍增
 * 该方法会处理好以下这些问题
 * 1.12*100=112.00000000000001
 * 1.13*100=112.9999999999999
 * '0.015'.toFixed(2)结果位0.01
 * 1121.1/100 = 11.210999999999999
 */
export const toFixed = (value = 0, precision = 2, percent = 1) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return 0;
  }
  if (num < Math.pow(-2, 31) || num > Math.pow(2, 31) - 1) {
    return 0;
  }
  let newNum = value * percent;
  // console.log(num, precision)
  if (precision < 0 || typeof precision !== 'number') {
    return newNum * percent;
  } else if (precision > 0) {
    newNum = Math.round(num * Math.pow(10, precision) * percent) / Math.pow(10, precision);
    return newNum;
  }
  newNum = Math.round(num);

  return newNum;
};

export const calcFixedPriceNumber = (
  open: string,
  yestclose: string,
  price: string,
  high: string,
  low: string
): number => {
  let reg = /0+$/g;
  open = open.replace(reg, '');
  yestclose = yestclose.replace(reg, '');
  price = price.replace(reg, '');
  high = high.replace(reg, '');
  low = low.replace(reg, '');
  let o = open.indexOf('.') === -1 ? 0 : open.length - open.indexOf('.') - 1;
  let yc = yestclose.indexOf('.') === -1 ? 0 : yestclose.length - yestclose.indexOf('.') - 1;
  let p = price.indexOf('.') === -1 ? 0 : price.length - price.indexOf('.') - 1;
  let h = high.indexOf('.') === -1 ? 0 : high.length - high.indexOf('.') - 1;
  let l = low.indexOf('.') === -1 ? 0 : low.length - low.indexOf('.') - 1;
  let max = Math.max(o, yc, p, h, l);
  if (max > 3) {
    max = 2; // 接口返回的指数数值的小数位为4，但习惯两位小数
  }
  return max;
};

export const formatNumber = (val: number = 0, fixed: number = 2, format = true): string => {
  const num = +val;
  if (format) {
    if (num > 1000 * 10000) {
      return (num / (10000 * 10000)).toFixed(fixed) + '亿';
    } else if (num > 1000) {
      return (num / 10000).toFixed(fixed) + '万';
    }
  }
  return `${num.toFixed(fixed)}`;
};

export const sortData = (data: LeekTreeItem[] = [], order = SortType.NORMAL) => {
  if (order === SortType.ASC || order === SortType.DESC) {
    return data.sort((a: any, b: any) => {
      const aValue = +a.info.percent;
      const bValue = +b.info.percent;
      if (order === SortType.DESC) {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  } else if (order === SortType.AMOUNTASC || order === SortType.AMOUNTDESC) {
    return data.sort((a: any, b: any) => {
      const aValue = a.info.amount - 0;
      const bValue = b.info.amount - 0;
      if (order === SortType.AMOUNTDESC) {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  } else {
    return data;
  }
};

export const formatTreeText = (text = '', num = 10): string => {
  const str = text + '';
  const lenx = Math.max(num - str.length, 0);
  return str + ' '.repeat(lenx);
};

export const caculateEarnings = (money: number, price: number, currentPrice: number): number => {
  if (Number(currentPrice) > 0) {
    return (money / price) * currentPrice - money;
  } else {
    return 0;
  }
};

export const colorOptionList = (): QuickPickItem[] => {
  const list = [
    {
      label: '🔴Red Color',
      description: 'red',
    },
    {
      label: '💹Green Color',
      description: 'green',
    },
    {
      label: '⚪White Color',
      description: 'white',
    },
    {
      label: '⚫Black Color',
      description: 'black',
    },
    {
      label: '🌕Yellow Color',
      description: 'black',
    },
    {
      label: '🔵Blue Color',
      description: 'blue',
    },
    {
      label: 'Gray Color',
      description: '#888888',
    },
    {
      label: 'Random Color',
      description: 'random',
    },
  ];
  return list;
};

export const randomColor = (): string => {
  const colors = [
    '#E74B84',
    '#11FB23',
    '#F79ADA',
    '#C9AD06',
    '#82D3A6',
    '#C6320D',
    '#83C06A',
    '#54A0EB',
    '#85AB66',
    '#53192F',
    '#6CD2D7',
    '#6C6725',
    '#7B208B',
    '#B832A5',
    '#C1FDCD',
  ];

  const num = Math.ceil(Math.random() * 10);
  return colors[num];
};

export const randHeader = () => {
  const head_connection = ['Keep-Alive', 'close'];
  const head_accept = ['text/html, application/xhtml+xml, */*'];
  const head_accept_language = [
    'zh-CN,fr-FR;q=0.5',
    'en-US,en;q=0.8,zh-Hans-CN;q=0.5,zh-Hans;q=0.3',
  ];
  const head_user_agent = [
    'Opera/8.0 (Macintosh; PPC Mac OS X; U; en)',
    'Opera/9.27 (Windows NT 5.2; U; zh-cn)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Win64; x64; Trident/4.0)',
    'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.2; .NET4.0C; .NET4.0E)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.2; .NET4.0C; .NET4.0E; QQBrowser/7.3.9825.400)',
    'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0; BIDUBrowser 2.x)',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1) Gecko/20070309 Firefox/2.0.0.3',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1) Gecko/20070803 Firefox/1.5.0.12',
    'Mozilla/5.0 (Windows; U; Windows NT 5.2) Gecko/2008070208 Firefox/3.0.1',
    'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.12) Gecko/20080219 Firefox/2.0.0.12 Navigator/9.0.0.6',
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.95 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; rv:11.0) like Gecko)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:21.0) Gecko/20100101 Firefox/21.0 ',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Maxthon/4.0.6.2000 Chrome/26.0.1410.43 Safari/537.1 ',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.92 Safari/537.1 LBBROWSER',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.11 TaoBrowser/3.0 Safari/536.11',
    'Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko',
    'Mozilla/5.0 (Macintosh; PPC Mac OS X; U; en) Opera 8.0',
  ];
  const result = {
    Connection: head_connection[0],
    Accept: head_accept[0],
    'Accept-Language': head_accept_language[1],
    'User-Agent': head_user_agent[Math.floor(Math.random() * 10)],
  };
  return result;
};

/**
 * 判断是否周未的方法
 * @param {*} date 参与判断的日期，默认今天
 */
export const isWeekend = (date: Date = new Date()) => {
  let tof = false;
  let dayOfWeek = date.getDay();

  tof = dayOfWeek === 6 || dayOfWeek === 0;

  return tof;
};

export const isStockTime = () => {
  const markets = allMarkets();
  const date = new Date();
  const hours = date.getHours();
  const minus = date.getMinutes();
  const delay = 5;
  for (let i = 0; i < markets.length; i++) {
    let stockTime = stockTimes.get(markets[i]);
    if (!stockTime || stockTime.length < 2 || isHoliday(markets[i])) {
      continue;
    }
    // 针对美股交易时间跨越北京时间0点
    if (stockTime[0] > stockTime[1]) {
      if (
        hours >= stockTime[0] ||
        hours < stockTime[1] ||
        (hours === stockTime[1] && minus <= delay)
      ) {
        return true;
      }
    } else {
      if (
        (hours >= stockTime[0] && hours < stockTime[1]) ||
        (hours === stockTime[1] && minus <= delay)
      ) {
        return true;
      }
    }
  }
  return false;
};

export function allMarkets(): Array<string> {
  let result: Array<string> = [];
  const funds: Array<string> = LeekFundConfig.getConfig('leek-fund.funds');
  if (funds.length > 0) {
    // 针对只配置基金的用户，默认增加A股交易时间
    result.push(StockCategory.A);
  }

  const stocks: Array<string> = LeekFundConfig.getConfig('leek-fund.stocks');
  stocks.forEach((item: string) => {
    let market = StockCategory.NODATA;
    if (/^(sh|sz|bj)/.test(item)) {
      market = StockCategory.A;
    } else if (/^(hk)/.test(item)) {
      market = StockCategory.HK;
    } else if (/^(usr_)/.test(item)) {
      market = StockCategory.US;
    } else if (/^(nf_)/.test(item)) {
      market = StockCategory.Future;
    } else if (/^[A-Z]+/.test(item)) {
      market = StockCategory.Future;
    } else if (/^(hf_)/.test(item)) {
      market = StockCategory.OverseaFuture;
    }
    if (!result.includes(market)) {
      result.push(market);
    }
  });
  return result;
}

export function allStockTimes(): Map<string, Array<number>> {
  let stocks = new Map<string, Array<number>>();
  stocks.set(StockCategory.A, [9, 15]);
  stocks.set(StockCategory.HK, [9, 16]);
  // TODO: 判断夏令时,夏令时交易时间为[21, 4]，非夏令时交易时间为[22, 5]
  stocks.set(StockCategory.US, [21, 5]);
  stocks.set(StockCategory.Future, [21, 15]);
  stocks.set(StockCategory.OverseaFuture, [9, 7]);
  return stocks;
}

export function allHolidays(): Map<string, Array<string>> {
  // https://websys.fsit.com.tw/FubonETF/Top/Holiday.aspx
  // 假日日期格式为yyyyMMdd
  let days = new Map<string, Array<string>>();
  const A = [];
  if (globalState.isHolidayChina) {
    A.push(formatDate(new Date(), ''));
  }
  // https://www.hkex.com.hk/-/media/HKEX-Market/Services/Circulars-and-Notices/Participant-and-Members-Circulars/SEHK/2020/ce_SEHK_CT_038_2020.pdf
  const HK = [
    '20201225',
    '20210101',
    '20210212',
    '20210215',
    '20210402',
    '20210405',
    '20210406',
    '20210519',
    '20210614',
    '20210701',
    '20210922',
    '20211001',
    '20211014',
    '20211227',
  ];
  // https://www.nyse.com/markets/hours-calendars
  const US = [
    '20201225',
    '20210101',
    '20210118',
    '20210215',
    '20210402',
    '20210531',
    '20210705',
    '20210906',
    '20211125',
    '20211224',
    '20220117',
    '20220221',
    '20220415',
    '20220530',
    '20220704',
    '20220905',
    '20221124',
    '20221226',
  ];
  days.set(StockCategory.A, A);
  days.set(StockCategory.HK, HK);
  days.set(StockCategory.US, US);
  return days;
}

export function timezoneDate(timezone: number): Date {
  const date = new Date();
  const diff = date.getTimezoneOffset(); // 分钟差
  const gmt = date.getTime() + diff * 60 * 1000;
  let nydate = new Date(gmt + timezone * 60 * 60 * 1000);
  return nydate;
}

export function isHoliday(market: string): boolean {
  let date = new Date();
  if (market === StockCategory.US) {
    date = timezoneDate(-5);
  }

  const holidays = allHolidays();
  if (isWeekend(date) || holidays.get(market)?.includes(formatDate(date, ''))) {
    return true;
  }
  return false;
}

function isRemoteLink(link: string) {
  return /^(https?|vscode-webview-resource|javascript):/.test(link);
}

export function formatHTMLWebviewResourcesUrl(
  html: string,
  conversionUrlFn: (link: string) => string
) {
  const LinkRegexp = /\s?(?:src|href)=('|")(.*?)\1/gi;
  let matcher = LinkRegexp.exec(html);

  while (matcher) {
    const origin = matcher[0];
    const originLen = origin.length;
    const link = matcher[2];
    if (!isRemoteLink(link)) {
      let resourceLink = link;
      try {
        resourceLink = conversionUrlFn(link);
        html =
          html.substring(0, matcher.index) +
          origin.replace(link, resourceLink) +
          html.substring(matcher.index + originLen);
      } catch (err) {
        console.error(err);
      }
    }
    matcher = LinkRegexp.exec(html);
  }
  return html;
}

export function getTemplateFileContent(tplPaths: string | string[], webview: vscode.Webview) {
  if (!Array.isArray(tplPaths)) {
    tplPaths = [tplPaths];
  }
  const tplPath = path.join(globalState.context.extensionPath, 'template', ...tplPaths);
  const html = fs.readFileSync(tplPath, 'utf-8');
  const extensionUri = globalState.context.extensionUri;
  const dirUri = tplPaths.slice(0, -1).join('/');
  return formatHTMLWebviewResourcesUrl(html, (link) => {
    return webview
      .asWebviewUri(vscode.Uri.parse([extensionUri, 'template', dirUri, link].join('/')))
      .toString();
  });
}

export function multi1000(n: number) {
  return Math.ceil(n * 1000);
}

export const events = new EventEmitter();

export function formatLabelString(str: string, params: Record<string, any>) {
  try {
    str = str.replace(/\$\{(.*?)\}/gi, function (_, $1) {
      const formatMatch = /(.*?)\s*\|\s*padRight\s*(\|\s*(\d+))?/gi.exec($1);

      if (formatMatch) {
        return formatTreeText(
          params[formatMatch[1]],
          formatMatch[3] ? parseInt(formatMatch[3]) : undefined
        );
      } else {
        return String(params[$1]);
      }
    });
  } catch (err) {
    // @ts-ignore
    window.showErrorMessage(`fail: Label format Error, ${str};\n${err.message}`);
    return '模板格式错误！';
  }
  return str;
}

export function getWebviewResourcesUrl(
  webview: vscode.Webview,
  args: string[],
  _extensionUri: vscode.Uri = globalState.context.extensionUri
) {
  return args.map((arg) => {
    return webview.asWebviewUri(
      vscode.Uri.parse([_extensionUri.toString(), 'template', arg].join('/'))
    );
  });
}

export function getResourcesImageSrc(
  webview: vscode.Webview,
  args: string[],
  _extensionUri: vscode.Uri = globalState.context.extensionUri
) {
  return args.map((arg) => {
    return webview.asWebviewUri(
      vscode.Uri.parse([_extensionUri.toString(), 'resources', 'images', arg].join('/'))
    );
  });
}
