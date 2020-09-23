import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import globalState from '../globalState';
import { LeekTreeItem } from '../leekTreeItem';
import { defaultFundInfo, SortType, StockCategory } from '../shared';
import { LeekFundModel } from './model';
import { LeekFundService } from './service';

export class StockProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: LeekFundService;
  private order: SortType;
  private model: LeekFundModel;

  constructor(service: LeekFundService) {
    this.service = service;
    this.model = new LeekFundModel();
    this.order = this.model.getConfig('leek-fund.stockSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: LeekTreeItem | undefined): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    if (!element) {
      // Root view
      return this.getRootNodes();
    } else {
      const stockCodes = this.model.getConfig('leek-fund.stocks') || [];
      const resultPromise = this.service.getStockData(stockCodes, this.order);
      // console.log(element.id);
      switch (
        element.id // First-level
      ) {
        case StockCategory.A:
          return this.getAStockNodes(resultPromise);
        case StockCategory.HK:
          return this.getHkStockNodes(resultPromise);
        case StockCategory.US:
          return this.getUsStockNodes(resultPromise);
        default:
          return [];
        // return this.getChildrenNodesById(element.id);
      }
    }
  }

  getParent(element: LeekTreeItem): LeekTreeItem | undefined {
    return undefined;
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    if (!element.isCategory) {
      return element;
    } else {
      return {
        id: element.id,
        label: element.info.name,
        // tooltip: this.getSubCategoryTooltip(element),
        collapsibleState:
          element.id === StockCategory.A
            ? TreeItemCollapsibleState.Expanded
            : TreeItemCollapsibleState.Collapsed,
        // iconPath: this.parseIconPathFromProblemState(element),
        command: undefined,
        contextValue: element.contextValue,
      };
    }
  }

  getRootNodes(): LeekTreeItem[] {
    return [
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.A,
          name: `${StockCategory.A}${
            globalState.aStockCount > 0 ? `(${globalState.aStockCount})` : ''
          }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.HK,
          name: `${StockCategory.HK}${
            globalState.hkStockCount > 0 ? `(${globalState.hkStockCount})` : 0
          }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.US,
          name: `${StockCategory.US}${
            globalState.usStockCount > 0 ? `(${globalState.usStockCount})` : 0
          }`,
        }),
        undefined,
        true
      ),
      /*     new LeekTreeItem(
        Object.assign({}, defaultFundInfo, {
          id: StockCategory.Other,
          name: `${StockCategory.Other}(${globalState.otherStockCount})`,
        }),
        undefined,
        true
      ), */
    ];
  }
  getAStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    const aStocks: Promise<LeekTreeItem[]> = stocks.then((res: LeekTreeItem[]) => {
      const arr = res.filter((item: LeekTreeItem) => /^(sh|sz)/.test(item.type || ''));
      return arr;
    });

    return aStocks;
  }
  getHkStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    return stocks.then((res: LeekTreeItem[]) =>
      res.filter((item: LeekTreeItem) => /^(hk)/.test(item.type || ''))
    );
  }
  getUsStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    return stocks.then((res: LeekTreeItem[]) =>
      res.filter((item: LeekTreeItem) => /^(usr_)/.test(item.type || ''))
    );
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
    this.model.setConfig('leek-fund.stockSort', this.order);
    this.refresh();
  }
}
