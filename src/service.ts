import axios from 'axios';
import * as iconv from 'iconv-lite';
import { ExtensionContext, window, QuickPickItem } from 'vscode';
import { FundInfo, LeekTreeItem, STOCK_TYPE } from './leekTreeItem';
import { formatNumber, randHeader, sortData } from './utils';

export class FundService {
  private _fundSuggestList: string[] = [];
  private _fundList: Array<LeekTreeItem> = [];
  private context: ExtensionContext;
  szItem: any;
  searchStockKeyMap: any = {}; // 标记搜索不到记录，避免死循环
  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public get fundSuggestList(): string[] {
    return this._fundSuggestList;
  }

  public set fundSuggestList(value) {
    this._fundSuggestList = value;
  }

  public get fundList(): Array<LeekTreeItem> {
    return this._fundList;
  }

  public set fundList(value: Array<LeekTreeItem>) {
    this._fundList = value;
  }

  private fundUrl(code: string): string {
    const fundUrl = `http://fundgz.1234567.com.cn/js/${code}.js?rt="${new Date().getTime()}`;
    return fundUrl;
  }
  private fundHistoryUrl(code: string): string {
    const fundUrl = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=24`;
    return fundUrl;
  }
  private stockUrl(codes: Array<string>): string {
    return `http://hq.sinajs.cn/list=${codes.join(',')}`;
  }

  singleFund(code: string): Promise<FundInfo> {
    const url = this.fundUrl(code);
    return new Promise((resolve) => {
      axios
        // @ts-ignore
        .get(url, { headers: randHeader() })
        .then((rep) => {
          const data = JSON.parse(rep.data.slice(8, -2));
          const { gszzl, gztime, name } = data;
          resolve({ percent: gszzl, code, time: gztime, name });
        })
        .catch(() => resolve({ percent: 'NaN', name: '基金代码错误', code }));
    });
  }

  async getFundData(fundCodes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    console.log('fetching fund data……');
    const promiseAll = [];
    for (const fundCode of fundCodes) {
      promiseAll.push(this.singleFund(fundCode));
    }
    try {
      const result = await Promise.all(promiseAll);
      const data = result.map((item) => {
        return new LeekTreeItem(item, this.context);
      });

      this.fundList = sortData(data, order);
      // console.log(data);
      return this.fundList;
    } catch (err) {
      console.log(err);
      return this.fundList;
    }
  }

  getFundSuggestList() {
    console.log('fundSuggestList: getting...');
    axios
      .get('http://m.1234567.com.cn/data/FundSuggestList.js', {
        headers: randHeader(),
      })
      .then((response) => {
        this.fundSuggestList = JSON.parse(`[${response.data.split('[')[1].split(']')[0]}]`);
        console.log('fundSuggestList length:', this.fundSuggestList.length);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getStockSuggestList(searchText = '', type = '2'): Promise<QuickPickItem[]> {
    if (!searchText) {
      return [{ label: '请输入关键词查询，如：0000001 或 上证指数' }];
    }
    const url = `http://suggest3.sinajs.cn/suggest/type=${type}&key=${encodeURIComponent(
      searchText
    )}`;
    try {
      console.log('getStockSuggestList: getting...');
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = iconv.decode(data, 'GB18030');
            return body;
          },
        ],
        headers: randHeader(),
      });
      const text = response.data.slice(18, -1);
      if (text.length <= 1 && !this.searchStockKeyMap[searchText]) {
        this.searchStockKeyMap[searchText] = true;
        // 兼容一些查询不到的股票，如sz123044
        return this.getStockSuggestList(searchText, '');
      }
      this.searchStockKeyMap = {};
      const tempArr = text.split(';');
      const result: QuickPickItem[] = [];
      tempArr.forEach((item: string) => {
        const arr = item.split(',');
        // 过滤多余的 us. 开头的股干扰
        if (STOCK_TYPE.includes(arr[0].substr(0, 2)) && !arr[0].startsWith('us.')) {
          result.push({
            label: `${arr[0]} | ${arr[4]}`,
            description: arr[7] && arr[7].replace(/"/g, ''),
          });
        }
      });
      return result;
    } catch (err) {
      console.log(url);
      console.error(err);
      return [{ label: '查询失败，请重试' }];
    }
  }

  async getFundHistoryByCode(code: string) {
    try {
      const response = await axios.get(this.fundHistoryUrl(code), {
        headers: randHeader(),
      });

      const idxs = response.data.indexOf('"<table');
      const lastIdx = response.data.indexOf('</table>"');
      const content = response.data.slice(idxs + 1, lastIdx);
      // console.log(idxs, lastIdx, content);
      return { code, content };
    } catch (err) {
      console.log(err);
      return { code, content: '历史净值获取失败' };
    }
  }

