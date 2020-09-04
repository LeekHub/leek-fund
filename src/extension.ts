/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the BSD-3-Clause License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { ConfigurationChangeEvent, ExtensionContext, TreeView, window, workspace } from 'vscode';
import global from './global';
import { SortType } from './leekTreeItem';
import { registerViewEvent } from './registerEvent';
import { LeekFundService } from './service';
import { isStockTime } from './utils';
import { FundProvider } from './views/fundProvider';
import { LeekFundModel } from './views/model';
import { NewsProvider } from './views/newsProvider';
import { StatusBar } from './views/statusBar';
import { StockProvider } from './views/stockProvider';

let intervalTimer: NodeJS.Timer | null = null;
let fundTreeView: TreeView<any> | null = null;
let stockTreeView: TreeView<any> | null = null;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('🐥Congratulations, your extension "leek-fund" is now active!');

  let intervalTime = 3000;
  const model = new LeekFundModel();

  const iconType = model.getCfg('leek-fund.iconType') || 'arrow';
  global.iconType = iconType;

  const fundService = new LeekFundService(context, model);
  const nodeFundProvider = new FundProvider(fundService);
  const nodeStockProvider = new StockProvider(fundService);
  const newsProvider = new NewsProvider();
  const statusBar = new StatusBar(fundService);

  // prefetch all fund data for searching
  // fundService.getFundSuggestList();

  // create fund & stock side views
  fundTreeView = window.createTreeView('leekFundView.fund', {
    treeDataProvider: nodeFundProvider,
  });
  stockTreeView = window.createTreeView('leekFundView.stock', {
    treeDataProvider: nodeStockProvider,
  });
  stockTreeView = window.createTreeView('leekFundView.news', {
    treeDataProvider: newsProvider,
  });

  // fix when TreeView collapse https://github.com/giscafer/leek-fund/issues/31
  const manualRequest = () => {
    fundService.getFundData(model.getCfg('leek-fund.funds'), SortType.NORMAL).then(() => {
      statusBar.refresh();
    });
    fundService.getStockData(model.getCfg('leek-fund.stocks'), SortType.NORMAL).then(() => {
      statusBar.refresh();
    });
  };

  manualRequest();

  // loop
  const loopCallback = () => {
    if (isStockTime()) {
      if (stockTreeView?.visible || fundTreeView?.visible) {
        nodeStockProvider.refresh();
        nodeFundProvider.refresh();
        statusBar.refresh();
      } else {
        manualRequest();
      }
    } else {
      console.log('StockMarket Closed! Polling closed!');
    }
  };

  const setIntervalTime = () => {
    intervalTime = workspace.getConfiguration().get('leek-fund.interval', 10000);

    if (intervalTime < 3000) {
      intervalTime = 3000;
    }
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
    intervalTimer = setInterval(loopCallback, intervalTime);
  };

  setIntervalTime();

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('🐥>>>Configuration changed');
    setIntervalTime();
    nodeFundProvider.refresh();
    nodeStockProvider.refresh();
    newsProvider.refresh();
    statusBar.refresh();
  });

  // register event
  registerViewEvent(context, fundService, nodeFundProvider, nodeStockProvider, newsProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🐥deactivate');
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}
