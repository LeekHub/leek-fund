/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import {
  ConfigurationChangeEvent,
  ExtensionContext,
  window,
  workspace,
  TreeView,
} from 'vscode';
import { registerViewEvent } from './registerEvent';
import { FundService } from './service';
import { isStockTime } from './utils';
import { FundProvider } from './views/fundProvider';
import { FundModel } from './views/model';
import { StatusBar } from './views/statusBar';
import { StockProvider } from './views/stockProvider';
import { SortType } from './leekTreeItem';

let intervalTimer: NodeJS.Timer | null = null;
let fundTreeView: TreeView<any> | null = null;
let stockTreeView: TreeView<any> | null = null;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('🐥Congratulations, your extension "leek-fund" is now active!');

  const model = new FundModel();
  const fundService = new FundService(context);
  const nodeFundProvider = new FundProvider(fundService);
  const nodeStockProvider = new StockProvider(fundService);

  // status bar
  const statusBar = new StatusBar(fundService);

  // 获取所有基金代码
  fundService.getFundSuggestList();

  // create fund & stock side views
  fundTreeView = window.createTreeView('views.fund', {
    treeDataProvider: nodeFundProvider,
  });
  stockTreeView = window.createTreeView('views.stock', {
    treeDataProvider: nodeStockProvider,
  });

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('>>>Configuration changed');
    nodeFundProvider.refresh();
    nodeStockProvider.refresh();
    statusBar.refresh();
  });

  // fix when TreeView collapse https://github.com/giscafer/leek-fund/issues/31
  const manualRequest = () => {
    fundService
      .getFundData(model.getCfg('leek-fund.funds'), SortType.NORMAL)
      .then(() => {
        statusBar.refresh();
      });
    fundService
      .getStockData(model.getCfg('leek-fund.stocks'), SortType.NORMAL)
      .then(() => {
        statusBar.refresh();
      });
  };

  manualRequest();

  // loop
  let intervalTime = workspace
    .getConfiguration()
    .get('leek-fund.interval', 10000);

  if (intervalTime < 3000) {
    intervalTime = 3000;
  }

  intervalTimer = setInterval(() => {
    if (isStockTime() || fundService.szItem === undefined) {
      if (fundTreeView?.visible) {
        nodeFundProvider.refresh();
        nodeStockProvider.refresh();
        statusBar.refresh();
      } else {
        manualRequest();
      }
    } else {
      console.log('StockMarket Closed! Polling closed!');
    }
  }, intervalTime);

  // register event
  registerViewEvent(context, fundService, nodeFundProvider, nodeStockProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🐥deactivate');
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}

