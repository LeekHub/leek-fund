import axios from 'axios';
import * as iconv from 'iconv-lite';
import { join } from 'path';
import {
  ExtensionContext,
  TreeItem,
  TreeItemCollapsibleState,
  window,
} from 'vscode';
import { formatNumber, randHeader, sortData } from './utils';

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

export class LeekTreeItem extends TreeItem {
  info: FundInfo;
  constructor(info: FundInfo, context: ExtensionContext) {
    super('', TreeItemCollapsibleState.None);
    this.info = info;
    const {
      isStock,
      name,
      code,
      type,
      symbol,
      price,
      percent,
      open,
      yestclose,
      high,
      low,
      updown,
      volume,
      amount,
    } = info;
    const grow = percent.indexOf('-') === 0 ? false : true;
    this.iconPath = context.asAbsolutePath(
      join('resources', `${grow ? 'up-arrow' : 'down-arrow'}.svg`)
    );

    const text = isStock
      ? `${percent}%   ${price}    「${name}」${type}${symbol}`
      : `${percent}%   「${name}」(${code})`;

    this.label = text;
    this.id = code;
    this.command = {
      title: name, // 标题
      command: isStock ? 'leetfund.stockItemClick' : 'leetfund.fundItemClick', // 命令 ID
      arguments: [
        isStock ? '0' + symbol : code, // 基金/股票编码
        name, // 基金/股票名称
        text,
        `${type}${symbol}`,
      ],
    };

    if (isStock) {
      this.tooltip = `【今日行情】${type}${symbol}\n 涨跌：${updown}   百分比：${percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
    } else {
      this.tooltip = '点击查看详情';
    }
  }
}

export class FundService {
  private _fundList: Array<LeekTreeItem> = [];
  private context: ExtensionContext;
  szItem: any;
  constructor(context: ExtensionContext) {
    this.context = context;
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
          resolve({ percent: gszzl, code, time: gztime, name });
        })
        .catch(() => resolve({ percent: 'NaN', name: '基金代码错误', code }));
    });
  }

  async getFundData(
    fundCodes: Array<string>,
    order: number
  ): Promise<Array<LeekTreeItem>> {
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

  async getFundHistoryByCode(code: string) {
    const response = await axios.get(this.fundHistoryUrl(code), {
      headers: randHeader(),
    });
    try {
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

  async getStockData(
    codes: Array<string>,
    order: number
  ): Promise<Array<LeekTreeItem>> {
    console.log('fetching stock data…');
    if ((codes && codes.length === 0) || !codes) return [];
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
      if (/FAILED/.test(resp.data)) {
        window.showErrorMessage(
          `fail: error Stock code in ${codes.join(
            ','
          )}, please delete error Stock code`
        );
        return [];
      }
      const splitData = resp.data.split(';\n');
      const stockList: Array<LeekTreeItem> = [];
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
          }
          if (stockItem) {
            const { yestclose, price } = stockItem;
            stockItem.isStock = true;
            stockItem.type = type;
            stockItem.symbol = symbol;
            stockItem.updown = formatNumber(+price - +yestclose, 2, false);
            stockItem.percent =
              (stockItem.updown >= 0 ? '+' : '-') +
              formatNumber(
                (Math.abs(stockItem.updown) / +yestclose) * 100,
                2,
                false
              );
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
