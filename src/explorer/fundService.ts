import Axios from 'axios';
import { ExtensionContext } from 'vscode';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import {
  caculateEarnings,
  objectToQueryString,
  randHeader,
  sortData,
  toFixed,
  events,
  formatDate,
} from '../shared/utils';
import { LeekService } from './leekService';
import { executeStocksRemind } from '../shared/remindNotification';

const FUND_RANK_API = `http://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/IO.XSRV2.CallbackList['hLfu5s99aaIUp7D4']/NetValueReturn_Service.NetValueReturnOpen?page=1&num=40&sort=form_year&asc=0&ccode=&type2=0&type3=`;

export default class FundService extends LeekService {
  private context: ExtensionContext;
  private totalAmount: number; // 总持仓
  private totalProfit: number; // 总收益
  private updateTime: string; // 更新时间
  private amountRefreshCount: number; // 在一个轮询周期内，刷新数据的次数
  private fundCodesSet: Set<string>; // 存储fundCode的集合
  public fundList: Array<LeekTreeItem> = [];

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
    this.totalAmount = 0;
    this.totalProfit = 0;
    this.updateTime = '';
    this.amountRefreshCount = 0;
    this.fundCodesSet = new Set();
  }

  setFundList(fundList: Array<LeekTreeItem>) {
    fundList.forEach((fund) => {
      let hasInserted = false;
      for (let index = 0; index < this.fundList.length; index++) {
        if (this.fundList[index].info?.code === fund.info?.code) {
          this.fundList.splice(index, 1, fund);
          hasInserted = true;
          break;
        }
      }
      if (!hasInserted) {
        this.fundList.push(fund);
        hasInserted = true;
      }
    });
  }

  async getData(fundCodes: Array<string>, order: number, groupId: string): Promise<Array<LeekTreeItem>> {
    if (!fundCodes.length) {
      return [];
    }
    // console.log('fetching fund data……');
    try {
      const groupIndex: number = parseInt(groupId.replace('fundGroup_', ''));
      this.amountRefreshCount = groupIndex === 0 ? 0 : this.amountRefreshCount;
      if (this.amountRefreshCount === 0) {
        this.totalAmount = 0;
        this.totalProfit = 0;
        this.updateTime = '';
        this.fundCodesSet.clear();
      }

      const fundInfo = await FundService.qryFundInfo(fundCodes);
      const Datas = fundInfo.Datas || [];
      const fundAmountObj: any = globalState.fundAmount;
      const keyLength = Object.keys(fundAmountObj).length;
      const data = Datas.map((item: any) => {
        const { SHORTNAME, FCODE, GSZ, NAV, PDATE, GZTIME, GSZZL, NAVCHGRT } = item;
        const time = item.GZTIME.substr(0, 10);
        const isUpdated = item.PDATE.substr(0, 10) === time; // 判断闭市的时候
        let earnings = 0;
        let amount = 0;
        let unitPrice = 0;
        let earningPercent = 0;
        let profitPercent = 0;
        let priceDate = '';
        // 不填写的时候不计算
        if (keyLength) {
          amount = fundAmountObj[FCODE]?.amount || 0;
          unitPrice = fundAmountObj[FCODE]?.unitPrice || 0;
          priceDate = fundAmountObj[FCODE]?.priceDate || '';
          const price = fundAmountObj[FCODE]?.price || 0;
          const yestEarnings = fundAmountObj[FCODE]?.earnings || 0;
          const latestProfit = caculateEarnings(amount, price, GSZ);
          // 闭市的时候显示上一次盈亏
          earnings = amount === 0 ? 0 : isUpdated ? yestEarnings : latestProfit;
          profitPercent = (price - unitPrice) / unitPrice;
          // 收益率
          earningPercent = toFixed(profitPercent, 2, 100);
        }

        const obj = {
          id: `${groupId}_${FCODE}`,
          name: SHORTNAME,
          code: FCODE,
          price: GSZ, // 今日估值
          percent: isNaN(Number(GSZZL)) ? NAVCHGRT : GSZZL, // 当日估值没有取前日（海外基）
          yestpercent: NAVCHGRT,
          yestclose: NAV, // 昨日净值
          showLabel: this.showLabel,
          earnings: toFixed(earnings), // 盈亏
          isUpdated,
          amount, // 持仓金额
          unitPrice, // 成本价
          priceDate,
          earningPercent, // 收益率
          t2: GSZZL === '--' ? true : false, // 海外基金t2
          time: GSZZL === '--' ? PDATE : GZTIME, // 更新时间
          showEarnings: keyLength > 0 && amount !== 0,
          yestPriceDate: PDATE,
        };
        this.updateTime = obj.time;
        if (!this.fundCodesSet.has(item.FCODE)) {
          this.fundCodesSet.add(item.FCODE);
          this.totalAmount += amount;
          this.totalProfit += earnings;
        }
        return new LeekTreeItem(obj, this.context);
      });

      const fundList = sortData(data, order);
      executeStocksRemind(fundList, this.fundList);
      const oldFundList = this.fundList;
      this.setFundList(fundList);
      events.emit('fundListUpdate', this.fundList, oldFundList);

      this.amountRefreshCount++;
      if (this.amountRefreshCount === globalState.fundLists.length) {
        events.emit('updateBar:profit-refresh', {
          fundProfit: toFixed(this.totalProfit),
          fundAmount: toFixed(this.totalAmount),
          fundProfitPercent: toFixed(this.totalProfit / this.totalAmount, 2, 100),
          priceDate: formatDate(this.updateTime),
        });
      }

      return fundList;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  static qryFundInfo(fundCodes: string[]): Promise<any> {
    const params: any = {
      pageIndex: 1,
      pageSize: fundCodes.length,
      appType: 'ttjj',
      product: 'EFund',
      plat: 'Android',
      deviceid: globalState.deviceId,
      Version: 1,
      Fcodes: fundCodes.join(','),
    };

    return new Promise((resolve) => {
      if (!params.deviceid || !params.Fcodes) {
        resolve([]);
      } else {
        const url =
          'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo' + objectToQueryString(params);
        Axios.get(url, {
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

  static async getRankFund(): Promise<Array<any>> {
    console.log('get ranking fund');
    const url = FUND_RANK_API;
    const response = await Axios.get(url, {
      headers: randHeader(),
    });
    const sIndex = response.data.indexOf(']({');
    const data = response.data.slice(sIndex + 2, -2);
    return JSON.parse(data).data || [];
  }
}
