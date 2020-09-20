import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { NewsService, NewsTreeItem } from './newsService';
import { LeekFundModel } from './model';

export class NewsProvider implements TreeDataProvider<NewsTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: NewsService;
  private model: LeekFundModel;

  constructor() {
    this.service = new NewsService();
    this.model = new LeekFundModel();
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(): NewsTreeItem[] | Thenable<NewsTreeItem[]> {
    const userIds = this.model.getConfig('leek-fund.newsUserIds') || [];
    return this.service.getNewsUserList(userIds);
  }

  getParent(element: NewsTreeItem): NewsTreeItem | null {
    return null;
  }

  getTreeItem(element: NewsTreeItem): TreeItem {
    return element;
  }
}
