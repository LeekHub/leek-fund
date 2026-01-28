import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
// import { compact, flattenDeep, uniq } from 'lodash';
import { groupBy } from 'lodash';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { defaultFundInfo, SortType, StockCategory } from '../shared/typed';
import { LeekFundConfig } from '../shared/leekConfig';
import StockService from './stockService';

export class StockProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: StockService;
  private order: SortType;
  private expandAStock: boolean;
  private expandHKStock: boolean;
  private expandUSStock: boolean;
  private expandCNFuture: boolean;
  private expandOverseaFuture: boolean;

  constructor(service: StockService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.stockSort') || SortType.NORMAL;
    this.expandAStock = LeekFundConfig.getConfig('leek-fund.expandAStock', true);
    this.expandHKStock = LeekFundConfig.getConfig('leek-fund.expandHKStock', false);
    this.expandUSStock = LeekFundConfig.getConfig('leek-fund.expandUSStock', false);
    this.expandCNFuture = LeekFundConfig.getConfig('leek-fund.expandCNFuture', false);
    this.expandOverseaFuture = LeekFundConfig.getConfig('leek-fund.expandOverseaFuture', false);
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: LeekTreeItem | undefined): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    if (!element) {
      // Root view
      const stockCodes = LeekFundConfig.getConfig('leek-fund.stocks') || [];
      // const stockList: string[] = uniq(compact(flattenDeep(stockCodes)));
      return this.service.getData(stockCodes, this.order).then(() => {
        return this.getRootNodes();
      });
    } else {
      const resultPromise = Promise.resolve(this.service.stockList || []);

      if (element.contextValue === 'industry') {
        return this.getIndustryStockNodes(resultPromise, element.id || '');
      }

      switch (
      element.id // First-level
      ) {
        case StockCategory.A:
          if (LeekFundConfig.getConfig('leek-fund.groupStockByIndustry')) {
            return this.getAStockNodesGrouped(resultPromise);
          }
          return this.getAStockNodes(resultPromise);
        case StockCategory.HK:
          return this.getHkStockNodes(resultPromise);
        case StockCategory.US:
          return this.getUsStockNodes(resultPromise);
        case StockCategory.Future:
          return this.getFutureStockNodes(resultPromise);
        case StockCategory.OverseaFuture:
          return this.getOverseaFutureStockNodes(resultPromise);
        case StockCategory.NODATA:
          return this.getNoDataStockNodes(resultPromise);
        default:
          return [];
        // return this.getChildrenNodesById(element.id);
      }
    }
  }

  getParent(): LeekTreeItem | undefined {
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
          (element.id === StockCategory.A && this.expandAStock) ||
            (element.id === StockCategory.HK && this.expandHKStock) ||
            (element.id === StockCategory.US && this.expandUSStock) ||
            (element.id === StockCategory.Future && this.expandCNFuture) ||
            (element.id === StockCategory.OverseaFuture && this.expandCNFuture)
            ? TreeItemCollapsibleState.Expanded
            : TreeItemCollapsibleState.Collapsed,
        iconPath: element.iconPath,
        command: undefined,
        contextValue: element.contextValue,
      };
    }
  }

  getRootNodes(): LeekTreeItem[] {
    const nodes = [
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.A,
          name: `${StockCategory.A}${globalState.aStockCount > 0 ? `(${globalState.aStockCount})` : ''
            }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.HK,
          name: `${StockCategory.HK}${globalState.hkStockCount > 0 ? `(${globalState.hkStockCount})` : ''
            }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.US,
          name: `${StockCategory.US}${globalState.usStockCount > 0 ? `(${globalState.usStockCount})` : ''
            }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.Future,
          name: `${StockCategory.Future}${globalState.cnfStockCount > 0 ? `(${globalState.cnfStockCount})` : ''
            }`,
        }),
        undefined,
        true
      ),
      new LeekTreeItem(
        Object.assign({ contextValue: 'category' }, defaultFundInfo, {
          id: StockCategory.OverseaFuture,
          name: `${StockCategory.OverseaFuture}${globalState.hfStockCount > 0 ? `(${globalState.hfStockCount})` : ''
            }`,
        }),
        undefined,
        true
      ),
    ];
    // 显示接口不支持的股票，避免用户老问为什么添加了股票没反应
    if (globalState.noDataStockCount) {
      nodes.push(
        new LeekTreeItem(
          Object.assign({ contextValue: 'category' }, defaultFundInfo, {
            id: StockCategory.NODATA,
            name: `${StockCategory.NODATA}(${globalState.noDataStockCount})`,
          }),
          undefined,
          true
        )
      );
    }
    return nodes;
  }
  getAStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    const aStocks: Promise<LeekTreeItem[]> = stocks.then((res: LeekTreeItem[]) => {
      const arr = res.filter((item: LeekTreeItem) => /^(sh|sz|bj)/.test(item.type || ''));
      return arr;
    });

    return aStocks;
  }
  async getAStockNodesGrouped(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    const stockList = await stocks;
    const aStocks = stockList.filter((item: LeekTreeItem) => /^(sh|sz|bj)/.test(item.type || ''));
    const grouped = groupBy(aStocks, (item) => item.info.industry || '其他');
    const groupKeys = Object.keys(grouped);
    const groups = groupKeys.map((key) => {
      const items = grouped[key];
      let totalPercent = 0;
      let count = 0;
      items.forEach((item) => {
        const percent = parseFloat(item.info.percent);
        if (!isNaN(percent)) {
          totalPercent += percent;
          count++;
        }
      });
      const avgPercent = count > 0 ? totalPercent / count : 0;
      return { key, items, avgPercent, count: items.length };
    });

    if (this.order === SortType.ASC) {
      groups.sort((a, b) => a.avgPercent - b.avgPercent);
    } else if (this.order === SortType.DESC) {
      groups.sort((a, b) => b.avgPercent - a.avgPercent);
    }

    const nodes = groups.map((group) => {
      const percentStr = group.avgPercent.toFixed(2);
      return new LeekTreeItem(
        Object.assign({ contextValue: 'industry' }, defaultFundInfo, {
          id: group.key,
          name: `${group.key} ${group.avgPercent >= 0 ? '+' : ''}${percentStr}%`,
          percent: percentStr,
        }),
        globalState.context,
        true
      );
    });
    return nodes;
  }

  async getIndustryStockNodes(
    stocks: Promise<LeekTreeItem[]>,
    industry: string
  ): Promise<LeekTreeItem[]> {
    const stockList = await stocks;
    const nodes = stockList.filter(
      (item: LeekTreeItem) => (item.info.industry || '其他') === industry
    );
    return nodes;
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
  getFutureStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    return stocks.then((res: LeekTreeItem[]) =>
      res.filter((item: LeekTreeItem) => /^(nf_)/.test(item.type || ''))
    );
  }
  getOverseaFutureStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    return stocks.then((res: LeekTreeItem[]) =>
      res.filter((item: LeekTreeItem) => /^(hf_)/.test(item.type || ''))
    );
  }
  getNoDataStockNodes(stocks: Promise<LeekTreeItem[]>): Promise<LeekTreeItem[]> {
    return stocks.then((res: LeekTreeItem[]) => {
      return res.filter((item: LeekTreeItem) => {
        return /^(nodata)/.test(item.type || '');
      });
    });
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
    LeekFundConfig.setConfig('leek-fund.stockSort', this.order);
    this.refresh();
  }
}
