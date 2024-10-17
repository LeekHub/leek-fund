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
import { FundInfo, SortType, TreeItemType } from '../shared/typed';
import { randHeader, sortData } from '../shared/utils';
import { LeekService } from './leekService';

export default class BinanceService extends LeekService {
  private context: ExtensionContext;
  private parisUrl = 'https://data-api.binance.vision/api/v3/exchangeInfo';
  private ticker24hrUrl = 'https://data-api.binance.vision/api/v3/ticker/24hr';
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

  async _fetchPairData(symbolsWithSplit: string[]): Promise<{ data: any, symbol: string }[]> {
    const symbols = JSON.stringify(symbolsWithSplit.map(sws => sws.split('_').join('')));
    return await Axios.get<{ data: any[] }>(this.ticker24hrUrl, {
      params: { symbols },
      headers: randHeader(),
    }).then(res => symbolsWithSplit.map(symbol => {
      const target = (res.data as any).find((data: any) => data.symbol === symbol.split('_').join(''));
      return ({ data: target, symbol });
    })).catch((err) => {
      globalState.telemetry.sendEvent('error: binanceService', {
        url: this.ticker24hrUrl,
        error: err,
      });
      return Promise.reject(symbolsWithSplit.map(symbol => ({ data: null, symbol })));
    });
  }

  async getData(codes: string[], order: SortType): Promise<LeekTreeItem[]> {
    const pairList: Array<LeekTreeItem> = [];

    // 20个请求的权重最低
    let splitFetch = [];
    while (codes.length > 20) {
      splitFetch.push(codes.splice(0, 20));
    }
    splitFetch.push(codes);
    const promises = splitFetch.map(splitCodes => this._fetchPairData(splitCodes));
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

    const results = await Promise.allSettled(promises);
    for (const splitRes of results) {
      // @ts-ignore
      const { status, value, reason } = splitRes;
      for (const item of (value || reason)) {
        if (status === 'fulfilled') {
          const {
            data,
            symbol,
          } = item;
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
          const { symbol } = item;
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

    }
    return sortData(pairList, order);
  }
}
