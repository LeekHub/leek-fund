/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import * as vscode from 'vscode';
import { FundProvider } from './views/fundProvider';
import { StockProvider } from './views/stockProvider';
// import { FundView } from './views/fundView';

import { registerViewEvent } from './registerEvent';
import { FundService } from './service';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "leek-fund" is now active!');

  let interval = vscode.workspace
    .getConfiguration()
    .get('leek-fund.interval', 10000);

  if (interval < 3000) {
    interval = 3000;
  }

  const fundService = new FundService(context);
  const nodeFundProvider = new FundProvider(fundService);
  nodeFundProvider.refresh();
  const nodeStockProvider = new StockProvider(fundService);
  nodeStockProvider.refresh();
  setInterval(() => {
    console.log('setInterval');
    nodeFundProvider.refresh();
    nodeStockProvider.refresh();
  }, interval);

  vscode.window.registerTreeDataProvider('views.fund', nodeFundProvider);
  vscode.window.registerTreeDataProvider('views.stock', nodeStockProvider);

  // register event
  registerViewEvent(context, fundService);
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('deactivate');
}
