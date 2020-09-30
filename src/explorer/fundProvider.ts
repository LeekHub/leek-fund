import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { SortType } from '../shared/typed';
import { LeekFundConfig } from './model';
import { LeekFundService } from './service';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: LeekFundService;
  private order: SortType;

  constructor(service: LeekFundService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.fundSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const fundCodes = LeekFundConfig.getConfig('leek-fund.funds') || [];
    return this.service.getFundData(fundCodes, this.order);
  }

  getParent(element: LeekTreeItem): LeekTreeItem | null {
    return null;
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    return element;
  }

  changeOrder(): void {
    let order = this.order as number;
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
}
