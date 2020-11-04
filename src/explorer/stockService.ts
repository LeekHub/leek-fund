import Axios from 'axios';
import { decode } from 'iconv-lite';
import { ExtensionContext, QuickPickItem, window } from 'vscode';
import globalState from '../globalState';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { FundInfo, STOCK_TYPE } from '../shared/typed';
import { calcFixedPirceNumber, formatNumber, randHeader, sortData, events } from '../shared/utils';
import { LeekService } from './leekService';

export default class StockService extends LeekService {
  public stockList: Array<LeekTreeItem> = [];
  public statusBarStockList: Array<LeekTreeItem> = [];

  private context: ExtensionContext;
  private defaultBarStock: LeekTreeItem | null = null;
  private searchStockKeyMap: any = {}; // 标记搜索不到记录，避免死循环

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
  }

  async getData(codes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    console.log('fetching stock data…');
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }
    const statusBarStocks = LeekFundConfig.getConfig('leek-fund.statusBarStock');

    const url = `https://hq.sinajs.cn/list=${codes.join(',')}`;
    try {
      const resp = await Axios.get(url, {
        // axios 乱码解决
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = decode(data, 'GB18030');
            return body;
          },
        ],
        headers: randHeader(),
      });
      let stockList: Array<LeekTreeItem> = [];
      const barStockList: Array<LeekTreeItem> = [];
      if (/FAILED/.test(resp.data)) {
        if (codes.length === 1) {
          window.showErrorMessage(
            `fail: error Stock code in ${codes}, please delete error Stock code`
          );
          return [
            {
              id: codes[0],
              type: '',
              contextValue: 'failed',
              isCategory: false,
              info: { code: codes[0], percent: '0', name: '错误代码' },
              label: codes[0] + ' 错误代码，请查看是否缺少交易所信息',
            },
          ];
        }
        for (const code of codes) {
          stockList = stockList.concat(await this.getData(new Array(code), order));
        }
        return stockList;
      }

      const splitData = resp.data.split(';\n');
      let sz: LeekTreeItem | null = null;
      let aStockCount = 0;
      let usStockCount = 0;
      let hkStockCount = 0;
      let noDataStockCount = 0;
      for (let i = 0; i < splitData.length - 1; i++) {
        const code = splitData[i].split('="')[0].split('var hq_str_')[1];
        const params = splitData[i].split('="')[1].split(',');
        let type = code.substr(0, 2) || 'sh';
        let symbol = code.substr(2);
        let stockItem: any;
        let fixedNumber = 2;
        if (params.length > 1) {
          if (/^(sh|sz)/.test(code)) {
            let open = params[1];
            let yestclose = params[2];
            let price = params[3];
            let high = params[4];
            let low = params[5];
            fixedNumber = calcFixedPirceNumber(open, yestclose, price, high, low);
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(open, fixedNumber, false),
              yestclose: formatNumber(yestclose, fixedNumber, false),
              price: formatNumber(price, fixedNumber, false),
              low: formatNumber(low, fixedNumber, false),
              high: formatNumber(high, fixedNumber, false),
              volume: formatNumber(params[8], 2),
              amount: formatNumber(params[9], 2),
              percent: '',
            };
            aStockCount += 1;
          } else if (/^hk/.test(code)) {
            let open = params[2];
            let yestclose = params[3];
            let price = params[6];
            let high = params[4];
            let low = params[5];
            fixedNumber = calcFixedPirceNumber(open, yestclose, price, high, low);
            stockItem = {
              code,
              name: params[1],
              open: formatNumber(open, fixedNumber, false),
              yestclose: formatNumber(yestclose, fixedNumber, false),
              price: formatNumber(price, fixedNumber, false),
              low: formatNumber(low, fixedNumber, false),
              high: formatNumber(high, fixedNumber, false),
              volume: formatNumber(params[12], 2),
              amount: formatNumber(params[11], 2),
              percent: '',
            };
            hkStockCount += 1;
          } else if (/^gb_/.test(code)) {
            symbol = code.substr(3);
            let open = params[5];
            let yestclose = params[26];
            let price = params[1];
            let high = params[6];
            let low = params[7];
            fixedNumber = calcFixedPirceNumber(open, yestclose, price, high, low);
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(open, fixedNumber, false),
              yestclose: formatNumber(yestclose, fixedNumber, false),
              price: formatNumber(price, fixedNumber, false),
              low: formatNumber(low, fixedNumber, false),
              high: formatNumber(high, fixedNumber, false),
              volume: formatNumber(params[10], 2),
              amount: '接口无数据',
              percent: '',
            };
            type = code.substr(0, 3);
            noDataStockCount += 1;
          } else if (/^usr_/.test(code)) {
            symbol = code.substr(4);
            let open = params[5];
            let yestclose = params[26];
            let price = params[1];
            let high = params[6];
            let low = params[7];
            fixedNumber = calcFixedPirceNumber(open, yestclose, price, high, low);
            stockItem = {
              code,
              name: params[0],
              open: formatNumber(open, fixedNumber, false),
              yestclose: formatNumber(yestclose, fixedNumber, false),
              price: formatNumber(price, fixedNumber, false),
              low: formatNumber(low, fixedNumber, false),
              high: formatNumber(high, fixedNumber, false),
              volume: formatNumber(params[10], 2),
              amount: '接口无数据',
              percent: '',
            };
            type = code.substr(0, 4);
            usStockCount += 1;
          }
          if (stockItem) {
            const { yestclose, price, open } = stockItem;
            /*  if (open === price && price === '0.00') {
            stockItem.isStop = true;
          } */
            stockItem.showLabel = this.showLabel;
            stockItem.isStock = true;
            stockItem.type = type;
            stockItem.symbol = symbol;
            stockItem.updown = formatNumber(+price - +yestclose, fixedNumber, false);
            stockItem.percent =
              (stockItem.updown >= 0 ? '+' : '-') +
              formatNumber((Math.abs(stockItem.updown) / +yestclose) * 100, 2, false);

            const treeItem = new LeekTreeItem(stockItem, this.context);
            if (code === 'sh000001') {
              sz = treeItem;
            }
            if (statusBarStocks.includes(code)) {
              barStockList.push(treeItem);
            }
            stockList.push(treeItem);
          }
        } else {
          // 接口不支持的
          noDataStockCount += 1;
          stockItem = {
            id: code,
            name: `接口不支持该股票 ${code}`,
            showLabel: this.showLabel,
            isStock: true,
            percent: '',
            type: 'nodata',
            contextValue: 'nodata',
          };
          const treeItem = new LeekTreeItem(stockItem, this.context);
          stockList.push(treeItem);
        }
      }
      this.defaultBarStock = sz || stockList[0];
      const res = sortData(stockList, order);
      this.executeStocksRemind(res);
      events.emit('stockListUpdate', res, this.stockList);
      this.stockList = res;
      if (barStockList.length === 0) {
        // 用户没有设置股票时，默认展示上证或第一个
        barStockList.push(this.defaultBarStock);
      }
      this.statusBarStockList = sortData(barStockList, order);
      globalState.aStockCount = aStockCount;
      globalState.hkStockCount = hkStockCount;
      globalState.usStockCount = usStockCount;
      globalState.noDataStockCount = noDataStockCount;
      return res;
    } catch (err) {
      console.info(url);
      console.error(err);
      window.showErrorMessage(`fail: Stock error ` + url);
      return [];
    }
  }

  executeStocksRemind(newStockList: Array<LeekTreeItem>) {
    if (!this.stockList.length) {
      return;
    }
    const stocksRemind = globalState.stocksRemind;
    const remindCodes = Object.keys(stocksRemind);

    const oldStocksMap: Record<string, FundInfo> = {};
    this.stockList.forEach(({ info }) => {
      oldStocksMap[info.code] = info;
    });

    newStockList.forEach((stock) => {
      try {
        const { info } = stock;
        if (remindCodes.includes(info.code)) {
          const oldStockInfo = oldStocksMap[info.code];
          const currentPrice = parseFloat(info.price || '0');
          const currentPrecent = parseFloat(info.percent || '0');
          const currentUpdown = parseFloat(info.updown || '0');

          const oldPrice = parseFloat(oldStockInfo.price || '0');
          const oldPrecent = parseFloat(oldStockInfo.percent || '0');

          const priceRange = Math.abs(currentPrice - oldPrice);
          const precentRange = Math.abs(currentPrecent - oldPrecent);

          const remindConfig = stocksRemind[info.code];
          const remindPrices: string[] = remindConfig.price;
          const remindPercents: string[] = remindConfig.percent;

          remindPrices.forEach((remindPriceStr) => {
            const remindPrice = parseFloat(remindPriceStr);
            if (remindPrice / 0 !== currentUpdown / 0) {
              return;
            }
            const marginPrice = Math.abs(currentPrice - Math.abs(remindPrice));
            if (priceRange > marginPrice) {
              console.log('价格提醒:', oldPrice, currentPrice, remindPrice);
              window.showWarningMessage(
                `股价提醒：「${info.name}」 ${
                  currentUpdown >= 0 ? '上涨' : '下跌'
                }至 ${currentPrice}`
              );
            }
          });

          remindPercents.forEach((remindPercentStr) => {
            const remindPercent = parseFloat(remindPercentStr);
            if (remindPercent / 0 !== currentUpdown / 0) {
              return;
            }
            const marginPrecent = Math.abs(currentPrecent - remindPercent);
            if (precentRange > marginPrecent) {
              window.showWarningMessage(
                `股价提醒：「${info.name}」 ${
                  remindPercent >= 0 ? '上涨' : '下跌'
                }超 ${currentPrecent}%，现报：${currentPrice}`
              );
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
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
      const response = await Axios.get(url, {
        responseType: 'arraybuffer',
        transformResponse: [
          (data) => {
            const body = decode(data, 'GB18030');
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
        let code = arr[0];
        if (code.substr(0, 2) === 'of') {
          // 修改lof以及etf的前缀，防止被过滤
          // http://www.csisc.cn/zbscbzw/cpbmjj/201212/f3263ab61f7c4dba8461ebbd9d0c6755.shtml
          // 在上海证券交易所挂牌的证券投资基金使用50～59开头6位数字编码，在深圳证券交易所挂牌的证券投资基金使用15～19开头6位数字编码。
          code = code.replace(/^(of)(5[0-9])/g, 'sh$2').replace(/^(of)(1[5-9])/g, 'sz$2');
        }
        if (code === 'hkhsi' || code === 'hkhscei') {
          code = code.toUpperCase().replace('HK', 'hk');
        }
        // 过滤多余的 us. 开头的股干扰
        if (STOCK_TYPE.includes(code.substr(0, 2)) && !code.startsWith('us.')) {
          result.push({
            label: `${code} | ${arr[4]}`,
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
}
