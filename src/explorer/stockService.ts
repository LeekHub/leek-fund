import Axios from 'axios';
import { decode } from 'iconv-lite';
import { ExtensionContext, QuickPickItem, window } from 'vscode';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { HeldData } from '../shared/typed';
import { executeStocksRemind } from '../shared/remindNotification';
import { calcFixedPriceNumber, events, formatNumber, randHeader, sortData } from '../shared/utils';
import { LeekService } from './leekService';
import moment = require('moment');

export default class StockService extends LeekService {
  public stockList: Array<LeekTreeItem> = [];
  private context: ExtensionContext;
  private token: string = '';

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
  }
  /**
   * 获取自选,去掉大盘数据
   * @returns
   */
  getSelfSelected() {
    const s =
      'sh000001,sh000300,sh000016,sh000688,usr_ixic,usr_dji,usr_inx,nf_IF0,nf_IH0,nf_IC0,nf_IM0,hf_OIL,hf_CHA50CFD';
    const maps = s.split(',');
    return this.stockList.filter((item) => !maps.includes(item.info.code));
  }
  async getToken(): Promise<string> {
    if (this.token !== '') return this.token;

    const res = await Axios.get('https://xueqiu.com/');
    const cookies: string[] = res.headers['set-cookie'];

    const param: string = cookies.filter((key) => key.includes('xq_a_token'))[0] || '';
    this.token = param.split(';')[0] || '';
    console.log("🚀 ~ StockService ~ getToken ~ this.token:", this.token);

    return this.token;
  }

  async getData(codes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    // console.log('fetching stock data…');
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }

    // 兼容2.1-2.5版本中以大写开头及cnf_开头的期货代码
    const transFuture = (code: string) => {
      if (/^[A-Z]+/.test(code)) {
        return code.replace(/^[A-Z]+/, (it: string) => `nf_${it}`);
      } else if (/cnf_/.test(code)) {
        return code.replace('cnf_', 'nf_');
      }
      return code;
    };

    let stockCodes = codes.map(transFuture);
    const hkCodes: Array<string> = []; // 港股单独请求雪球数据源
    stockCodes = stockCodes.filter((code) => {
      if (code.startsWith('hk')) {
        const _code = code.startsWith('hk0') ? code.replace('hk', '') : code.toUpperCase(); // 个股去掉'hk', 指数保留'hk'并转为大写
        hkCodes.push(_code);
        return false;
      } else {
        return true;
      }
    });

    let stockList: Array<LeekTreeItem> = [];
    const result = await Promise.allSettled([
      this.getStockData(stockCodes),
      this.getHKStockData(hkCodes),
    ]);
    result.forEach((item) => {
      if (item.status === 'fulfilled') {
        stockList = stockList.concat(item.value);
      }
    });

    const res = sortData(stockList, order);
    executeStocksRemind(res, this.stockList);
    const oldStockList = this.stockList;
    this.stockList = res;
    events.emit('updateBar:stock-profit-refresh', this);
    events.emit('stockListUpdate', this.stockList, oldStockList);
    return res;
  }

  async getStockData(codes: Array<string>): Promise<Array<LeekTreeItem>> {
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }

    let aStockCount = 0;
    let usStockCount = 0;
    let cnfStockCount = 0;
    let hfStockCount = 0;
    let noDataStockCount = 0;
    let stockList: Array<LeekTreeItem> = [];

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
        headers: {
          ...randHeader(),
          Referer: 'http://finance.sina.com.cn/',
        },
      });
      if (/FAILED/.test(resp.data)) {
        if (codes.length === 1) {
          window.showErrorMessage(
            `fail: error Stock code in ${codes}, please delete error Stock code.`
          );
          return [];
        }
        for (const code of codes) {
          stockList = stockList.concat(await this.getStockData(new Array(code)));
        }
      } else {
        const splitData = resp.data.split(';\n');
        const stockPrice: {
          [key: string]: {
            amount: number;
            earnings: number;
            name: string;
            price: string;
            unitPrice: number;
          };
        } = globalState.stockPrice;

        for (let i = 0; i < splitData.length - 1; i++) {
          const code = splitData[i].split('="')[0].split('var hq_str_')[1];
          const params = splitData[i].split('="')[1].split(',');
          let type = code.substr(0, 2) || 'sh';
          let symbol = code.substr(2);
          let stockItem: any;
          let fixedNumber = 2;
          if (params.length > 1) {
            if (/^(sh|sz|bj)/.test(code)) {
              // A股
              let open = params[1];
              let yestclose = params[2];
              let price = params[3];
              let high = params[4];
              let low = params[5];
              fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
              const profitData = stockPrice[code] || {};
              const heldData: HeldData = {};
              if (profitData.amount) {
                // 表示是持仓股
                heldData.heldAmount = profitData.amount;
                heldData.heldPrice = profitData.unitPrice;
              }
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
                time: `${params[30]} ${params[31]}`,
                percent: '',
                ...heldData,
              };
              aStockCount += 1;
            } else if (/^gb_/.test(code)) {
              symbol = code.substr(3);
              let open = params[5];
              let yestclose = params[26];
              let price = params[1];
              let high = params[6];
              let low = params[7];
              fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
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
              fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
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
            } else if (/nf_/.test(code)) {
              /* 解析格式，与股票略有不同
              var hq_str_V2201="PVC2201,230000,
              8585.00, 8692.00, 8467.00, 8641.00, // params[2,3,4,5] 开，高，低，昨收
              8673.00, 8674.00, // params[6, 7] 买一、卖一价
              8675.00, // 现价 params[8]
              8630.00, // 均价
              8821.00, // 昨日结算价【一般软件的行情涨跌幅按这个价格显示涨跌幅】（后续考虑配置项，设置按收盘价还是结算价显示涨跌幅）
              109, // 买一量
              2, // 卖一量
              289274, // 持仓量
              230643, //总量
              连, // params[8 + 7] 交易所名称 ["连","沪", "郑"]
              PVC,2021-11-26,1,9243.000,8611.000,9243.000,8251.000,9435.000,8108.000,13380.000,8108.000,445.541";
              */
              let name = params[0];
              let open = params[2];
              let high = params[3];
              let low = params[4];
              // let yestclose = params[5]; // 昨收盘。但是这个字段不返回数据。
              let price = params[8];
              let yestCallPrice = params[8 + 2]; // 结算价
              /*
                由于期货默认采用结算价计算涨跌幅。本项目的涨跌幅使用【昨收盘】进行计算，
                新浪接口对于商品期货的 昨收盘返回 0.0，导致无法计算【昨收盘涨跌幅】，只能计算【结算涨跌幅】。
                使用期货的结算价对应 股票通用的 【昨收盘 yestclose】字段以方便计算涨跌幅的显示。
              */
              let yestclose = params[8 + 2];
              let volume = params[8 + 6]; // 成交量
              //股指期货
              const stockIndexFuture =
                /nf_IC/.test(code) || // 中证500
                /nf_IF/.test(code) || // 沪深300
                /nf_IH/.test(code) || // 上证50
                /nf_IM/.test(code) || // 中证 1000
                /nf_TF/.test(code) || // 五债
                /nf_TS/.test(code) || // 二债
                /nf_T\d+/.test(code) || // 十债
                /nf_TL/.test(code); // 三十年国债
              if (stockIndexFuture) {
                // 0 开盘       1 最高      2  最低     3 收盘
                // ['5372.000', '5585.000', '5343.000', '5581.600',
                // 4 成交量                 6 持仓量
                // '47855', '261716510.000', '124729.000', '5581.600',
                // '0.000', '5849.800', '4786.200', '0.000', '0.000',
                //  13 昨收盘   14 昨天结算
                // '5342.800', '5318.000', '126776.000', '5581.600',
                // '4', '0.000', '0', '0.000', '0', '0.000', '0', '0.000', '0', '5582.000', '2', '0.000', '0', '0.000', '0', '0.000', '0', '0.000', '0', '2022-04-29', '15:00:00', '300', '0', '', '', '', '', '', '', '', '',
                // 48        49  名称
                // '5468.948', '中证500指数期货2206"']

                name = params[49].slice(0, -1); // 最后一位去掉 "
                open = params[0];
                high = params[1];
                low = params[2];
                price = params[3];
                volume = params[4];
                yestclose = params[13];
                yestCallPrice = params[14];
              }
              fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
              stockItem = {
                code: code,
                name: name,
                open: formatNumber(open, fixedNumber, false),
                yestclose: formatNumber(yestclose, fixedNumber, false),
                yestcallprice: formatNumber(yestCallPrice, fixedNumber, false),
                price: formatNumber(price, fixedNumber, false),
                low: formatNumber(low, fixedNumber, false),
                high: formatNumber(high, fixedNumber, false),
                volume: formatNumber(volume, 2),
                amount: '接口无数据',
                percent: '',
              };
              type = 'nf_';
              cnfStockCount += 1;
            } else if (/hf_/.test(code)) {
              // 海外期货格式
              // 0 当前价格
              // ['105.306', '',
              //  2  买一价  3 卖一价  4  最高价   5 最低价
              // '105.270', '105.290', '105.540', '102.950',
              //  6 时间   7 昨日结算价  8 开盘价  9 持仓量
              // '15:51:34', '102.410', '103.500', '250168.000',
              // 10 买 11 卖 12 日期      13 名称  14 成交量
              // '5', '2', '2022-05-04', 'WTI纽约原油2206', '28346"']
              // 当前价格
              let price = params[0];
              // 名称
              let name = params[13];
              let open = params[8];
              let high = params[4];
              let low = params[5];
              let yestclose = params[7]; // 昨收盘
              let yestCallPrice = params[7]; // 昨结算
              let volume = params[14].slice(0, -1); // 成交量。slice 去掉最后一位 "
              fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);

              stockItem = {
                code: code,
                name: name,
                open: formatNumber(open, fixedNumber, false),
                yestclose: formatNumber(yestclose, fixedNumber, false),
                yestcallprice: formatNumber(yestCallPrice, fixedNumber, false),
                price: formatNumber(price, fixedNumber, false),
                low: formatNumber(low, fixedNumber, false),
                high: formatNumber(high, fixedNumber, false),
                volume: formatNumber(volume, 2),
                amount: '接口无数据',
                percent: '',
              };
              type = 'hf_';
              hfStockCount += 1;
            }
            if (stockItem) {
              const { yestclose, open } = stockItem;
              let { price } = stockItem;
              /*  if (open === price && price === '0.00') {
              stockItem.isStop = true;
            } */

              // 竞价阶段部分开盘和价格为0.00导致显示 -100%
              try {
                if (Number(open) <= 0) {
                  price = yestclose;
                }
              } catch (err) {
                console.error(err);
              }
              stockItem.showLabel = this.showLabel;
              stockItem.isStock = true;
              stockItem.type = type;
              stockItem.symbol = symbol;
              stockItem.updown = formatNumber(+price - +yestclose, fixedNumber, false);
              stockItem.percent =
                (stockItem.updown >= 0 ? '+' : '-') +
                formatNumber((Math.abs(stockItem.updown) / +yestclose) * 100, 2, false);

              const treeItem = new LeekTreeItem(stockItem, this.context);
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
      }
    } catch (err) {
      console.info(url);
      console.error(err);
      if (globalState.showStockErrorInfo) {
        window.showErrorMessage(`fail: Stock error ` + url);
        globalState.showStockErrorInfo = false;
        globalState.telemetry.sendEvent('error: stockService', {
          url,
          error: err,
        });
      }
    }

    globalState.aStockCount = aStockCount;
    globalState.usStockCount = usStockCount;
    globalState.cnfStockCount = cnfStockCount;
    globalState.hfStockCount = hfStockCount;
    globalState.noDataStockCount = noDataStockCount;
    return stockList;
  }

  async getHKStockData(codes: Array<string>): Promise<Array<LeekTreeItem>> {
    if ((codes && codes.length === 0) || !codes) {
      return [];
    }

    let hkStockCount = 0;
    let stockList: Array<LeekTreeItem> = [];

    const url = `https://stock.xueqiu.com/v5/stock/batch/quote.json?symbol=${codes.join(',')}`;
    try {
      const resp = await Axios.get(url, {
        responseType: 'text',
        transformResponse: [
          (data) => {
            const body = JSON.parse(data);
            return body;
          },
        ],
        headers: {
          ...randHeader(),
          Referer: 'https://stock.xueqiu.com/',
          // 雪球token规则变化，临时解决
          // Cookie: await this.getToken(),
          "cookie": "acw_tc=2760826017254576052523235e0b5e24ba6432d19252e786e33ed3e0ee2db8; acw_sc__v2=66d864c5c68f742d150271b6da3a371072df5bc6; xq_a_token=49c5e355d2fc1b871fde601c659cf9ae1457a889; xqat=49c5e355d2fc1b871fde601c659cf9ae1457a889; xq_r_token=250d5a132310b89c6cf1193e084989736506a297; xq_id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1aWQiOi0xLCJpc3MiOiJ1YyIsImV4cCI6MTcyNzkxNjc3OCwiY3RtIjoxNzI1NDU3NTg4MjU3LCJjaWQiOiJkOWQwbjRBWnVwIn0.ggqWWe7vvq1GcgRDS6e6abMOSiu6EqfW84QXQjeYQrLuja8zFA-KGrQBlcH6vV74bL6_NR1qROWqKp5fF7acOYagqLEUIXH4xG9M_Pf_EvscNzcp9IitW-0a5CEivezAIoms_ajKpEOp-toXQq7aOG4KfNw6Paktzr4nlrBXtmuXb9V0eaIFXnQAhjVK2_2-X351YGYfUesT0io22BYJUus037if8O_H3GmSF9xWTFcBWZ3seQl2wG_w1fwVhzP1SzcjiIzEEIU8QXttFMMUmUkG8SWsFV18JFKYEu618ZTItxE6-ijxL5Dk0oKt8MV58uz9chQ4o4vlukd_-UguTA; cookiesu=411725457605875; u=411725457605875; Hm_lvt_1db88642e346389874251b5a1eded6e3=1725457610; HMACCOUNT=2546BEF12550F4D4; device_id=a0814ba472ea428d8488ca48833b7db8; smidV2=2024090421465125ea22186efc27f3de9c33bd7df8002b00f1792dfda7b5c90; is_overseas=0; Hm_lpvt_1db88642e346389874251b5a1eded6e3=1725457619; .thumbcache_f24b8bbe5a5934237bbc0eda20c1b6e7=gyo2b8VGfAxa5SfTipuQx8ezwddhs93f7FW74dnOzyirEbx849B+Ff3Z7VnhDgFgOEPO8rw+tAuePz+dXrbBXQ%3D%3D; ssxmod_itna=eqRxyDciDQG=Dtmx0dGQDHFySC7fYDnG7nD8eK9cx0yDReGzDAxn40iDt=a5/j7OxAPYi0424Dun2Dh3UKWOhLINTInBw5jDbxiTD4q07Db4GkDAqiOD7kRwoD435GwD0eG+DD4DWtXI=D7rXgUkNXWq=07TNDmb=uDGQcDiU3xi5Z/L=/8eGWnqGfDDoDYbNSAeQDGkKDbTQDITXKb8hxqcj7Ha=2CPDuCa6YcqDLfQFHxB=ulmPSWFODtw=cnnQ2UAX=OuTd4hp3WxA3GuAxb8GY4rEKWhZxf6AifG+3fB3ST3e4Gw+UI04DDWDEd4D===; ssxmod_itna2=eqRxyDciDQG=Dtmx0dGQDHFySC7fYDnG7nD8eK9xn9S4DsLDwxqjKG7d4D==",
        },
      });
      const { data, error_code, error_description } = resp.data;
      if (error_code) {
        window.showErrorMessage(
          `fail: a HK Stock request error has occured. (${error_code}, ${error_description})`
        );
        return [];
      } else {
        const stocks = data.items || [];
        stocks.forEach((item: any, index: number) => {
          if (item.quote) {
            const quote = item.quote;
            let open = quote.open?.toString() || '0';
            let yestclose = quote.last_close?.toString() || '0';
            let price = quote.current?.toString() || '0';
            let high = quote.high?.toString() || '0';
            let low = quote.low?.toString() || '0';
            const fixedNumber = calcFixedPriceNumber(open, yestclose, price, high, low);
            const stockItem: any = {
              code: quote.symbol.startsWith('HK')
                ? quote.symbol.replace('HK', 'hk')
                : 'hk' + quote.symbol,
              name: quote.name,
              open: formatNumber(open, fixedNumber, false),
              yestclose: formatNumber(yestclose, fixedNumber, false),
              price: formatNumber(price, fixedNumber, false),
              low: formatNumber(low, fixedNumber, false),
              high: formatNumber(high, fixedNumber, false),
              volume: formatNumber(quote.volume || 0, 2),
              amount: formatNumber(quote.amount || 0, 2),
              percent: '',
              time: `${moment(quote.time).format('YYYY-MM-DD HH:mm:ss')}`,
            };
            hkStockCount += 1;
            if (stockItem) {
              const { yestclose, open } = stockItem;
              let { price } = stockItem;
              // 竞价阶段部分开盘和价格为0.00导致显示 -100%
              if (Number(open) <= 0) {
                price = yestclose;
              }
              stockItem.showLabel = this.showLabel;
              stockItem.isStock = true;
              stockItem.type = 'hk';
              stockItem.symbol = quote.code;
              stockItem.updown = formatNumber(+price - +yestclose, fixedNumber, false);
              stockItem.percent =
                (stockItem.updown >= 0 ? '+' : '-') +
                formatNumber((Math.abs(stockItem.updown) / +yestclose) * 100, 2, false);

              const treeItem = new LeekTreeItem(stockItem, this.context);
              stockList.push(treeItem);
            }
          } else {
            window.showErrorMessage(
              `fail: error Stock code in ${codes[index]}, please delete error Stock code.`
            );
          }
        });
      }
    } catch (err) {
      console.info(url);
      console.error(err);
      if (globalState.showStockErrorInfo) {
        window.showErrorMessage(`fail: HK Stock error ` + url);
        globalState.showStockErrorInfo = false;
        globalState.telemetry.sendEvent('error: stockService', {
          url,
          error: err,
        });
      }
    }

    globalState.hkStockCount = hkStockCount;
    return stockList;
  }

  // https://github.com/LeekHub/leek-fund/issues/266
  async getStockSuggestList(searchText = ''): Promise<QuickPickItem[]> {
    if (!searchText) {
      return [{ label: '请输入关键词查询，如：0000001 或 上证指数' }];
    }

    const result: QuickPickItem[] = [];

    // 期货大写字母开头
    const isFuture =
      /^[A-Z]/.test(searchText.charAt(0)) ||
      /nf_/.test(searchText) ||
      /hf_/.test(searchText) ||
      /fx_/.test(searchText);
    if (isFuture) {
      //期货使用新浪数据源
      const type = '85,86,88';
      const futureUrl = `http://suggest3.sinajs.cn/suggest/type=${type}&key=${encodeURIComponent(
        searchText
      )}`;
      try {
        console.log('getFutureSuggestList: getting...');
        const futureResponse = await Axios.get(futureUrl, {
          responseType: 'arraybuffer',
          transformResponse: [
            (data) => {
              const body = decode(data, 'GB18030');
              return body;
            },
          ],
          headers: randHeader(),
        });
        const text = futureResponse.data.slice(18, -2);
        if (text === '') {
          return result;
        }
        const tempArr = text.split(';');
        console.log(tempArr);

        tempArr.forEach((item: string) => {
          const arr = item.split(',');
          let code = arr[3];
          let market = arr[1];
          code = code.toUpperCase();
          // 国内交易所
          if (market === '85' || market === '88') {
            code = 'nf_' + code;
          } else if (market === '86') {
            // 海外交易所
            code = 'hf_' + code;
          }
          // if (code.substr(0, 2) === 'of') {
          // 修改lof以及etf的前缀，防止被过滤
          // http://www.csisc.cn/zbscbzw/cpbmjj/201212/f3263ab61f7c4dba8461ebbd9d0c6755.shtml
          // 在上海证券交易所挂牌的证券投资基金使用50～59开头6位数字编码，在深圳证券交易所挂牌的证券投资基金使用15～19开头6位数字编码。
          // code = code.replace(/^(of)(5[0-9])/g, 'sh$2').replace(/^(of)(1[5-9])/g, 'sz$2');
          // }

          // 期货 suggest 请求返回的 code 小写开头改为大写

          // if (code === 'hkhsi' || code === 'hkhscei' || isFuture) {
          //   code = code.toUpperCase().replace('HK', 'hk');
          // }

          // 过滤多余的 us. 开头的股干扰
          // if ((STOCK_TYPE.includes(code.substr(0, 2)) && !code.startsWith('us.')) || isFuture) {
          result.push({
            label: `${code} | ${arr[4]}`,
            description: arr[7] && arr[7].replace(/"/g, ''),
          });
          // }
        });
        return result;
      } catch (err) {
        console.log(futureUrl);
        console.error(err);
        return [{ label: '期货查询失败，请重试' }];
      }
    } else {
      //股票使用雪球数据源
      const stockUrl = `https://xueqiu.com/stock/search.json?code=${encodeURIComponent(
        searchText
      )}`;
      try {
        console.log('getStockSuggestList: getting...');
        const stockResponse = await Axios.get(stockUrl, {
          responseType: 'text',
          transformResponse: [
            (data) => {
              const body = JSON.parse(data);
              return body;
            },
          ],
          headers: {
            ...randHeader(),
            Referer: 'https://stock.xueqiu.com/',
            Cookie: await this.getToken(),
          },
        });
        const stocks = stockResponse.data.stocks || [];
        stocks.forEach((item: any) => {
          const { code, name } = item;
          if (code.startsWith('SH') || code.startsWith('SZ') || code.startsWith('BJ')) {
            const _code = code.toLowerCase();
            result.push({
              label: `${_code} | ${name}`,
              description: `A股`,
            });
          } else if (/^0\d{4}$/.test(code) || /^HK[A-Z].*/.test(code)) {
            // 港股个股 || 港股指数
            const _code = code.startsWith('HK') ? code.replace('HK', 'hk') : 'hk' + code;
            result.push({
              label: `${_code} | ${name}`,
              description: `港股`,
            });
          } else if (/\.?[A-Z]*[A-Z]$/.test(code)) {
            const _code = 'us' + code.toLowerCase().replace('.', ''); // 去除美股指数前面的'.'
            result.push({
              label: `${_code} | ${name}`,
              description: `美股`,
            });
          }
        });
        return result;
      } catch (err) {
        console.log(stockUrl);
        console.error(err);
        return [{ label: '股票查询失败，请重试' }];
      }
    }
  }
}
