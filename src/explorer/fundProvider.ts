import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { defaultFundInfo, SortType } from '../shared/typed';
import FundService from './fundService';

export class FundProvider implements TreeDataProvider<LeekTreeItem> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

  private service: FundService;
  private order: SortType;

  constructor(service: FundService) {
    this.service = service;
    this.order = LeekFundConfig.getConfig('leek-fund.fundSort') || SortType.NORMAL;
  }

  refresh(): any {
    this._onDidChangeTreeData.fire(undefined);
  }

  getChildren(element?: LeekTreeItem | undefined): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const fundGroups = LeekFundConfig.getConfig('leek-fund.fundGroups') || [];
    const fundLists = LeekFundConfig.getConfig('leek-fund.funds') || [];
    if (!element) {
      return this.getRootNodes(fundGroups, fundLists);
    } else {
      return this.getChildrenNodes(element, fundLists);
    }
  }

  getRootNodes(fundGroups: Array<string>, fundLists: Array<Object>): Array<LeekTreeItem> {
    if (fundGroups.length < fundLists.length) {
      return [];
    }

    let nodes: Array<LeekTreeItem> = [];
    fundLists.forEach((value, index) => {
      if (value instanceof Array) {
        const funds = value as Array<string>;
        nodes.push(
          new LeekTreeItem(
            Object.assign({ contextValue: 'category' }, defaultFundInfo, {
              id: `fundGroup_${index}`,
              name: `${fundGroups[index]}${funds.length > 0 ? `(${funds.length})` : ''}`,
            }),
            undefined,
            true
          )
        );
      }
    });
    return nodes;
  }

  getChildrenNodes(element: LeekTreeItem, fundLists: Array<Object>): Promise<Array<LeekTreeItem>> {
    let groupId: string = '';
    let fundCodes: Array<string> = [];
    fundLists.forEach((value, index) => {
      if (value instanceof Array) {
        const funds = value as Array<string>;
        const id: string = `fundGroup_${index}`;
        if (element.id === id) {
          groupId = id;
          fundCodes = funds;
          return;
        }
      }
    });
    return this.service.getData(fundCodes, this.order, groupId);
  }

  getParent(): LeekTreeItem | null {
    return null;
  }

  getTreeItem(element: LeekTreeItem): TreeItem {
    if (!element.isCategory) {
      return element;
    } else {
      return {
        id: element.id,
        label: element.info.name,
        // tooltip: this.getSubCategoryTooltip(element),
        collapsibleState: TreeItemCollapsibleState.Expanded,
        // iconPath: this.parseIconPathFromProblemState(element),
        command: undefined,
        contextValue: element.contextValue,
      };
    }
  }

  changeOrder(): void {
    let order = this.order as number;

    /* fix: 如果基金排序先前是按照持仓金额升序/降序, 按涨跌排序失效的问题 */
    if (Math.abs(order) > 1) {
      this.order = SortType.NORMAL;
    }

    order += 1;
    if (order > 1) {
      this.order = SortType.DESC;
    } else if (order === 1) {
      this.order = SortType.ASC;
    } else if (order === 0) {
      this.order = SortType.NORMAL;
    }
    LeekFundConfig.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }

  changeAmountOrder(): void {
    let order = this.order as number;

    if (order === SortType.AMOUNTDESC) {
      this.order = SortType.AMOUNTASC;
    } else if (order === SortType.AMOUNTASC) {
      this.order = SortType.AMOUNTDESC;
    } else {
      this.order = SortType.AMOUNTDESC;
    }
    LeekFundConfig.setConfig('leek-fund.fundSort', this.order);
    this.refresh();
  }
}
