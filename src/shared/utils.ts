import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { QuickPickItem, window } from 'vscode';
import globalState from '../globalState';
import { LeekFundConfig } from './leekConfig';
import { LeekTreeItem } from './leekTreeItem';
import { SortType, StockCategory } from './typed';
import momentTz = require('moment-timezone');

const stockTimes = allStockTimes();
export const STOCK_SEPARATOR_PREFIX = 'separator:';
export type StockMarketType = 'a' | 'hk' | 'us' | 'future' | 'overseaFuture' | 'nodata';

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
  open='0',
  yestclose='0',
  price='0',
  high='0',
  low='0'
): number => {
  let reg = /0+$/g;
  open = open?.replace?.(reg, '') || '0';
  yestclose = yestclose?.replace?.(reg, '') || '0';
  price = price?.replace?.(reg, '') || '0';
  high = high?.replace?.(reg, '') || '0';
  low = low?.replace?.(reg, '') || '0';
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
  const hasSeparator = data.some((item) => item.info.contextValue === 'separator');
  const sortSegment = (segment: LeekTreeItem[]) => {
    if (order === SortType.ASC || order === SortType.DESC) {
      return segment.sort((a: any, b: any) => {
        const aValue = +a.info.percent;
        const bValue = +b.info.percent;
        if (order === SortType.DESC) {
          return aValue > bValue ? -1 : 1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    } else if (order === SortType.AMOUNTASC || order === SortType.AMOUNTDESC) {
      return segment.sort((a: any, b: any) => {
        const aValue = a.info.amount - 0;
        const bValue = b.info.amount - 0;
        if (order === SortType.AMOUNTDESC) {
          return aValue > bValue ? -1 : 1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }
    return segment;
  };

  if (hasSeparator) {
    const result: LeekTreeItem[] = [];
    let currentSegment: LeekTreeItem[] = [];
    data.forEach((item) => {
      if (item.info.contextValue === 'separator') {
        result.push(...sortSegment(currentSegment));
        result.push(item);
        currentSegment = [];
        return;
      }
      currentSegment.push(item);
    });
    result.push(...sortSegment(currentSegment));
    return result;
  }

  if (order === SortType.ASC || order === SortType.DESC || order === SortType.AMOUNTASC || order === SortType.AMOUNTDESC) {
    return sortSegment(data);
  } else {
    return data;
  }
};

export function getStockMarketType(code: string): StockMarketType {
  const separator = parseStockSeparatorCode(code);
  if (separator) {
    return separator.market;
  }
  if (/^(sh|sz|bj)/.test(code)) {
    return 'a';
  }
  if (/^(hk)/.test(code)) {
    return 'hk';
  }
  if (/^(usr_)/.test(code)) {
    return 'us';
  }
  if (/^(nf_)/.test(code) || /^[A-Z]+/.test(code)) {
    return 'future';
  }
  if (/^(hf_)/.test(code)) {
    return 'overseaFuture';
  }
  return 'nodata';
}

export function isStockSeparatorCode(code: string): boolean {
  return typeof code === 'string' && code.startsWith(STOCK_SEPARATOR_PREFIX);
}

export function createStockSeparatorCode(market: Exclude<StockMarketType, 'nodata'>, text: string): string {
  return `${STOCK_SEPARATOR_PREFIX}${market}:${text.trim()}`;
}

export function parseStockSeparatorCode(code: string):
  | { market: Exclude<StockMarketType, 'nodata'>; text: string }
  | null {
  if (!isStockSeparatorCode(code)) {
    return null;
  }
  const payload = code.slice(STOCK_SEPARATOR_PREFIX.length);
  const separatorIndex = payload.indexOf(':');
  if (separatorIndex <= 0) {
    return null;
  }
  const market = payload.slice(0, separatorIndex) as Exclude<StockMarketType, 'nodata'>;
  const text = payload.slice(separatorIndex + 1).trim();
  if (!text) {
    return null;
  }
  if (!['a', 'hk', 'us', 'future', 'overseaFuture'].includes(market)) {
    return null;
  }
  return {
    market,
    text,
  };
}

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
      description: 'yellow',
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
  // 现代浏览器 UA（新浪等接口常拒绝过时 UA）；勿再用 Math.random()*10 只抽前若干项
  const head_user_agent = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  ];
  const result = {
    Connection: head_connection[0],
    Accept: head_accept[0],
    'Accept-Language': head_accept_language[1],
    'User-Agent': head_user_agent[Math.floor(Math.random() * head_user_agent.length)],
  };
  return result;
};

/**
 * 判断是否周未的方法
 * @param {*} date 参与判断的日期，默认今天
 */
export const isWeekend = (date: momentTz.Moment = momentTz()) => {
  let tof = false;
  let dayOfWeek = date.day();

  tof = dayOfWeek === 6 || dayOfWeek === 0;

  return tof;
};

export const isStockTime = () => {
  const markets = allMarkets();
  const delay = 5;

  for (let i = 0; i < markets.length; i++) {
    let stockTime = stockTimes.get(markets[i]);
    if (!stockTime || stockTime.span.length < 2 || isHoliday(markets[i], stockTime.tz)) {
      continue;
    }

    const date = momentTz().tz(stockTime.tz);
    const hours = date.hours();
    const minus = date.minutes();
    // 针对期货交易时间跨越时间0点
    if (stockTime.span[0] > stockTime.span[1]) {
      if (
        hours >= stockTime.span[0] ||
        hours < stockTime.span[1] ||
        (hours === stockTime.span[1] && minus <= delay)
      ) {
        return true;
      }
    } else {
      if (
        (hours >= stockTime.span[0] && hours < stockTime.span[1]) ||
        (hours === stockTime.span[1] && minus <= delay)
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
    const marketType = getStockMarketType(item);
    if (marketType === 'a') {
      market = StockCategory.A;
    } else if (marketType === 'hk') {
      market = StockCategory.HK;
    } else if (marketType === 'us') {
      market = StockCategory.US;
    } else if (marketType === 'future') {
      market = StockCategory.Future;
    } else if (marketType === 'overseaFuture') {
      market = StockCategory.OverseaFuture;
    }
    if (!result.includes(market)) {
      result.push(market);
    }
  });
  return result;
}

export function allStockTimes(): Map<string, { tz: string; span: Array<number> }> {
  let stocks = new Map<string, { tz: string; span: Array<number> }>();
  stocks.set(StockCategory.A, { tz: 'Asia/Shanghai', span: [9, 15] });
  stocks.set(StockCategory.HK, { tz: 'Asia/Hong_Kong', span: [9, 16] });
  stocks.set(StockCategory.US, { tz: 'America/New_York', span: [4, 20] });
  stocks.set(StockCategory.Future, { tz: 'Asia/Shanghai', span: [21, 15] });
  stocks.set(StockCategory.OverseaFuture, { tz: 'Asia/Shanghai', span: [9, 7] });
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
  // https://www.hkex.com.hk/News/HKEX-Calendar?sc_lang=zh-HK
  const HK = [
    '20251225',
    '20251226',
    '20260101',
    '20260217',
    '20260218',
    '20260219',
    '20260403',
    '20260406',
    '20260407',
    '20260501',
    '20260525',
    '20260701',
    '20260926',
    '20261001',
    '20261019',
    '20261225',
    '20261226',
  ];
  // https://www.nyse.com/markets/hours-calendars
  const US = [
    '20251127',
    '20251225',
    '20260101',
    '20260119',
    '20260216',
    '20260403',
    '20260525',
    '20260619',
    '20260703',
    '20260907',
    '20261126',
    '20261225',
    '20270101',
    '20270118',
    '20270215',
    '20270326',
    '20270531',
    '20270618',
    '20270705',
    '20270906',
    '20271125',
    '20271224',
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

export function isHoliday(market: string, tz: string): boolean {
  const date = momentTz().tz(tz);

  const holidays = allHolidays();
  if (isWeekend(date) || holidays.get(market)?.includes(date.format('YYYYMMDD'))) {
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
  if (!html || typeof html !== 'string') {
    console.error('formatHTMLWebviewResourcesUrl: html is not a valid string', typeof html);
    return html || '';
  }

  const LinkRegexp = /\s?(?:src|href)=('|")(.*?)\1/gi;
  let matcher = LinkRegexp.exec(html);

  while (matcher) {
    const origin = matcher[0];
    const originLen = origin?.length || 0;
    const link = matcher[2];
    if (origin && link && !isRemoteLink(link)) {
      let resourceLink = link;
      try {
        resourceLink = conversionUrlFn(link);
        html =
          html.substring(0, matcher.index) +
          origin.replace(link, resourceLink) +
          html.substring(matcher.index + originLen);
      } catch (err) {
        console.error('formatHTMLWebviewResourcesUrl: replace error', err);
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

  if (!globalState || !globalState.context) {
    console.error('getTemplateFileContent: globalState.context is not initialized');
    return '<html><body><h1>Error: Extension context not initialized</h1></body></html>';
  }

  try {
    const tplPath = path.join(globalState.context.extensionPath, 'template', ...tplPaths);
    const html = fs.readFileSync(tplPath, 'utf-8');
    const extensionUri = globalState.context.extensionUri;
    const dirUri = tplPaths.slice(0, -1).join('/');
    return formatHTMLWebviewResourcesUrl(html, (link) => {
      return webview
        .asWebviewUri(vscode.Uri.parse([extensionUri, 'template', dirUri, link].join('/')))
        .toString();
    });
  } catch (error) {
    console.error('getTemplateFileContent: failed to read template file', error);
    return `<html><body><h1>Error loading template</h1><p>${error instanceof Error ? error.message : String(error)}</p><p>Template path: ${tplPaths.join('/')}</p></body></html>`;
  }
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
