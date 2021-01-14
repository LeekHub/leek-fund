import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import stockTrendPic from './stockTrendPic';

function stockTrend(code: string, name: string, stockCode: string) {
  if (['0dji', '0ixic'].includes(code)) {
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
  // console.log(`http://quote.eastmoney.com/basic/full.html?mcid=${mcid}`);

  const panel = ReusedWebviewPanel.create(
    'stockTrendWebview',
    `股票实时走势(${code})`,
    ViewColumn.One,
    {
      enableScripts: true,
    }
  );

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
      src="http://quote.eastmoney.com/basic/full.html?mcid=${mcid}"
      frameborder="0"
      style="width: 100%; height: 900px"
    ></iframe>
    </div>
  </body>
</html>

  `;
}

export default stockTrend;
