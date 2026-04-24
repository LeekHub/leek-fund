import {
  DataTransfer,
  DataTransferItem,
  Event,
  EventEmitter,
  TreeDataProvider,
  TreeDragAndDropController,
  TreeItem,
  TreeItemCollapsibleState,
  window,
} from 'vscode';
import globalState from '../globalState';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { defaultFundInfo, IconType, SortType } from '../shared/typed';
import { LeekFundConfig } from '../shared/leekConfig';
import StockService from './stockService';

export class StockProvider implements TreeDataProvider<LeekTreeItem>, TreeDragAndDropController<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: StockService;
  private order: SortType;

  dropMimeTypes = ['application/vnd.code.tree.leekFundView.stock'];
  dragMimeTypes = ['application/vnd.code.tree.leekFundView.stock'];

  constructor(service: StockService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.stockSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: LeekTreeItem | undefined): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    if (!element) {
      // Root view
      return this.getRootNodes(globalState.stockGroups, globalState.stockLists);
    } else {
      return this.getChildrenNodes(element, globalState.stockLists);
    }
  }

  getRootNodes(stockGroups: Array<string>, stockLists: Array<Array<string>>): Array<LeekTreeItem> {
    const nodes: Array<LeekTreeItem> = [];
    stockGroups.forEach((value, index) => {
      const groupId = `stockGroup_${index}`;
      const averagePercent = this.service.getGroupAverage(groupId);
      let name = `${value}${stockLists[index].length > 0 ? `(${stockLists[index].length})` : ''}`;
      if (averagePercent !== undefined) {
        let icon = '';
        if (globalState.iconType !== IconType.NONE) {
          icon = averagePercent >= 0 ? '📈' : '📉';
        }
        name += ` ${icon}${averagePercent.toFixed(2)}%`;
      }
      nodes.push(
        new LeekTreeItem(
          Object.assign({ contextValue: 'category' }, defaultFundInfo, {
            id: groupId,
            name,
          }),
          undefined,
          true
        )
      );
    });
    return nodes;
  }

  getChildrenNodes(element: LeekTreeItem, stockLists: Array<Array<string>>): Promise<Array<LeekTreeItem>> {
    const groupId = element.id || '';
    const index: number = parseInt(groupId.replace('stockGroup_', ''));
    const stockCodes: Array<string> = stockLists[index];
    if (stockCodes && stockCodes.length > 0) {
      return this.service.getData(stockCodes, this.order, groupId);
    }
    return Promise.resolve([]);
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
        collapsibleState: TreeItemCollapsibleState.Expanded,
        command: undefined,
        contextValue: element.contextValue,
      };
    }
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

  // Drag and Drop implementation
  public async handleDrag(
    source: LeekTreeItem[],
    treeDataTransfer: DataTransfer,
    token: any
  ): Promise<void> {
    treeDataTransfer.set(
      'application/vnd.code.tree.leekFundView.stock',
      new DataTransferItem(source)
    );
  }

  public async handleDrop(
    target: LeekTreeItem | undefined,
    sources: DataTransfer,
    token: any
  ): Promise<void> {
    const transferItem = sources.get('application/vnd.code.tree.leekFundView.stock');
    if (!transferItem) {
      return;
    }

    const sourceItems: LeekTreeItem[] = transferItem.value;
    const stockLists = globalState.stockLists;
    const affectedGroups = new Set<number>();

    for (const source of sourceItems) {
      if (source.isCategory || !source.id) {
        continue;
      }

      const sourceId = source.id; // format: stockGroup_0_sh000001
      const sourceParts = sourceId.split('_');
      if (sourceParts.length < 3) continue;
      const sourceGroupIndex = parseInt(sourceParts[1]);
      const stockCode = sourceParts[2];

      let targetGroupIndex = -1;
      let targetStockIndex = -1;

      if (target) {
        if (target.isCategory) {
          // Move to group
          targetGroupIndex = parseInt(target.id!.replace('stockGroup_', ''));
          targetStockIndex = stockLists[targetGroupIndex].length;
        } else {
          // Move to after or before stock
          const targetParts = target.id!.split('_');
          if (targetParts.length >= 3) {
            targetGroupIndex = parseInt(targetParts[1]);
            targetStockIndex = stockLists[targetGroupIndex].indexOf(targetParts[2]);
          }
        }
      } else {
        // Drop on root or empty space - move to first group
        targetGroupIndex = 0;
        targetStockIndex = stockLists[targetGroupIndex]?.length || 0;
      }

      if (targetGroupIndex !== -1 && !isNaN(sourceGroupIndex)) {
        affectedGroups.add(sourceGroupIndex);
        affectedGroups.add(targetGroupIndex);
        // Remove from source
        if (stockLists[sourceGroupIndex]) {
          stockLists[sourceGroupIndex] = stockLists[sourceGroupIndex].filter(
            (code) => code !== stockCode
          );
        }

        // Add to target
        if (targetStockIndex === -1) {
          targetStockIndex = stockLists[targetGroupIndex].length;
        }
        stockLists[targetGroupIndex].splice(targetStockIndex, 0, stockCode);
      }
    }

    globalState.stockLists = stockLists;
    await LeekFundConfig.setConfig('leek-fund.stocks', stockLists);

    // Refresh data for affected groups to update averages
    await Promise.all(
      Array.from(affectedGroups).map((index) => {
        const groupId = `stockGroup_${index}`;
        return this.service.getData(stockLists[index], this.order, groupId);
      })
    );

    this.refresh();
  }
}
