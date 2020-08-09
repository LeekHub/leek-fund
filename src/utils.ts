import { LeekTreeItem } from './service';

/**
 * 数组去重
 */
export const uniq = (elements: Array<string | number>) => {
  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.filter(
    (element, index) => index === elements.indexOf(element)
  );
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

export const isStockTime = () => {
  let stockTime = [9, 15];
  const date = new Date();
  const hours = date.getHours();
  const minus = date.getMinutes();
  const delay = hours === 15 && minus === 5; // 15点5分的时候刷新一次，避免数据延迟
  return (hours >= stockTime[0] && hours <= stockTime[1]) || delay;
};

export const formatNumber = (
  val: number = 0,
  fixed: number = 2,
  format = true
): string => {
  const num = +val;
  if (format) {
    if (num > 1000 * 10000) {
      return +(num / (10000 * 10000)).toFixed(fixed) + '亿';
    } else if (num > 1000) {
      return +(num / 10000).toFixed(fixed) + '万';
    }
  }
  return `${+num.toFixed(fixed)}`;
};

export const sortData = (data: LeekTreeItem[] = [], order = 0) => {
  return data.sort((a: any, b: any) => {
    const aValue = +a.info.percent;
    const bValue = +b.info.percent;
    if (order) {
      return aValue > bValue ? -1 : 1;
    } else {
      return aValue > bValue ? 1 : -1;
    }
  });
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

export const fundRankHtmlTemp = (list: any[] = []) => {
  let tbody = '';
  const thead = `
  <thead><tr ><th class="colorize">序号</th><th class="colorize">基金代码</th><th class="colorize">基金名称</th><th class="r_20 colorize">单位净值</th><th class="r_20 colorize">累计净值</th><th class="r_20">近三个月(%)</th><th class="r_20">近六个月(%)</th><th class=" r_20">近一年(%)</th><th class="sort_down r_20">今年以来(%)</th><th class=" r_20">成立以来(%)</th></tr></thead>`;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const {
      symbol,
      name,
      per_nav,
      total_nav,
      three_month,
      six_month,
      one_year,
      form_year,
      form_start,
      sname,
      zmjgm,
      clrq,
      jjjl,
      dwjz,
      ljjz,
      jzrq,
      zjzfe,
      jjglr_code,
    } = item;
    tbody += `<tr class="red">
    <td class="colorize">${i + 1}</td>
    <td class="colorize"><a href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=${symbol}&amp;country=fund" target="_blank">${symbol}</a></td>
    <td class="colorize"><a href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=${symbol}&amp;country=fund" target="_blank" title="${name}" class="name">${name}</a></td>
    <td class="r_20 colorize">${dwjz}</td>
    <td class="r_20 colorize">${ljjz}</td>
    <td class="r_20">${three_month}</td>
    <td class="r_20">${six_month}</td>
    <td class="r_20">${one_year}</td>
    <td class="r_20 sort_down r_20">${form_year}</td>
    <td class="r_20">${form_start}</td>
    </tr>`;
  }

  return `<table boder="0">${thead}<tbody>${tbody} </tbody></table>`;
};
