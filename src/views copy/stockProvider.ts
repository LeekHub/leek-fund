import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { FundService, LeekTreeItem } from '../service';
import { FundModel } from './model';

export class StockProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: FundService;
  private order: number;
  private model: FundModel;

  constructor(service: FundService) {
    this.service = service;
    this.order = 1;
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
    if (this.order === 1) {
      this.order = 0;
    } else {
      this.order = 1;
    }
    this.refresh();
  }
}
