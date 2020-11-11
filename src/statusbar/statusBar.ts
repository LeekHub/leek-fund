import { StatusBarAlignment, StatusBarItem, window, Command } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import StockService from '../explorer/stockService';
import FundService from '../explorer/fundService';
import { events, formatLabelString } from '../shared/utils';
import { DEFAULT_LABEL_FORMAT } from '../shared/constant';
import globalState from '../globalState';

export class StatusBar {
  private stockService: StockService;
  private fundService: FundService;
  private fundBarItem: StatusBarItem;
  private statusBarList: StatusBarItem[] = [];
  private statusBarItemLabelFormat: string = '';
  constructor(stockService: StockService, fundService: FundService) {
    this.stockService = stockService;
    this.fundService = fundService;
    this.statusBarList = [];
    this.fundBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 3);
    this.refreshStockStatusBar();
    /* events.on('updateConfig:leek-fund.statusBarStock',()=>{

    }) */
  }

  get riseColor(): string {
    return LeekFundConfig.getConfig('leek-fund.riseColor');
  }
  get fallColor(): string {
    return LeekFundConfig.getConfig('leek-fund.fallColor');
  }

  refresh() {
    this.refreshFundStatusBar();
    // this.statusBarList.forEach((bar) => bar.hide());
    this.refreshStockStatusBar();
  }

  refreshStockStatusBar() {
    if (!this.stockService.stockList.length) return;

    let sz: LeekTreeItem | null = null;
    const barStockList: Array<LeekTreeItem> = new Array(4);
    const statusBarStocks = LeekFundConfig.getConfig('leek-fund.statusBarStock');

    this.statusBarItemLabelFormat =
      globalState.labelFormat?.['statusBarLabelFormat'] ??
      DEFAULT_LABEL_FORMAT.statusBarLabelFormat;

    this.stockService.stockList.forEach((stockItem) => {
      const { code } = stockItem.info;
      if (code === 'sh000001') {
        sz = stockItem;
      }
      if (statusBarStocks.includes(code)) {
        // barStockList.push(stockItem);
        barStockList[statusBarStocks.indexOf(code)] = stockItem;
      }
    });

    if (!barStockList.length) {
      barStockList.push(sz || this.stockService.stockList[0]);
    }

    let count = barStockList.length - this.statusBarList.length;
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
    barStockList.forEach((stock, index) => {
      this.udpateBarInfo(this.statusBarList[index], stock);
    });
  }

  udpateBarInfo(stockBarItem: StatusBarItem, item: LeekTreeItem | null) {
    if (!item) {
      return;
    }
    const { type, symbol, price, percent, open, yestclose, high, low, updown } = item.info;
    const deLow = percent.indexOf('-') === -1;
    /* stockBarItem.text = `「${this.stockService.showLabel ? item.info.name : item.id}」${price}  ${
      deLow ? '📈' : '📉'
    }（${percent}%）`; */
    stockBarItem.text = formatLabelString(this.statusBarItemLabelFormat, {
      ...item.info,
      percent: `${percent}%`,
      icon: deLow ? '📈' : '📉',
    });

    stockBarItem.tooltip = `【今日行情】${type}${symbol}\n涨跌：${updown}   百分：${percent}%\n最高：${high}   最低：${low}\n今开：${open}   昨收：${yestclose}`;
    stockBarItem.color = deLow ? this.riseColor : this.fallColor;
    stockBarItem.command = {
      title: 'Change stock',
      command: 'leek-fund.changeStatusBarItem',
      arguments: [item.id],
    };
    stockBarItem.show();
    return stockBarItem;
  }

  refreshFundStatusBar() {
    this.fundBarItem.text = `🐥$(pulse)`;
    this.fundBarItem.color = this.riseColor;
    this.fundBarItem.tooltip = this.getFundTooltipText();
    this.fundBarItem.show();
    return this.fundBarItem;
  }

  private getFundTooltipText() {
    let fundTemplate = '';
    for (let fund of this.fundService.fundList.slice(0, 14)) {
      fundTemplate += `${
        fund.info.percent.indexOf('-') === 0 ? ' ↓ ' : fund.info.percent === '0.00' ? '' : ' ↑ '
      } ${fund.info.percent}%   「${
        fund.info.name
      }」\n--------------------------------------------\n`;
    }
    // tooltip 有限定高度，所以只展示最多14只基金
    const tips = this.fundService.fundList.length >= 14 ? '（只展示前14只）' : '';
    return `\n【基金详情】\n\n ${fundTemplate}${tips}`;
  }
}
