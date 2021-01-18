import { EventEmitter } from 'events';
import { authentication, Uri, ViewColumn, Webview, window, commands } from 'vscode';
import FundService from '../explorer/fundService';
import StockService from '../explorer/stockService';
import globalState from '../globalState';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { events, getTemplateFileContent, formatHTMLWebviewResourcesUrl } from '../shared/utils';
import ReusedWebviewPanel from './ReusedWebviewPanel';

import LeekCenterFlashNewsView from './leek-center/flash-news-view';

import axios from 'axios';
import { FlashNewsServerInterface } from '../output/flash-news/NewsFlushServiceAbstractClass';

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

  let flashNewsServer: FlashNewsServerInterface | undefined;
  // const transceiver = transceiverFactory(panel.webview); 备用

  setList(panel.webview, panelEvents, stockService, fundServices);
  setStocksRemind(panel.webview, panelEvents);
  // setDiscussions(panel.webview, panelEvents);

  panel.webview.onDidReceiveMessage((message) => {
    panelEvents.emit('onDidReceiveMessage', message);
    switch (message.command) {
      case 'alert':
        window.showErrorMessage(message.data);
        return;
      case 'fail':
        window.showErrorMessage('保存失败！');
        return;
      case 'pageReady':
        flashNewsServer = new LeekCenterFlashNewsView(panel.webview);
        panelEvents.emit('pageReady');
        return;
      case 'executeCommand':
        commands.executeCommand(message.data);
        return;
      case 'fetch':
        console.log('fetch:', message.data);
        axios(message.data).then(
          postFetchResponseFactory(panel.webview, true, message.data.sessionId),
          postFetchResponseFactory(panel.webview, false, message.data.sessionId)
        );
        return;
    }
  }, undefined);

  panel.onDidDispose(() => {
    panelEvents.emit('onDidDispose');
    flashNewsServer?.destroy();
    _INITED = false;
  });

  if (globalState.isDevelopment) {
    const DEV_URL = 'http://localhost:3030/';
    axios
      .get(DEV_URL)
      .then((res) => {
        const html = res.data;
        panel.webview.html = formatHTMLWebviewResourcesUrl(html, (link) => {
          return DEV_URL + link;
        });
      })
      .catch((err) => {
        window.showErrorMessage('[开发] 获取 http://localhost:3030/ 失败，请先启动服务');
      });
  } else {
    console.log(getTemplateFileContent(['leek-center', 'build', 'index.html'], panel.webview));
    panel.webview.html = getTemplateFileContent(
      ['leek-center', 'build', 'index.html'],
      panel.webview
    );
  }
}

function postFetchResponseFactory(webview: Webview, success: boolean, sessionId: string) {
  return (response: any) => {
    if (!success) console.log('请求失败');
    console.log('response: ', response);
    const { request, ...rawResponse } = response;
    webview.postMessage({
      command: 'fetchResponse',
      data: {
        success,
        response: rawResponse,
        sessionId,
      },
    });
  };
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

  const updateWebViewCfg = () => {
    console.log('updateStockRemind: ', globalState.stocksRemind);
    webview.postMessage({
      command: 'updateStockRemind',
      data: globalState.stocksRemind,
    });
  };
  events.on('onDidChangeConfiguration', updateWebViewCfg);

  panelEvents.on('onDidDispose', () => {
    events.off('onDidChangeConfiguration', updateWebViewCfg);
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
  let postStockList: undefined | ReturnType<typeof postListFactory>;
  function updateStockList(webview: Webview, defaultStockList: Array<LeekTreeItem>) {
    postStockList = postListFactory('updateStockList');
    events.on('stockListUpdate', postStockList);
    return () => {
      events.off('stockListUpdate', postStockList!);
    };
  }

  let postFundList: undefined | ReturnType<typeof postListFactory>;
  function updateFundList(webview: Webview, defaultFundList: Array<LeekTreeItem>) {
    postFundList = postListFactory('updateFundList');
    events.on('fundListUpdate', postFundList);
    return () => {
      events.off('fundListUpdate', postFundList!);
    };
  }

  const offUpdateStockList = updateStockList(webview, stockService.stockList);
  const offUpdateFundList = updateFundList(webview, fundServices.fundList);

  panelEvents.on('pageReady', () => {
    postStockList!(stockService.stockList);
    postFundList!(fundServices.fundList);
  });
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
      window.showInformationMessage('价格预警保存成功！');
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
