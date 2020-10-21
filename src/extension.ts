/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the BSD-3-Clause License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { ConfigurationChangeEvent, ExtensionContext, TreeView, window, workspace } from 'vscode';
import { FundProvider } from './explorer/fundProvider';
import FundService from './explorer/fundService';
import { NewsProvider } from './explorer/newsProvider';
import { StockProvider } from './explorer/stockProvider';
import StockService from './explorer/stockService';
import globalState from './globalState';
import { registerViewEvent } from './registerCommand';
import { HolidayHelper } from './shared/holidayHelper';
import { LeekFundConfig } from './shared/leekConfig';
import { SortType } from './shared/typed';
import { isStockTime } from './shared/utils';
import { StatusBar } from './statusbar/statusBar';
import { updateAmount } from './webview/setAmount';

let loopTimer: NodeJS.Timer | null = null;
let fundTreeView: TreeView<any> | null = null;
let stockTreeView: TreeView<any> | null = null;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('🐥Congratulations, your extension "leek-fund" is now active!');

  let intervalTimeConfig = LeekFundConfig.getConfig('leek-fund.interval', 5000);
  let intervalTime = intervalTimeConfig;

  // 节假日，异步会存在延迟判断准确问题，设置成同步影响插件激活速度，暂使用异步
  HolidayHelper.isHolidayInChina().then((isHoliday) => {
    globalState.isHolidayChina = isHoliday;
  });

  setGlobalVariable();
  updateAmount();

  const fundService = new FundService(context);
  const stockService = new StockService(context);
  const nodeFundProvider = new FundProvider(fundService);
  const nodeStockProvider = new StockProvider(stockService);
  const newsProvider = new NewsProvider();
  const statusBar = new StatusBar(stockService, fundService);

  // create fund & stock side views
  fundTreeView = window.createTreeView('leekFundView.fund', {
    treeDataProvider: nodeFundProvider,
  });
  stockTreeView = window.createTreeView('leekFundView.stock', {
    treeDataProvider: nodeStockProvider,
  });
  window.createTreeView('leekFundView.news', {
    treeDataProvider: newsProvider,
  });

  // fix when TreeView collapse https://github.com/giscafer/leek-fund/issues/31
  const manualRequest = () => {
    fundService.getData(LeekFundConfig.getConfig('leek-fund.funds'), SortType.NORMAL).then(() => {
      statusBar.refresh();
    });
    stockService.getData(LeekFundConfig.getConfig('leek-fund.stocks'), SortType.NORMAL).then(() => {
      statusBar.refresh();
    });
  };

  manualRequest();

  // loop
  const loopCallback = () => {
    if (isStockTime()) {
      if (intervalTime !== intervalTimeConfig) {
        intervalTime = intervalTimeConfig;
        setIntervalTime();
        return;
      }
      if (stockTreeView?.visible || fundTreeView?.visible) {
        nodeStockProvider.refresh();
        nodeFundProvider.refresh();
        statusBar.refresh();
      } else {
        manualRequest();
      }
    } else {
      console.log('StockMarket Closed! Polling closed!');
      if (intervalTime === intervalTimeConfig) {
        intervalTime = intervalTimeConfig * 100;
        setIntervalTime();
      }
    }
  };

  const setIntervalTime = () => {
    // prevent qps
    if (intervalTime < 3000) {
      intervalTime = 3000;
    }
    if (loopTimer) {
      clearInterval(loopTimer);
      loopTimer = null;
    }
    loopTimer = setInterval(loopCallback, intervalTime);
  };

  setIntervalTime();

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('🐥>>>Configuration changed');
    intervalTimeConfig = LeekFundConfig.getConfig('leek-fund.interval');
    setIntervalTime();
    setGlobalVariable();
    nodeFundProvider.refresh();
    nodeStockProvider.refresh();
    newsProvider.refresh();
    statusBar.refresh();
  });

  // register event
  registerViewEvent(
    context,
    fundService,
    stockService,
    nodeFundProvider,
    nodeStockProvider,
    newsProvider
  );
}

function setGlobalVariable() {
  const iconType = LeekFundConfig.getConfig('leek-fund.iconType') || 'arrow';
  globalState.iconType = iconType;
  const fundAmount = LeekFundConfig.getConfig('leek-fund.fundAmount') || {};
  globalState.fundAmount = fundAmount;
  const showEarnings = LeekFundConfig.getConfig('leek-fund.showEarnings');
  globalState.showEarnings = showEarnings;
}

// this method is called when your extension is deactivated
export function deactivate() {
  console.log('🐥deactivate');
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}
