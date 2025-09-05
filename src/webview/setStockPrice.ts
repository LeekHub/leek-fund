import { commands, ViewColumn, WebviewPanel, window } from 'vscode';
import FundService from '../explorer/fundService';
import StockService from '../explorer/stockService';
import globalState from '../globalState';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { IAmount } from '../shared/typed';
import { formatDate, getTemplateFileContent, toFixed } from '../shared/utils';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { cloneDeep } from 'lodash';

async function setStockPrice(stockService: StockService) {
  // const list = fundDataHandler(fundService);
  const panel = ReusedWebviewPanel.create(
    'setStockPriceWebview',
    `股票成本价设置`,
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case 'success':
        console.log(JSON.parse(message.text));
        setStockPriceCfgCb(JSON.parse(message.text));
        return;
      case 'alert':
        window.showErrorMessage('保存失败！');
        return;
      case 'donate':
        commands.executeCommand('leek-fund.donate');
        return;
      case 'refresh':
        const list = stockDataHandler(stockService);
        // console.log(list);
        // panel.webview.html = `<h3>loading</h3>`;
        // getWebviewContent(panel);
        panel.webview.postMessage({
          command: 'init',
          data: list,
          sortType: message.sortType,
        });
        return;
      case 'telemetry':
        globalState.telemetry.sendEvent('shareByPicture', { type: message.type });
        return;
    }
  }, undefined);

  getWebviewContent(panel);

  /* panel.onDidChangeViewState((event) => {
    // console.log(event);
    panel.webview.postMessage({
      command: 'init',
      data: list,
    });
  }); */
}

function stockDataHandler(stockService: StockService) {
  const fundList: LeekTreeItem[] = cloneDeep(stockService.getSelfSelected());
  console.log('list', fundList);
  const amountObj: any = globalState.stockPrice || {};
  const list = fundList.map((item: LeekTreeItem) => {
    return {
      name: item.info?.name,
      code: item.info?.code,
      percent: item.info?.percent,
      amount: amountObj[item.info?.code]?.amount || 0,
      earningPercent: item.info?.earningPercent,
      // unitPrice: item.info?.unitPrice,
      unitPrice: amountObj[item.info?.code]?.unitPrice || 0,
      todayUnitPrice: amountObj[item.info?.code]?.todayUnitPrice || 0,
      isSellOut: amountObj[item.info?.code]?.isSellOut || false,
      // costUnitPrice: amountObj[item.info?.code]?.unitPrice || 0,
      // priceDate: formatDate(item.info?.time),
      earnings: item.info?.earnings || 0,
      yestEarnings: amountObj[item.info.code]?.earnings || 0,
      price: item.info?.yestclose,
      priceDate: item.info?.yestPriceDate,
    };
  });

  return list;
}

function getWebviewContent(panel: WebviewPanel) {
  /*   const _getWebviewResourcesUrl = (arr: string[]): Uri[] => {
    return getWebviewResourcesUrl(panel.webview, globalState.context.extensionUri, arr);
  }; */

  panel.webview.html = getTemplateFileContent('stock-price.html', panel.webview);
}

function setStockPriceCfgCb(data: IAmount[]) {
  const cfg: any = {};
  data.forEach((item: any) => {
    cfg[item.code] = {
      name: item.name,
      amount: item.amount || 0,
      price: item.price,
      unitPrice: item.unitPrice,
      todayUnitPrice: item.todayUnitPrice || 0,
      isSellOut: item.isSellOut || false,
      earnings: item.earnings,
      priceDate: item.priceDate,
    };
  });
  LeekFundConfig.setConfig('leek-fund.stockPrice', cfg).then(() => {
    cacheStockPriceData(cfg);
    window.showInformationMessage('保存成功！（没开市的时候添加的持仓盈亏为0，开市时会自动计算）');
  });
}

/**
 * 更新持仓金额
 * @param leekModel
 */
export async function updateStockPrice() {
  const amountObj: any = globalState.stockPrice;
  const codes = Object.keys(amountObj);
  if (codes.length === 0) {
    return;
  }
  const filterCodes: string[] = [];
  for (const code of codes) {
    const amount = amountObj[code]?.amount;
    if (amount > 0) {
      filterCodes.push(code);
    }
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const qryFundInfos = filterCodes.map((filterCode) => {
      return FundService.qryFundInfo(filterCode);
    });
    const resultFundInfos = await Promise.allSettled(qryFundInfos);
    const fundInfos: any[] = [];
    for (const resultFundInfo of resultFundInfos) {
      if (resultFundInfo.status === 'fulfilled') {
        const fundStrings = /jsonpgz\((.*)\);/.exec(resultFundInfo.value) || [];
        const fundString = fundStrings.length === 2 ? fundStrings[1] : '';
        const fundInfo = JSON.parse(fundString);
        fundInfos.push(fundInfo);
      }
    }
    fundInfos.forEach((item: any) => {
      const { fundcode: FCODE, gztime: GZTIME, dwjz: NAV, jzrq: PDATE } = item;
      const time = GZTIME?.substr(0, 10);
      const pdate = PDATE?.substr(0, 10);
      const isUpdated = pdate === time; // 判断闭市的时候
      const money = amountObj[FCODE]?.amount || 0;
      const price = amountObj[FCODE]?.price || 0;
      const priceDate = amountObj[FCODE]?.priceDate || '';
      if (priceDate !== pdate) {
        const currentMoney = (money / price) * NAV;
        amountObj[FCODE].amount = toFixed(currentMoney);
        if (isUpdated) {
          // 闭市的时候保留上一次盈亏值
          amountObj[FCODE].earnings = toFixed(currentMoney - money);
        }
        amountObj[FCODE].priceDate = pdate;
        amountObj[FCODE].price = NAV;
      }
    });
    if (fundInfos.length > 0) {
      LeekFundConfig.setConfig('leek-fund.fundAmount', amountObj).then(() => {
        cacheStockPriceData(amountObj);
        console.log('🐥fundAmount has Updated ');
      });
    }
  } catch (e) {
    return [];
  }
}

export function cacheStockPriceData(amountObj: Object) {
  globalState.stockPrice = amountObj;
  globalState.stockPriceCacheDate = formatDate(new Date());
}

export default setStockPrice;
