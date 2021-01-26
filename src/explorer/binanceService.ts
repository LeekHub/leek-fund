/*
 * @Author: John Trump
 * @Date: 2020-12-04 13:37:38
 * @LastEditors: John Trump
 * @LastEditTime: 2021-01-26 23:14:24
 */

import Axios from 'axios';
import { ExtensionContext } from 'vscode';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { FundInfo, TreeItemType } from '../shared/typed';
import { randHeader } from '../shared/utils';
import { LeekService } from './leekService';

export default class BinanceService extends LeekService {
  private context: ExtensionContext;
  private parisUrl = 'https://api.binance.com/api/v1/exchangeInfo';
  private ticker24hrUrl = 'https://api.binance.com/api/v1/ticker/24hr';
  constructor(context: ExtensionContext) {
    super();
    this.context = context;
  }

  /** 获取支持的交易对 */
  async getParis(): Promise<string[]> {
    const res: any = await Axios.get(this.parisUrl, {
      headers: randHeader(),
    }).catch((err) => {
      globalState.telemetry.sendEvent('error: binanceService', {
        url: this.parisUrl,
        error: err,
      });
    });
    if (res && res.data) {
      return res.data.symbols?.map((i: any) => `${i.baseAsset}_${i.quoteAsset}`);
    }
    return [''];
  }

  async _fetchPairData(symbolWithSplit: string): Promise<any> {
    const symbol = symbolWithSplit.split('_').join('');
    return {
      data: await Axios.get(this.ticker24hrUrl, {
        params: { symbol },
        headers: randHeader(),
      }).catch((err) => {
        globalState.telemetry.sendEvent('error: binanceService', {
          url: this.ticker24hrUrl,
          error: err,
        });
      }),
      symbol: symbolWithSplit,
    };
  }

  async getData(codes: string[]): Promise<LeekTreeItem[]> {
    const pairList: Array<LeekTreeItem> = [];

    const promises = codes.map((i) => this._fetchPairData(i));
    /* Shim for Promise.allSettled */
    if (!Promise.allSettled) {
      // @ts-ignore
      Promise.allSettled = (promises: Promise<any>[]) => {
        let wrappedPromises = promises.map((p) =>
          Promise.resolve(p).then(
            (val) => ({ status: 'fulfilled', value: val }),
            (err) => ({ status: 'rejected', reason: err })
          )
        );
        return Promise.all(wrappedPromises);
      };
    }
    // @ts-ignore
    const results = await Promise.allSettled(promises);
    // console.log('results=', results);

    for (const item of results) {
      // @ts-ignore
      const { status, value = {} } = item || {};
      if (status === 'fulfilled' && value.data) {
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
          name: symbol + '网络错误',
          showLabel: this.showLabel,
          _itemType: TreeItemType.BINANCE,
        };
        pairList.push(new LeekTreeItem(obj, this.context));
      }
    }
    return pairList;
  }
}
