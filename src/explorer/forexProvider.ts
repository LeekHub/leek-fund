import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import ForexService, { ForexTreeItem } from './forexService';

export default class ForexProvider implements TreeDataProvider<ForexTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: ForexService;

  constructor(service: ForexService) {
    this.service = service;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: ForexTreeItem): ForexTreeItem[] | Thenable<ForexTreeItem[]> {
    if (!element) {
      return this.service.getData();
    } else {
      return [];
    }
  }

  getTreeItem(element: ForexTreeItem): TreeItem {
    return element;
  }
}
