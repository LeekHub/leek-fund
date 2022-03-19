/*
 * @Author: John Trump
 * @Date: 2020-12-04 13:37:18
 * @LastEditors: John Trump
 * @LastEditTime: 2020-12-06 20:14:01
 */

import { Event, EventEmitter, TreeDataProvider, TreeItem } from 'vscode';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import BinanceService from './binanceService';

export class BinanceProvider implements TreeDataProvider<any> {
  private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();
  private service: BinanceService;
  readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;
  // TODO: 未完成排序功能
  // private order: SortType;

  constructor(service: BinanceService) {
    this.service = service;
    // this.order = LeekFundConfig.getConfig('leek-fund.binanceSort') || SortType.NORMAL;
  }

  getTreeItem(element: any): TreeItem | Thenable<TreeItem> {
    return element;
  }

  getChildren(): LeekTreeItem[] | Thenable<LeekTreeItem[]> {
    const paris = LeekFundConfig.getConfig('leek-fund.binance') || [];
    return this.service.getData(paris);
  }

  getParent?() {
    return null;
  }

  /* Implement */
  /** Notify data change then refresh */
  refresh(): any {
    // this.service.getParis();
    this._onDidChangeTreeData.fire(undefined);
  }

  /** Modify order */
  changeOrder(): void {
    // leek-fund.binanceSort
    throw new Error('Method not implemented.');
  }
}
