/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the BSD-3-Clause License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { ConfigurationChangeEvent, ExtensionContext, TreeView, window, workspace } from 'vscode';
import { FundProvider } from './explorer/fundProvider';
import { LeekFundConfig } from './explorer/model';
import { NewsProvider } from './explorer/newsProvider';
import { LeekFundService } from './explorer/service';
import { StockProvider } from './explorer/stockProvider';
import globalState from './globalState';
import { registerViewEvent } from './registerCommand';
import { HolidayHelper } from './shared/holidayHelper';
import { SortType } from './shared/typed';
import { StatusBar } from './statusbar/statusBar';
import { isStockTime } from './shared/utils';
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

  const fundService = new LeekFundService(context);
  const nodeFundProvider = new FundProvider(fundService);
  const nodeStockProvider = new StockProvider(fundService);
  const newsProvider = new NewsProvider();
  const statusBar = new StatusBar(fundService);

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
    fundService
      .getFundData(LeekFundConfig.getConfig('leek-fund.funds'), SortType.NORMAL)
      .then(() => {
        statusBar.refresh();
      });
    fundService
      .getStockData(LeekFundConfig.getConfig('leek-fund.stocks'), SortType.NORMAL)
      .then(() => {
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
  registerViewEvent(context, fundService, nodeFundProvider, nodeStockProvider, newsProvider);
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
