import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import { NewsService, NewsTreeItem } from './newsService';

export class NewsProvider implements TreeDataProvider<NewsTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: NewsService;

  constructor() {
    this.service = new NewsService();
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): NewsTreeItem[] | Thenable<NewsTreeItem[]> {
    const userIds = LeekFundConfig.getConfig('leek-fund.newsUserIds') || [];
    return this.service.getNewsUserList(userIds);
  }

  getParent(): NewsTreeItem | null {
    return null;
  }

  getTreeItem(element: NewsTreeItem): TreeItem {
    return element;
  }
}
