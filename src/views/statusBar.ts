import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekTreeItem } from '../leekTreeItem';
import { LeekFundService } from '../service';
import { LeekFundModel } from './model';

export class StatusBar {
  private model: LeekFundModel;
  private service: LeekFundService;
  private fundBarItem: StatusBarItem;
  private statusBarList: StatusBarItem[] = [];
  constructor(service: LeekFundService) {
    this.model = new LeekFundModel();
    this.service = service;
    this.statusBarList = [];
    this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 4);
    this.refreshStockStatusBar();
  }

  get riseColor(): string {
    return this.model.getCfg('leek-fund.riseColor');
  }
  get fallColor(): string {
    return this.model.getCfg('leek-fund.fallColor');
  }

  refresh() {
    this.refreshFundStatusBar();
    // this.statusBarList.forEach((bar) => bar.hide());
    this.refreshStockStatusBar();
  }

  refreshStockStatusBar() {
    const statusBarStockList = this.service.statusBarStockList;
    let count = statusBarStockList.length - this.statusBarList.length;
    if (count > 0) {
      while (--count >= 0) {
        const stockBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
        this.statusBarList.push(stockBarItem);
      }
    } else if (count < 0) {
      let num = Math.abs(count);
      while (--num >= 0) {
        const bar = this.statusBarList.pop();
        bar?.hide();
        bar?.dispose();
      }
    }
    statusBarStockList.forEach((stock, index) => {
      this.udpateBarInfo(this.statusBarList[index], stock);
    });
  }

  udpateBarInfo(stockBarItem: StatusBarItem, item: LeekTreeItem | null) {
    if (!item) {
      return;
    }
    const { type, symbol, price, percent, open, yestclose, high, low, updown } = item.info;
    const deLow = percent.indexOf('-') === -1;
    stockBarItem.text = `「${this.service.showLabel ? item.info.name : item.id}」${price}  ${
      deLow ? '📈' : '📉'
    }（${percent}%）`;

    stockBarItem.tooltip = `【今日行情】${type}${symbol}\n涨跌：${updown}   百分：${percent}%\n最高：${high}   最低：${low}\n今开：${open}   昨收：${yestclose}`;
    stockBarItem.color = deLow ? this.riseColor : this.fallColor;
    stockBarItem.show();
    return stockBarItem;
  }

  refreshFundStatusBar() {
    this.fundBarItem.text = `🐥🐥🐥$(pulse)`;
    this.fundBarItem.color = this.riseColor;
    this.fundBarItem.tooltip = this.getFundTooltipText();
    this.fundBarItem.show();
    return this.fundBarItem;
  }

  private getFundTooltipText() {
    let fundTemplate = '';
    for (let fund of this.service.fundList.slice(0, 14)) {
      fundTemplate += `${
        fund.info.percent.indexOf('-') === 0 ? ' ↓ ' : fund.info.percent === '0.00' ? '' : ' ↑ '
      } ${fund.info.percent}%   「${
        fund.info.name
      }」\n--------------------------------------------\n`;
    }
    // tooltip 有限定高度，所以只展示最多14只基金
    const tips = this.service.fundList.length >= 14 ? '（只展示前14只）' : '';
    return `\n【基金详情】\n\n ${fundTemplate}${tips}`;
  }
}
