import { commands, ViewColumn, Webview, window } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import globalState from '../globalState';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { getTemplateFileContent } from '../shared/utils';
import { events } from '../shared/utils';
import { LeekFundConfig } from '../shared/leekConfig';

let _INITED = false;

function setStocksRemind(stockList: Array<LeekTreeItem>) {

  const panel = ReusedWebviewPanel.create('setAmountWebview', `个股设置`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });

  if (_INITED) return;
  _INITED = true;

  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case 'save':
        console.log(JSON.parse(message.data));
        setStocksRemindCfgCb(JSON.parse(message.data));
        return;
      case 'alert':
        window.showErrorMessage(message.message);
        return;
      case 'fail':
        window.showErrorMessage('保存失败！');
        return;
    }
  }, undefined);

  panel.webview.html = getTemplateFileContent('stock-remind.html');

  panel.webview.postMessage({
    command: 'updateStockRemind',
    data: globalState.stocksRemind,
  });
  const offUpdateStockList = updateStockList(panel.webview, stockList);

  const updateWebViewCfg = (cfg: Object) => {
    panel.webview.postMessage({
      command: 'updateStockRemind',
      data: cfg,
    });
  };
  events.on('updateConfig:leek-fund.stocksRemind', updateWebViewCfg);

  panel.onDidDispose(() => {
    offUpdateStockList();
    events.off('updateConfig:leek-fund.stocksRemind', updateWebViewCfg);
    _INITED = false;
  });
}

export function setStocksRemindCfgCb(cfg: Object) {
  LeekFundConfig.setConfig('leek-fund.stocksRemind', cfg).then(
    () => {
      window.showInformationMessage('保存成功！');
      cacheStocksRemindData(cfg);
    },
    (err) => {
      console.error(err);
    }
  );
}

/**
 * 更新列表数据
 * @param webview
 * @param defaultStockList
 */
function updateStockList(webview: Webview, defaultStockList: Array<LeekTreeItem>) {
  function postStockList(stockList: Array<LeekTreeItem>) {
    webview.postMessage({
      command: 'updateStockList',
      data: stockList,
    });
  }
  postStockList(defaultStockList);
  events.on('stockListUpdate', postStockList);
  return () => {
    events.off('stockListUpdate', postStockList);
  };
}

export function cacheStocksRemindData(remindObj: Object) {
  globalState.stocksRemind = remindObj;
}

export default setStocksRemind;
