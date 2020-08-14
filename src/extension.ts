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
} from 'vscode';
import { registerViewEvent } from './registerEvent';
import { FundService } from './service';
import { isStockTime } from './utils';
import { FundProvider } from './views/fundProvider';
import { FundModel } from './views/model';
import { StatusBar } from './views/statusBar';
import { StockProvider } from './views/stockProvider';

let intervalTimer: NodeJS.Timer | null = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "leek-fund" is now active!');

  let interval = workspace.getConfiguration().get('leek-fund.interval', 10000);

  if (interval < 3000) {
    interval = 3000;
  }
  // fund
  const fundService = new FundService(context);
  const nodeFundProvider = new FundProvider(fundService);
  nodeFundProvider.refresh();
  // stock
  const nodeStockProvider = new StockProvider(fundService);
  nodeStockProvider.refresh();

  const model = new FundModel();
  // status bar
  const statusBar = new StatusBar(fundService);

  // 获取所有基金代码
  fundService.getFundSuggestList();

  // 第一次主动获取一次数据，因为面板需要点击才触发查询（闭市的时候）
  fundService.getFundData(model.getCfg('leek-fund.funds'), 0).then(() => {
    statusBar.refresh();
  });
  fundService.getStockData(model.getCfg('leek-fund.stocks'), 0).then(() => {
    statusBar.refresh();
  });

  // interval
  intervalTimer = setInterval(() => {
    if (isStockTime() || fundService.szItem === undefined) {
      nodeFundProvider.refresh();
      nodeStockProvider.refresh();
      statusBar.refresh();
    } else {
      console.log('StockMarket Closed! Polling closed!');
    }
  }, interval);

  // views
  window.registerTreeDataProvider('views.fund', nodeFundProvider);
  window.registerTreeDataProvider('views.stock', nodeStockProvider);

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('配置改变刷新数据');
    nodeFundProvider.refresh();
    nodeStockProvider.refresh();
    statusBar.refresh();
  });

  // register event
  registerViewEvent(context, fundService, nodeFundProvider, nodeStockProvider);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('deactivate');
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}
