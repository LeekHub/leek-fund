import { EventEmitter } from 'events';
import { authentication, Uri, ViewColumn, Webview, window } from 'vscode';
import FundService from '../explorer/fundService';
import StockService from '../explorer/stockService';
import globalState from '../globalState';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { events, getTemplateFileContent, getWebviewResourcesUrl } from '../shared/utils';
import fundFlow, { mainFundFlow } from './fundFlow';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import tucaoForum from './tucaoForum';

let _INITED = false;

let panelEvents: EventEmitter;

function leekCenterView(stockService: StockService, fundServices: FundService) {
  const panel = ReusedWebviewPanel.create('leekCenterWebview', `韭菜中心`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });

  if (_INITED) return;
  _INITED = true;
  panelEvents = new EventEmitter();

  setList(panel.webview, panelEvents, stockService, fundServices);
  setStocksRemind(panel.webview, panelEvents);
  setDiscussions(panel.webview, panelEvents);

  const _getWebviewResourcesUrl = (arr: string[]): Uri[] => {
    return getWebviewResourcesUrl(panel.webview, globalState.context.extensionUri, arr);
  };

  panel.webview.html = getTemplateFileContent('stocks-view.html', panel.webview);

  panel.webview.onDidReceiveMessage((message) => {
    panelEvents.emit('onDidReceiveMessage', message);
    switch (message.command) {
      case 'alert':
        window.showErrorMessage(message.message);
        return;
      case 'fail':
        window.showErrorMessage('保存失败！');
        return;
      case 'pageReady':
        panelEvents.emit('pageReady');
        return;
      case 'hsgtFundFlow':
        fundFlow();
        return;
      case 'mainFundFlow':
        mainFundFlow();
        return;
      case 'tucaoForum':
        tucaoForum();
        return;
    }
  }, undefined);

  panel.onDidDispose(() => {
    panelEvents.emit('onDidDispose');
    _INITED = false;
  });
}

function setStocksRemind(webview: Webview, panelEvents: EventEmitter) {
  // console.log('stockList: ', stockList);

  panelEvents.on('onDidReceiveMessage', (message) => {
    switch (message.command) {
      case 'saveRemind':
        console.log(JSON.parse(message.data));
        setStocksRemindCfgCb(JSON.parse(message.data));
        return;
    }
  });

  panelEvents.on('pageReady', () => {
    webview.postMessage({
      command: 'updateStockRemind',
      data: globalState.stocksRemind,
    });
  });

  const updateWebViewCfg = (cfg: Object) => {
    webview.postMessage({
      command: 'updateStockRemind',
      data: cfg,
    });
  };
  events.on('updateConfig:leek-fund.stocksRemind', updateWebViewCfg);

  panelEvents.on('onDidDispose', () => {
    events.off('updateConfig:leek-fund.stocksRemind', updateWebViewCfg);
  });
}

function setDiscussions(webview: Webview, panelEvents: EventEmitter) {
  function login(slient = true) {
    return getGithubToken(slient).then((res) => {
      if (res) {
        webview.postMessage({
          command: 'setGithubAccessToken',
          data: res,
        });
      }
    });
  }

  panelEvents.on('pageReady', () => {
    login().then(() => {
      webview.postMessage({
        command: 'talkerReady',
      });
    });
  });

  panelEvents.on('onDidReceiveMessage', (message) => {
    switch (message.command) {
      case 'loginGithub':
        console.log('loginGithub');
        login(false).then(() => {
          webview.postMessage({
            command: 'githubLoginSuccess',
          });
        });
        return;
    }
  });
}

function setList(
  webview: Webview,
  panelEvents: EventEmitter,
  stockService: StockService,
  fundServices: FundService
) {
  const postListFactory = (command: string) => (data: Array<LeekTreeItem>) => {
    webview.postMessage({
      command,
      data,
    });
  };
  /**
   * 更新列表数据
   * @param webview
   * @param defaultStockList
   */
  function updateStockList(webview: Webview, defaultStockList: Array<LeekTreeItem>) {
    const postStockList = postListFactory('updateStockList');
    postStockList(defaultStockList);
    events.on('stockListUpdate', postStockList);
    return () => {
      events.off('stockListUpdate', postStockList);
    };
  }

  function updateFundList(webview: Webview, defaultStockList: Array<LeekTreeItem>) {
    const postFundList = postListFactory('updateFundList');
    postFundList(defaultStockList);
    events.on('fundListUpdate', postFundList);
    return () => {
      events.off('fundListUpdate', postFundList);
    };
  }

  const offUpdateStockList = updateStockList(webview, stockService.stockList);
  const offUpdateFundList = updateFundList(webview, fundServices.fundList);
  panelEvents.on('onDidDispose', () => {
    offUpdateStockList();
    offUpdateFundList();
  });
}

function getGithubToken(slient = true) {
  if (!authentication) {
    window.showErrorMessage('当前vscode版本过低，请升级vscode');
  }
  return authentication
    .getSession('github', ['read:user', 'user:email', 'public_repo'], { createIfNone: !slient })
    .then((res) => {
      return res?.accessToken ?? null;
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

export function cacheStocksRemindData(remindObj: Object) {
  globalState.stocksRemind = remindObj;
}

export default leekCenterView;
