import axios from 'axios';
import { TreeItem, TreeItemCollapsibleState, ExtensionContext } from 'vscode';
import { keepDecimal, randHeader, sortData } from './utils';
import { join, basename } from 'path';

interface FundInfo {
  percent: any;
  name: string;
  code: string;
  price?: string;
  symbol?: string;
  type?: string;
  yestclose?: string | number;
  open?: string | number;
  high?: string | number;
  low?: string | number;
  time?: string;
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
      console.log(idxs, lastIdx, content);
      return { code, content };
    } catch (err) {
      console.log(err);
      return { code, content: '历史净值获取失败' };
    }
  }

  async fetchStockData(
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
      Object.keys(result).map((item) => {
        result[item].percent = `${keepDecimal(
          String(result[item].percent * 100),
          2
        )}% `;
        result[item].isStock = true;
        if (!result[item].code) {
          result[item].code = item;
        }
        data.push(new FundTreeItem(result[item], this.context));
      });
      const res = sortData(data, order);
      return res;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}
