/**
 * 收益状态栏显示
 * 目前只支持基金
 * TODO: 股票
 */

import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { TIPS_LOSE, TIPS_WIN } from '../shared/constant';
import { LeekFundConfig } from '../shared/leekConfig';
import { ProfitStatusBarInfo } from '../shared/typed';
import { events } from '../shared/utils';

const PREFIX = '💰';

export class ProfitStatusBar {
  fundBarItem: StatusBarItem | undefined;
  isEnable: boolean = false;
  unsubscribe: Function = () => {};
  fallColor: string = 'green';
  riseColor: string = 'red';
  constructor() {
    this.init();
  }

  init() {
    this.isEnable = LeekFundConfig.getConfig('leek-fund.showEarnings');
    if (this.isEnable) {
      this.riseColor = LeekFundConfig.getConfig('leek-fund.riseColor');
      this.fallColor = LeekFundConfig.getConfig('leek-fund.fallColor');
      this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 2);
      this.fundBarItem.text = `${PREFIX} --`;
      this.fundBarItem.command = 'leek-fund.setFundAmount';
      this.fundBarItem.show();

      const profitUpdateListener = (data: ProfitStatusBarInfo) => {
        this.updateFundBarItem(data);
        // this.updateStockBarItem(stockProfit);
      };
      events.on('updateBar:profit-refresh', profitUpdateListener);
      this.unsubscribe = () => {
        events.off('updateBar:profit-refresh', profitUpdateListener);
      };
    }
  }

  reload() {
    this.riseColor = LeekFundConfig.getConfig('leek-fund.riseColor');
    this.fallColor = LeekFundConfig.getConfig('leek-fund.fallColor');
    const enable: boolean = LeekFundConfig.getConfig('leek-fund.showEarnings');
    if (this.isEnable !== enable) {
      this.isEnable = enable;
      if (!enable) {
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
  // updateStockBarItem(num = 0) {}

  destroy() {
    this.unsubscribe();
    this.fundBarItem?.dispose();
  }
}
