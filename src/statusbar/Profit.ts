/**
 * 收益状态栏显示
 * 目前只支持基金
 * TODO: 股票
 */

import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { TIPS_LOSE, TIPS_WIN } from '../shared/constant';
import { LeekFundConfig } from '../shared/leekConfig';
import { ProfitStatusBarInfo } from '../shared/typed';
import { events, formatDate, toFixed } from '../shared/utils';
import StockService from '../explorer/stockService';
import globalState from '../globalState';

const PREFIX = '💰';

export class ProfitStatusBar {
  fundBarItem: StatusBarItem | undefined;
  stockBarItem: StatusBarItem | undefined;
  isEnable: boolean = false;
  hideStatusBar: boolean = false;
  unsubscribe: Function = () => {};
  fallColor: string = 'green';
  riseColor: string = 'red';
  constructor() {
    this.init();
  }

  init() {
    this.isEnable = LeekFundConfig.getConfig('leek-fund.showEarnings');
    this.hideStatusBar = LeekFundConfig.getConfig('leek-fund.hideStatusBar');
    //如果显示收益 && 显示状态栏
    if (this.isEnable && !this.hideStatusBar) {
      this.riseColor = LeekFundConfig.getConfig('leek-fund.riseColor');
      this.fallColor = LeekFundConfig.getConfig('leek-fund.fallColor');
      this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 2);
      this.fundBarItem.text = `${PREFIX} --`;
      this.fundBarItem.command = 'leek-fund.setFundAmount';
      this.fundBarItem.show();
      this.stockBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
      this.stockBarItem.text = `${PREFIX}  --`;
      this.stockBarItem.command = 'leek-fund.setStockPrice';
      this.stockBarItem.show();

      const profitUpdateListener = (data: ProfitStatusBarInfo) => {
        this.updateFundBarItem(data);
      };
      events.on('updateBar:profit-refresh', profitUpdateListener);
      this.unsubscribe = () => {
        events.off('updateBar:profit-refresh', profitUpdateListener);
        events.off('updateBar:stock-profit-refresh', profitStockUpdateListener);
      };

      const profitStockUpdateListener = (data: StockService) => {
        this.updateStockBarItem(data);
      };
      events.on('updateBar:stock-profit-refresh', profitStockUpdateListener);
    }
  }

  reload() {
    this.riseColor = LeekFundConfig.getConfig('leek-fund.riseColor');
    this.fallColor = LeekFundConfig.getConfig('leek-fund.fallColor');
    const enable: boolean = LeekFundConfig.getConfig('leek-fund.showEarnings');
    const hideStatusBar: boolean = LeekFundConfig.getConfig('leek-fund.hideStatusBar');
    if (this.isEnable !== enable || this.hideStatusBar !== hideStatusBar) {
      this.isEnable = enable;
      this.hideStatusBar = hideStatusBar;
      //如果隐藏状态栏 || 隐藏收益
      if (hideStatusBar || !enable) {
        this.destroy();
      } else {
        this.init();
      }
    }
  }

  updateFundBarItem({ fundProfit = 0, fundProfitPercent = 0, fundAmount = 0, priceDate = '' }) {
    if (this.fundBarItem) {
      this.fundBarItem.text = `${PREFIX} ${fundProfit}`;
      this.fundBarItem.color = fundProfit >= 0 ? this.riseColor : this.fallColor;
      this.fundBarItem.tooltip =
        `「基金收益统计${priceDate}」` +
        [
          ,
          `持仓金额：${fundAmount}元`,
          `今日${fundProfit >= 0 ? '盈利' : '亏损'}：${fundProfit}元`,
          `今日收益率：${fundProfitPercent}%`,
          `${
            fundProfit >= 0
              ? TIPS_WIN[Math.floor(Math.random() * TIPS_WIN.length)]
              : TIPS_LOSE[Math.floor(Math.random() * TIPS_LOSE.length)]
          }`,
        ].join('\r\n-----------------------------\r\n');
      this.fundBarItem.show();
    }
  }

  // TODO
  updateStockBarItem(data: StockService) {
    if (this.stockBarItem) {
      const stockPrice: {
        [key: string]: {
          amount: number;
          earnings: number;
          name: string;
          price: string;
          unitPrice: number;
        };
      } = globalState.stockPrice;
      const stockList = data.getSelfSelected();
      type StockInfoType = {
        id: string;
        name: string;
        low: number | string;
        high: number | string;
        open: number | string;
        percent: string;
        price: number | string;
        amount: number;
        incomeTotal: number | string;
        incomeToday: number | string;
        percentTotal: string;
      };
      const stockInfo: StockInfoType[] = [];
      stockList.forEach((s) => {
        let tmp = {} as StockInfoType;
        const { id, info } = s;
        const { high, low, open, yestclose, percent, price, name } = info;
        if (id && open && price) {
          const config = stockPrice[id];
          if (!config || config.amount === 0 || config.unitPrice === 0) {
            return false;
          }
          const unitPrice = config?.unitPrice || 0;
          const amount = config?.amount || 0;
          // const incomeTotal = amount * (Number(price).toFixed(2) - unitPrice.toFixed(2));
          // const incomeToday = amount * (Number(price).toFixed(2) - Number(open).toFixed(2));
          const incomeTotal = (amount * (Number(price) - unitPrice)).toFixed(2);
          // fix #399，在昨日收盘价没有的时候使用今日开盘价
          const incomeToday = (amount * (Number(price) - Number(yestclose || open))).toFixed(2);
          const percentTotal = ((Number(incomeTotal) / (unitPrice * amount)) * 100).toFixed(2);
          tmp = {
            id,
            name,
            high: '' + high,
            low: '' + low,
            open,
            percent,
            price,
            amount,
            incomeTotal,
            incomeToday,
            percentTotal,
          };
          stockInfo.push(tmp);
        }
      });
      const date = formatDate(new Date());
      const allIncomeToday = stockInfo.reduce((prev, cur) => {
        return prev + Number(cur.incomeToday);
      }, 0);
      const allIncomeTotal = stockInfo.reduce((prev, cur) => {
        return prev + Number(cur.incomeTotal);
      }, 0);
      // Use the year, month, and day variables as needed
      this.stockBarItem.text = `${PREFIX} ${toFixed(allIncomeTotal)} | ${toFixed(allIncomeToday)}`;
      // this.stockBarItem.color = fundProfit >= 0 ? this.riseColor : this.fallColor;
      this.stockBarItem.tooltip =
        `「股票收益统计」 ${date}\r\n \r\n` +
        stockInfo
          .map((v) => {
            return `${v.name} 总收益:${v.incomeTotal} (${v.percentTotal}%) 今天${
              Number(v.incomeToday) > 0 ? '盈利' : '亏损'
            }:${v.incomeToday} (${v.percent}%) \r\n`;
          })
          .join('\r\n-----------------------------\r\n');
      this.stockBarItem.show();
    }
  }

  destroy() {
    this.unsubscribe();
    // this.fundBarItem?.hide();
    this.fundBarItem?.dispose();
    this.stockBarItem?.dispose();
  }
}
