import axios from 'axios';
import * as iconv from 'iconv-lite';
import { ExtensionContext, QuickPickItem, window } from 'vscode';
import global from './global';
import { LeekTreeItem, STOCK_TYPE } from './leekTreeItem';
import {
  calcFixedPirceNumber,
  formatNumber,
  randHeader,
  sortData,
  toFixed,
  caculateEarnings,
  objectToQueryString,
} from './utils';
import { LeekFundModel } from './views/model';

export class LeekFundService {
  private _showLabel: boolean = true;
  private _fundSuggestList: string[] = [];
  private _fundList: Array<LeekTreeItem> = [];
  private _stockList: Array<LeekTreeItem> = [];
  private _barStockList: Array<LeekTreeItem> = [];

  private context: ExtensionContext;
  private model: LeekFundModel;
  defaultBarStock: LeekTreeItem | null = null;
  searchStockKeyMap: any = {}; // 标记搜索不到记录，避免死循环

  constructor(context: ExtensionContext, model: LeekFundModel) {
    this.context = context;
    this.model = model;
  }

  public get showLabel(): boolean {
    return this._showLabel;
  }

  public set showLabel(value: boolean) {
    this._showLabel = value;
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

  public get stockList(): Array<LeekTreeItem> {
    return this._stockList;
  }

  public set stockList(value: Array<LeekTreeItem>) {
    this._stockList = value;
  }

  public get statusBarStockList(): Array<LeekTreeItem> {
    return this._barStockList;
  }

  public set statusBarStockList(value: Array<LeekTreeItem>) {
    this._barStockList = value;
  }

  toggleLabel() {
    this.showLabel = !this.showLabel;
  }

  static qryFundMNFInfo(fundCodes: string[]): Promise<any> {
    const params: any = {
      pageIndex: 1,
      pageSize: fundCodes.length,
      appType: 'ttjj',
      product: 'EFund',
      plat: 'Android',
      deviceid: global.deviceId,
      Version: 1,
      Fcodes: fundCodes.join(','),
    };

    return new Promise((resolve) => {
      if (!params.deviceid || !params.Fcodes) {
        resolve([]);
      } else {
        const url =
          'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo' + objectToQueryString(params);
        axios
          .get(url, {
            headers: randHeader(),
          })
          .then((resp) => {
            resolve(resp.data);
          })
          .catch((err) => {
            console.error(err);
            resolve([]);
          });
      }
    });
  }

  async getFundData(fundCodes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    console.log('fetching fund data……');
    try {
      const { Datas = [] } = await LeekFundService.qryFundMNFInfo(fundCodes);
      // console.log(Datas);
      const fundAmountObj: any = global.fundAmount;
      const keyLength = Object.keys(fundAmountObj).length;
      const data = Datas.map((item: any) => {
        const { SHORTNAME, FCODE, GSZ, NAV, PDATE, GZTIME, GSZZL, NAVCHGRT } = item;
        const time = item.GZTIME.substr(0, 10);
        const isUpdated = item.PDATE.substr(0, 10) === time; // 判断闭市的时候
        let earnings = 0;
        let amount = 0;
        // 不填写的时候不计算
        if (keyLength) {
          amount = fundAmountObj[FCODE]?.amount || 0;
          const price = fundAmountObj[FCODE]?.price || 0;
          // const priceDate = fundAmountObj[FCODE]?.priceDate || '';
          const yestEarnings = fundAmountObj[FCODE]?.earnings || 0;
          // 闭市的时候显示上一次盈亏
          earnings =
            amount === 0
              ? 0
              : isUpdated
              ? yestEarnings
              : toFixed(caculateEarnings(amount, price, GSZ));
        }

        const obj = {
          name: SHORTNAME,
          code: FCODE,
          price: GSZ, // 今日估值
          percent: isNaN(Number(GSZZL)) ? NAVCHGRT : GSZZL, // 当日估值没有取前日（海外基）
          yestclose: NAV, // 昨日净值
          showLabel: this.showLabel,
          earnings,
          isUpdated,
          amount,
          t2: GSZZL == '--' ? true : false, // 海外基金t2
          time: GSZZL == '--' ? PDATE : GZTIME, // 更新时间
          showEarnings: keyLength > 0 && amount !== 0,
        };
        return new LeekTreeItem(obj, this.context);
      });

      this.fundList = sortData(data, order);
      return this.fundList;
    } catch (err) {
      console.log(err);
      return this.fundList;
    }
  }

  /*   getFundSuggestList() {
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
 */
  async getStockSuggestList(searchText = '', type = '2'): Promise<QuickPickItem[]> {
    if (!searchText) {
      return [{ label: '请输入关键词查询，如：0000001 或 上证指数' }];
    }
    const url = `http://suggest3.sinajs.cn/suggest/type=${type}&key=${encodeURIComponent(
      searchText
    )}`;
    try {
      console.log('getStockSuggestList: getting...', url);
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
        let code = arr[0];
        if (code.substr(0, 2) === 'of') {
          // 修改lof以及etf的前缀，防止被过滤
          // http://www.csisc.cn/zbscbzw/cpbmjj/201212/f3263ab61f7c4dba8461ebbd9d0c6755.shtml
          // 在上海证券交易所挂牌的证券投资基金使用50～59开头6位数字编码，在深圳证券交易所挂牌的证券投资基金使用15～19开头6位数字编码。
          code = code.replace(/^(of)(5[0-9])/g, 'sh$2').replace(/^(of)(1[5-9])/g, 'sz$2');
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

  async getStockData(codes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    console.log('fetching stock data…');
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }
    const statusBarStocks = this.model.getCfg('leek-fund.statusBarStock');

    const url = `https://hq.sinajs.cn/list=${codes.join(',')}`;
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
        }
      }
      this.defaultBarStock = sz || stockList[0];
      const res = sortData(stockList, order);
      this.stockList = res;
      if (barStockList.length === 0) {
        // 用户没有设置股票时，默认展示上证或第一个
        barStockList.push(this.defaultBarStock);
      }
      this.statusBarStockList = sortData(barStockList, order);
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
