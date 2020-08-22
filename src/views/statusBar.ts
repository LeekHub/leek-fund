import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekTreeItem } from '../leekTreeItem';
import { LeekFundService } from '../service';
import { FundModel } from './model';

export class StatusBar {
  private model: FundModel;
  private fundSrv: LeekFundService;
  private stockBarItem: StatusBarItem;
  private fundBarItem: StatusBarItem;

  constructor(fundSrv: LeekFundService) {
    this.model = new FundModel();
    this.fundSrv = fundSrv;
    this.stockBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
    this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 2);
  }

  get riseColor(): string {
    return this.model.getCfg('leek-fund.riseColor');
  }
  get fallColor(): string {
    return this.model.getCfg('leek-fund.fallColor');
  }

  refresh() {
    this.createStockStatusBar(this.fundSrv.szItem);
    this.createFundStatusBar();
  }

  createStockStatusBar(item: LeekTreeItem | null) {
    if (!item) {
      return;
    }
    const { type, symbol, price, percent, open, yestclose, high, low, updown } = item.info;
    const deLow = percent.indexOf('-') === -1;
    this.stockBarItem.text = `「${item.info.name}」${price}  ${deLow ? '📈' : '📉'}（${percent}%）`;

    this.stockBarItem.tooltip = `【今日行情】${type}${symbol}\n涨跌：${updown}   百分：${percent}%\n最高：${high}   最低：${low}\n今开：${open}   昨收：${yestclose}`;
    this.stockBarItem.color = deLow ? this.riseColor : this.fallColor;
    this.stockBarItem.show();
    return this.stockBarItem;
  }

  createFundStatusBar() {
    this.fundBarItem.text = `🐥$(pulse)`;
    this.fundBarItem.color = this.riseColor;
    this.fundBarItem.tooltip = this.getFundTooltipText();
    this.fundBarItem.show();
    return this.fundBarItem;
  }

  private getFundTooltipText() {
    let fundTemplate = '';
    for (let fund of this.fundSrv.fundList.slice(0, 14)) {
      fundTemplate += `${
        fund.info.percent.indexOf('-') === 0 ? ' ↓ ' : fund.info.percent === '0.00' ? '' : ' ↑ '
      } ${fund.info.percent}%   「${
        fund.info.name
      }」\n--------------------------------------------\n`;
    }
    // tooltip 有限定高度，所以只展示最多14只基金
    const tips = this.fundSrv.fundList.length >= 14 ? '（只展示前14只）' : '';
    return `\n【基金详情】\n\n ${fundTemplate}${tips}`;
  }
}
