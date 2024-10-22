import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';

function binanceTrend(name: string) {
  const [token, unit] = name.split('_');
  const tabTitle = `${token}${unit} | 现货交易`;

  const panel = ReusedWebviewPanel.create('binanceTrendWebview', tabTitle, ViewColumn.One, {
    enableScripts: true,
  });

  panel.webview.html = panel.webview.html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${tabTitle}</title>
      <style>
        html.vscode-dark, body.vscode-dark, html.vscode-high-contrast, body.vscode-high-contrast {
          filter: invert(100%) hue-rotate(180deg);
        }
        html, body {
          width: 100%;
          height: 100%;
          min-width: 600px;
          min-height: 400px;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div class="tradingview-widget-container">
        <div id="tradingview_chart"></div>
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "BINANCE:${token}${unit}",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "withdateranges": true,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": "tradingview_chart"
          });
        </script>
      </div>
    </body>
  </html>
  `;
}

export default binanceTrend;
