import { StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekTreeItem } from '../leekTreeItem';
import { FundService } from '../service';
import { FundModel } from './model';

export class StatusBar {
  private model: FundModel;
  private fundSrv: FundService;
  private riseColor: string;
  private fallColor: string;
  private stockBarItem: StatusBarItem;
  private fundBarItem: StatusBarItem;

  constructor(fundSrv: FundService) {
    this.model = new FundModel();
    this.fundSrv = fundSrv;
    this.riseColor = this.model.getCfg('leek-fund.riseColor');
    this.fallColor = this.model.getCfg('leek-fund.fallColor');
    this.stockBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
    this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 2);
  }
  refresh() {
    this.createStockStatusBar(this.fundSrv.szItem);
    this.createFundStatusBar();
  }
  createStockStatusBar(item: LeekTreeItem) {
    if (!item) return;
    const {
      type,
      symbol,
      price,
      percent,
      open,
      yestclose,
      high,
      low,
      updown,
    } = item.info;
    const deLow = percent.indexOf('-') === -1;
    this.stockBarItem.text = `「${item.info.name}」${price}  ${
      deLow ? '📈' : '📉'
    }（${percent}%）`;

    this.stockBarItem.tooltip = `【今日行情】${type}${symbol}\n涨跌：${updown}   百分：${percent}%\n最高：${high}   最低：${low}\n今开：${open}   昨收：${yestclose}`;
    this.stockBarItem.color = deLow ? this.riseColor : this.fallColor;
    this.stockBarItem.show();
    return this.stockBarItem;
  }

  createFundStatusBar() {
    this.fundBarItem.text = `  「基金」详情`;
    this.fundBarItem.color = this.riseColor;
    this.fundBarItem.tooltip = this.getFundTooltipText();
    this.fundBarItem.show();
    return this.fundBarItem;
  }

  private getFundTooltipText() {
    let fundTemplate = '';
    for (let fund of this.fundSrv.fundList) {
      fundTemplate += `${
        fund.info.percent.indexOf('-') === 0
          ? '↓ '
          : fund.info.percent === '0.00%'
          ? ''
          : '↑ '
      } ${fund.info.percent}   「${
        fund.info.name
      }」\n-------------------------------------\n`;
    }
    return `【基金详情】\n\n ${fundTemplate}`;
  }
}
