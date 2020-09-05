import { QuickPickItem } from 'vscode';
import { LeekTreeItem, SortType } from './leekTreeItem';

export const XUEQIU_COOKIE =
  'device_id=24700f9f1986800ab4fcc880530dd0ed; s=cx138g8av1; bid=5cce4e0c90209ffea928b627443f39fa_kc956qys; __utmz=1.1593957579.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); _ga=GA1.2.2075969626.1594306349; acw_tc=2760823815987068844221229e39eeead45f769900257a8764f721b5ad8125; xq_a_token=4db837b914fc72624d814986f5b37e2a3d9e9944; xqat=4db837b914fc72624d814986f5b37e2a3d9e9944; xq_r_token=2d6d6cc8e57501dfe571d2881cabc6a5f2542bf8; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOi0xLCJpc3MiOiJ1YyIsImV4cCI6MTYwMDQ4MzAwNywiY3RtIjoxNTk4NzA2ODc4NTQ3LCJjaWQiOiJkOWQwbjRBWnVwIn0.KfVaRDSamj2Sp9UnHqMvM6s5fLnLKvGAYqupbDcjtyHb2cpPSwL6GH3QIc97WqajR1jNQjKklRgcHy6Ep4VcwHRbydqioj7ZCNSCU1hDtnoMb8kTm7wK4dWB9TOakhRw85dpXpCcXe7GSbdGWziNEY-knZppxuMl5oUKGnx8vrGT_5DZII8UdyZuixyiZ8E_2gu3ggGrxTT6MAziQrTNxrFALKBRJgQeRPLe0iK5F-MG1PB_2fphP_9IruQpERJ-w6YLgDBXfplbFL32BkIW2FV4HWbZonpBdcMYN4STPM6qA6l3C7Pzkg0E-x_RIc4jdhwVSvIiMCa-h-sVE-dYyw; u=681598706884429; Hm_lvt_1db88642e346389874251b5a1eded6e3=1598706886; __utma=1.339782325.1593957579.1593957579.1598706894.2; __utmc=1; __utmt=1; __utmb=1.1.10.1598706894; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1598706974';

export const formatDate = (date: Date, seperator = '-') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return [year, month, day]
    .map((n) => {
      const m = n.toString();
      return m[1] ? m : '0' + m;
    })
    .join(seperator);
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
 * 该方法会处理好以下这些问题
 * 1.12*100=112.00000000000001
 * 1.13*100=112.9999999999999
 * '0.015'.toFixed(2)结果位0.01
 * 1121.1/100 = 11.210999999999999
 */
export const toFixed = (value = 0, precision = 1) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  if (num < Math.pow(-2, 31) || num > Math.pow(2, 31) - 1) {
    return 0;
  }
  // console.log(num, precision)
  if (precision < 0 || typeof precision !== 'number') {
    return value;
  } else if (precision > 0) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
  }
  return Math.round(num);
};

export const isStockTime = () => {
  let stockTime = [9, 15];
  const date = new Date();
  const hours = date.getHours();
  const minus = date.getMinutes();
  const delay = hours === 15 && minus === 5; // 15点5分的时候刷新一次，避免数据延迟
  return (hours >= stockTime[0] && hours <= stockTime[1]) || delay;
};

export const calcFixedPirceNumber = (
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
  if (order === SortType.NORMAL) {
    return data;
  } else {
    return data.sort((a: any, b: any) => {
      const aValue = +a.info.percent;
      const bValue = +b.info.percent;
      if (order === SortType.DESC) {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }
};

export const formatTreeText = (text = '', num = 10): string => {
  const str = text + '';
  const lenx = num - str.length;
  return str + ' '.repeat(lenx);
};

export const caculateEarnings = (money: number, price: number, currentPrice: number): number => {
  return (money / price) * currentPrice - money;
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
