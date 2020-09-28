import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekTreeItem } from '../leekTreeItem';
import { LeekFundService } from './service';
import { SortType } from '../shared';
import { LeekFundModel } from './model';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: LeekFundService;
  private order: SortType;
  private model: LeekFundModel;

  constructor(service: LeekFundService) {
    this.service = service;
    this.model = new LeekFundModel();
    this.order = this.model.getConfig('leek-fund.fundSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const fundCodes = this.model.getConfig('leek-fund.funds') || [];
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
    this.model.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }
}
