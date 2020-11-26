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
} from '../shared/utils';
import { LeekService } from './leekService';

const FUND_RANK_API = `https://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/IO.XSRV2.CallbackList['hLfu5s99aaIUp7D4']/NetValueReturn_Service.NetValueReturnOpen?page=1&num=40&sort=form_year&asc=0&ccode=&type2=0&type3=`;

export default class FundService extends LeekService {
  private context: ExtensionContext;
  public fundList: Array<LeekTreeItem> = [];

  constructor(context: ExtensionContext) {
    super();
    this.context = context;
  }

  async getData(fundCodes: Array<string>, order: number): Promise<Array<LeekTreeItem>> {
    if (!fundCodes.length) {
      return [];
    }
    console.log('fetching fund data……');
    try {
      const { Datas = [] } = await FundService.qryFundInfo(fundCodes);
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
        // 不填写的时候不计算
        if (keyLength) {
          amount = fundAmountObj[FCODE]?.amount || 0;
          unitPrice = fundAmountObj[FCODE]?.unitPrice || 0;
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

          // 收益率
          earningPercent = toFixed((price - unitPrice) / unitPrice, 2, 100);
        }

        const obj = {
          name: SHORTNAME,
          code: FCODE,
          price: GSZ, // 今日估值
          percent: isNaN(Number(GSZZL)) ? NAVCHGRT : GSZZL, // 当日估值没有取前日（海外基）
          yestclose: NAV, // 昨日净值
          showLabel: this.showLabel,
          earnings, // 盈亏
          isUpdated,
          amount, // 持仓金额
          unitPrice, // 成本价
          earningPercent, // 收益率
          t2: GSZZL === '--' ? true : false, // 海外基金t2
          time: GSZZL === '--' ? PDATE : GZTIME, // 更新时间
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
