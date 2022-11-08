import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { ForexService } from './forexService';

export class ForexProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: ForexService;

  constructor(service: ForexService) {
    this.service = service;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    return this.service.getData();
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    return element;
  }
}
