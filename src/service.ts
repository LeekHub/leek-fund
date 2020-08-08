import axios from 'axios';
import { join } from 'path';
import * as iconv from 'iconv-lite';
import {
  ExtensionContext,
  TreeItem,
  TreeItemCollapsibleState,
  window,
} from 'vscode';
import { keepDecimal, randHeader, sortData, formatNumber } from './utils';

interface FundInfo {
  percent: any;
  name: string;
  code: string;
  symbol?: string;
  type?: string;
  yestclose?: string | number; // 昨日净值
  open?: string | number;
  highStop?: string | number;
  high?: string | number;
  lowStop?: string | number;
  low?: string | number;
  time?: string;
  updown?: string; // 涨跌值 price-yestclose
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string; // 成交额
  isStock?: boolean;
}

export class FundTreeItem extends TreeItem {
  info: FundInfo;
  constructor(info: FundInfo, context: ExtensionContext) {
    super(
      info.isStock
        ? `${info.percent}   ${info.price}    「${info.name}」${info.type}${info.symbol}`
        : `${info.percent}   「${info.name}」(${info.code})`,
      TreeItemCollapsibleState.None
    );
    this.info = info;
    const text = info.isStock
      ? `${info.percent}   ${info.price}    「${info.name}」${info.type}${info.symbol}`
      : `${info.percent}   「${info.name}」(${info.code})`;
    const grow = info.percent.indexOf('-') === 0 ? false : true;
    this.iconPath = context.asAbsolutePath(
      join('resources', `${grow ? 'up-arrow' : 'down-arrow'}.svg`)
    );
    this.id = info.code; // 基金/股票编码
    this.command = {
      title: info.name, // 标题
      command: info.isStock
        ? 'leetfund.stockItemClick'
        : 'leetfund.fundItemClick', // 命令 ID
      arguments: [
        info.code, // 基金/股票编码
        info.name, // 基金/股票名称
        text,
        `${info.type}${info.symbol}`,
      ],
    };
  }
}

export class FundService {
  private _fundList: Array<FundTreeItem> = [];
  private context: ExtensionContext;
  szItem: any;
  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public get fundList(): Array<FundTreeItem> {
    return this._fundList;
  }

  public set fundList(value: Array<FundTreeItem>) {
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
    return `https://hq.sinajs.cn/list=${codes.join(',')}`;
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
          resolve({ percent: gszzl + '%', code, time: gztime, name });
        })
        .catch(() => resolve({ percent: 'NaN', name: '基金代码错误', code }));
    });
  }

  async fetchFundData(
    fundCodes: Array<string>,
    order: number
  ): Promise<Array<FundTreeItem>> {
    console.log('fetching fund data……');
    const promiseAll = [];
    for (const fundCode of fundCodes) {
      promiseAll.push(this.singleFund(fundCode));
    }
    try {
      const result = await Promise.all(promiseAll);
      const data = result.map((item) => {
        return new FundTreeItem(item, this.context);
      });

      this.fundList = sortData(data, order);
      // console.log(data);
      return this.fundList;
    } catch (err) {
      console.log(err);
      return this.fundList;
    }
  }

  async getFundHistoryByCode(code: string) {
    const response = await axios.get(this.fundHistoryUrl(code), {
      headers: randHeader(),
    });
    try {
      const idxs = response.data.indexOf('"<table');
      const lastIdx = response.data.indexOf('</table>"');
      const content = response.data.slice(idxs, lastIdx);
      // console.log(idxs, lastIdx, content);
      return { code, content };
    } catch (err) {
      console.log(err);
      return { code, content: '历史净值获取失败' };
    }
  }

  async getStockData(
    codes: Array<string>,
    order: number
  ): Promise<Array<FundTreeItem>> {
    console.log('fetching stock data…');
    try {
      const url = this.stockUrl(codes);
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
      if (/FAILED/.test(resp.data)) {
        window.showErrorMessage(
          `fail: error Stock code in ${codes.join(
            ','
          )}, please delete error Stock code`
        );
        return [];
      }
      const splitData = resp.data.split(';\n');
      const stockList: Array<FundTreeItem> = [];
      let sz: FundTreeItem | null = null;
      for (let i = 0; i < splitData.length - 1; i++) {
        const code = splitData[i].split('="')[0].split('var hq_str_')[1];
        const params = splitData[i].split('="')[1].split(',');
        console.log(code, typeof code);
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
              percent: '',
            };
          }
          if (stockItem) {
            const { yestclose, price } = stockItem;
            stockItem.type = type;
            stockItem.symbol = symbol;
            stockItem.updown = formatNumber(+price - +yestclose, 2, false);
            stockItem.percent =
              (stockItem.updown >= 0 ? '+' : '-') +
              formatNumber(
                (Math.abs(stockItem.updown) / +yestclose) * 100,
                2,
                false
              ) +
              '%';
            if (code === 'sh000001') {
              sz = new FundTreeItem(stockItem, this.context);
            }
            stockList.push(new FundTreeItem(stockItem, this.context));
          }
        }
      }
      this.szItem = sz || stockList[0];
      const res = sortData(stockList, order);
      return res;
    } catch (err) {
      window.showErrorMessage(`fail: Stock error `);
      return [];
    }
  }

  /* async fetchStockData(
    codes: Array<string>,
    order: number
  ): Promise<Array<FundTreeItem>> {
    console.log('fetching stock data…');
    // TODO:  重构，使用新浪的接口
    const url = `https://api.money.126.net/data/feed/${codes.join(
      ','
    )}?callback=a`;

    try {
      const rep = await axios.get(url);
      const result = JSON.parse(rep.data.slice(2, -2));
      let data: Array<FundTreeItem> = [];
      const keys = Object.keys(result);
      let sz: FundTreeItem | null = null;
      keys.map((item) => {
        result[item].percent = `${keepDecimal(
          String(result[item].percent * 100),
          2
        )}% `;
        result[item].isStock = true;
        if (!result[item].code) {
          result[item].code = item;
        }
        if (item === '0000001') {
          sz = new FundTreeItem(result[item], this.context);
        }
        data.push(new FundTreeItem(result[item], this.context));
      });
      // 选择上证指数，如没有则取第一个
      this.szItem = sz || data[0];
      const res = sortData(data, order);
      return res;
    } catch (err) {
      console.log(err);
      return [];
    }
  } */
}
