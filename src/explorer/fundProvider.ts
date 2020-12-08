import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { SortType } from '../shared/typed';
import FundService from './fundService';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: FundService;
  private order: SortType;

  constructor(service: FundService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.fundSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const fundCodes = LeekFundConfig.getConfig('leek-fund.funds') || [];
    return this.service.getData(fundCodes, this.order);
  }

  getParent(element: LeekTreeItem): LeekTreeItem | null {
    return null;
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    return element;
  }

  changeOrder(): void {
    let order = this.order as number;

    /* fix: 如果基金排序先前是按照持仓金额升序/降序, 按涨跌排序失效的问题 */
    if (Math.abs(order) > 1) {
      this.order = SortType.NORMAL;
    }

    order += 1;
    if (order > 1) {
      this.order = SortType.DESC;
    } else if (order === 1) {
      this.order = SortType.ASC;
    } else if (order === 0) {
      this.order = SortType.NORMAL;
    }
    LeekFundConfig.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }

  changeAmountOrder(): void {
    let order = this.order as number;

    if (order === SortType.AMOUNTDESC) {
      this.order = SortType.AMOUNTASC;
    } else if (order === SortType.AMOUNTASC) {
      this.order = SortType.AMOUNTDESC;
    } else {
      this.order = SortType.AMOUNTDESC;
    }
    LeekFundConfig.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }
}
