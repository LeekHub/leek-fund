import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import stockTrendPic from './stockTrendPic';
import globalState from '../globalState';
import { getEastmoneyHost } from './proxyService/proxyConfig';

function stockTrend(code: string, name: string, stockCode: string) {
  if (['0dji', '0ixic', '0inx'].includes(code)) {
    return stockTrendPic(code, name, stockCode);
  }
  if (/^恒生.*指数$/.test(name)) {
    return stockTrendPic(code, name, stockCode);
  }
  stockCode = stockCode.toLowerCase();
  let market = '1';
  if (stockCode.indexOf('hk') === 0) {
    market = '116';
  } else if (stockCode.indexOf('gb_') === 0) {
    stockCode = stockCode.replace('gb_', '.');
  } else if (stockCode.indexOf('usr_') === 0) {
    stockCode = stockCode.replace('usr_', '');
    market = '105';
  } else {
    market = stockCode.substring(0, 2) === 'sh' ? '1' : '0';
  }

  let mcid = market + '.' + code.substr(1);
  let url = `${getEastmoneyHost()}/basic/full.html?mcid=${mcid}`;

  if (!!globalState.kLineChartSwitch) {
    if (
      (market === '1' || market === '0') &&
      stockCode.indexOf('sh000') !== 0 &&
      stockCode.indexOf('sz399') !== 0
    ) {
      // 沪深股票详情地址可查看盘前盘后指数、买五卖五、筹码分布
      url = `${getEastmoneyHost()}/basic/h5chart-iframe.html?code=${code.substr(1)}&market=${market}`;
    }
  }

  // TODO：问题1. 需要选择合适的显示页面。上面的 eastmoney 网站不支持期货，market 113在这个网页上不支持。
  // 问题 2. 如果选用东财传统网页，存在交易代码不一致问题。例如甲醇 `MA2201` 在东财上的代码为 `MA201`，`PVC又是 v2201`
  // 直接采用新浪财经网址，去除 nf的显示
  const isFuture = /nf_/.test(stockCode) || /hf_/.test(stockCode);
  if (isFuture) {
    stockCode = stockCode.replace('nf_', '').replace('hf_', '').toUpperCase();
    url = `https://finance.sina.com.cn/futures/quotes/${stockCode}.shtml`;
  }

  let tabTitle = !isFuture ? `股票实时走势(${code})` : `期货实时走势(${name})`;
  const panel = ReusedWebviewPanel.create('stockTrendWebview', tabTitle, ViewColumn.One, {
    enableScripts: true,
  });

  panel.webview.html = panel.webview.html = `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>股票走势</title>
    <style>
    html.vscode-dark, body.vscode-dark, html.vscode-high-contrast, body.vscode-high-contrast {
      filter: invert(100%) hue-rotate(180deg);
    }
    </style>
  </head>
  <body>
    <div  style="min-width: 1320px; overflow-x:auto">
      <iframe
      src="${url}"
      frameborder="0"
      style="width: 100%; height: 900px"
    ></iframe>
    </div>
  </body>
</html>

  `;
}

export default stockTrend;