  async getStockData(codes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    console.log('fetching stock data…');
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }
    const url = this.stockUrl(codes);
    try {
      const resp = await axios.get(url, {
        // axios 乱码解决
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = iconv.decode(data, 'GB18030');
            return body;
          },
        ],
        headers: randHeader(),
      });
      // console.log(resp.data);
      var stockList: Array<LeekTreeItem> = [];
      if (/FAILED/.test(resp.data)) {
        if (codes.length === 1) {
          window.showErrorMessage(
            `fail: error Stock code in ${codes}, please delete error Stock code`
          );
          return [
            {
              id: codes[0],
              info: { code: codes[0], percent: '0', name: '错误代码' },
              label: codes[0] + ' 错误代码，请查看是否缺少交易所信息',
            },
          ];
        }
        for (const code of codes) {
          stockList = stockList.concat(await this.getStockData(new Array(code), order));
        }
        return stockList;
      }
      const splitData = resp.data.split(';\n');
      let sz: LeekTreeItem | null = null;
      for (let i = 0; i < splitData.length - 1; i++) {
        const code = splitData[i].split('="')[0].split('var hq_str_')[1];
        const params = splitData[i].split('="')[1].split(',');
        let type = code.substr(0, 2) || 'sh';
        let symbol = code.substr(2);
        let stockItem: any;
        if (params.length > 1) {
          if (/^(sh|sz)/.test(code)) {
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(params[1], 2, false),
              yestclose: formatNumber(params[2], 2, false),
              highStop: formatNumber(params[2] * 1.1, 2, false),
              lowStop: formatNumber(params[2] * 0.9, 2, false),
              price: formatNumber(params[3], 2, false),
              low: formatNumber(params[5], 2, false),
              high: formatNumber(params[4], 2, false),
              volume: formatNumber(params[8], 2),
              amount: formatNumber(params[9], 2),
              percent: '',
            };
          } else if (/^hk/.test(code)) {
            stockItem = {
              code,
              name: params[1],
              open: formatNumber(params[2], 2, false),
              yestclose: formatNumber(params[3], 2, false),
              price: formatNumber(params[6], 2, false),
              low: formatNumber(params[5], 2, false),
              high: formatNumber(params[4], 2, false),
              volume: formatNumber(params[12], 2),
              amount: formatNumber(params[11], 2),
              percent: '',
            };
          } else if (/^gb_/.test(code)) {
            symbol = code.substr(3);
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(params[5], 2, false),
              yestclose: formatNumber(params[26], 2, false),
              price: formatNumber(params[1], 2, false),
              low: formatNumber(params[7], 2, false),
              high: formatNumber(params[6], 2, false),
              volume: formatNumber(params[10], 2),
              amount: '接口无数据',
              percent: '',
            };
            type = code.substr(0, 3);
          } else if (/^usr_/.test(code)) {
            symbol = code.substr(4);
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(params[5], 2, false),
              yestclose: formatNumber(params[26], 2, false),
              price: formatNumber(params[1], 2, false),
              low: formatNumber(params[7], 2, false),
              high: formatNumber(params[6], 2, false),
              volume: formatNumber(params[10], 2),
              amount: '接口无数据',
              percent: '',
            };
            type = code.substr(0, 4);
          }
          if (stockItem) {
            const { yestclose, price } = stockItem;
            stockItem.isStock = true;
            stockItem.type = type;
            stockItem.symbol = symbol;
            stockItem.updown = formatNumber(+price - +yestclose, 2, false);
            stockItem.percent =
              (stockItem.updown >= 0 ? '+' : '-') +
              formatNumber((Math.abs(stockItem.updown) / +yestclose) * 100, 2, false);
            if (code === 'sh000001') {
              sz = new LeekTreeItem(stockItem, this.context);
            }
            stockList.push(new LeekTreeItem(stockItem, this.context));
          }
        }
      }
      this.szItem = sz || stockList[0];
      const res = sortData(stockList, order);
      return res;
    } catch (err) {
      console.info(url);
      console.error(err);
      window.showErrorMessage(`fail: Stock error ` + url);
      return [];
    }
  }

  async getRankFund(): Promise<Array<any>> {
    console.log('get ranking fund');
    const url = `http://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/IO.XSRV2.CallbackList['hLfu5s99aaIUp7D4']/NetValueReturn_Service.NetValueReturnOpen?page=1&num=40&sort=form_year&asc=0&ccode=&type2=0&type3=`;
    const response = await axios.get(url, {
      headers: randHeader(),
    });
    const sIndex = response.data.indexOf(']({');
    const data = response.data.slice(sIndex + 2, -2);
    return JSON.parse(data).data || [];
  }
}
