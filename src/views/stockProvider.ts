import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekTreeItem, SortType } from '../leekTreeItem';
import { LeekFundService } from '../service';
import { FundModel } from './model';

export class StockProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: LeekFundService;
  private order: SortType;
  private model: FundModel;

  constructor(service: LeekFundService) {
    this.service = service;
    this.order = SortType.NORMAL;
    this.model = new FundModel();
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const stockCodes = this.model.getCfg('leek-fund.stocks') || [];
    const children = this.service.getStockData(stockCodes, this.order);
    return children;
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
    this.refresh();
  }
}
