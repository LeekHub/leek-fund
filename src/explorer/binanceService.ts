/*
 * @Author: John Trump
 * @Date: 2020-12-04 13:37:38
 * @LastEditors: John Trump
 * @LastEditTime: 2020-12-06 19:49:09
 */

import Axios from 'axios';
import { ExtensionContext } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { FundInfo, TreeItemType } from '../shared/typed';
import { randHeader } from '../shared/utils';
import { LeekService } from './leekService';

export default class BinanceService extends LeekService {
  private context: ExtensionContext;

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
    console.log(this.context);
  }

  /** 获取支持的交易对 */
  async getParis(): Promise<string[]> {
    const res = await Axios.get(`https://api.binance.com/api/v1/exchangeInfo`, {
      headers: randHeader(),
    });
    // console.log(res);
    return res.data?.symbols?.map((i: any) => `${i.baseAsset}_${i.quoteAsset}`);
  }

  async _fetchPairData(symbolWithSplit: string): Promise<any> {
    const symbol = symbolWithSplit.split('_').join('');
    return {
      data: await Axios.get(`https://api.binance.com/api/v1/ticker/24hr`, {
        params: { symbol },
        headers: randHeader(),
      }),
      symbol: symbolWithSplit,
    };
  }

  async getData(codes: string[]): Promise<LeekTreeItem[]> {
    const pairList: Array<LeekTreeItem> = [];

    const promises = codes.map((i) => this._fetchPairData(i));
    // @ts-ignore
    const results = await Promise.allSettled(promises);
    console.log(results);
    // @ts-ignore
    for (const { status, value = {} } of results) {
      if (status === 'fulfilled') {
        // status === 'fulfilled'
        const {
          data: { data },
          symbol,
        } = value;
        const obj: FundInfo = {
          id: symbol,
          code: '',
          name: symbol,
          price: data.lastPrice, // 现价
          open: data.openPrice, // 今开
          yestclose: data.prevClosePrice, // 昨收
          volume: data.volume, // 24h成交量
          amount: data.quoteVolume, // 24h成交额
          percent: data.priceChangePercent, // 百分比
          updown: data.priceChange, // 涨跌
          high: data.highPrice, // 最高
          low: data.lowPrice, // 最低
          showLabel: this.showLabel,
          _itemType: TreeItemType.BINANCE,
        };
        pairList.push(new LeekTreeItem(obj, this.context));
      } else {
        // handle status === 'rejected'
        const { symbol } = value;
        const obj: FundInfo = {
          id: symbol,
          code: '',
          percent: '0',
          name: symbol,
          showLabel: this.showLabel,
          _itemType: TreeItemType.BINANCE,
        };
        pairList.push(new LeekTreeItem(obj, this.context));
      }
    }
    return pairList;
  }
}
