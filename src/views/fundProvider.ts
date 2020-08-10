import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { FundService, LeekTreeItem } from '../service';
import { FundModel } from './model';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: FundService;
  private order: number;
  private model: FundModel;

  constructor(service: FundService) {
    this.service = service;
    this.order = 0;
    this.model = new FundModel();
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const fundCodes = this.model.getCfg('leek-fund.funds') || [];
    return this.service.getFundData(fundCodes, this.order);
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
