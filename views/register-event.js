const vscode = require('vscode');
const { getFundHistoryData } = require('./fund-history');

exports.registerViewEvent = (context) => {
  // 注册事件
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.leetfund.stockItemClick',
      (code, name, text) => {
        // 创建webview
        const panel = vscode.window.createWebviewPanel(
          'stockWebview', // viewType
          name, // 视图标题
          vscode.ViewColumn.One, // 显示在编辑器的哪个部位
          {
            // enableScripts: true, // 启用JS，默认禁用
            // retainContextWhenHidden: true, // webview被隐藏时保持状态，避免被重置
          }
        );
        panel.webview.html = `<html><body>
          <br/>
          <p style="margin-left:20px;font-size:18px">${text}</p>
          <hr />
          <br/>
          <img src="http://img1.money.126.net/chart/hs/time/210x140/${code}.png" width="420"/>
        </body></html>`;
      }
    )
  );

  // 基金点击
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.leetfund.fundItemClick',
      async (code, name, text) => {
        const res = await getFundHistoryData(code);
        // 创建webview
        const panel = vscode.window.createWebviewPanel(
          'fundWebview',
          name,
          vscode.ViewColumn.One
        );
        panel.webview.html = `<html>
          <style>
          .lsjz{
            width: 100%;
            text-align: center;
          }
          .red{
            color:red;
          }
          .grn{
            color:green;
          }
          </style>
          <body>
            <br/>
            <p style="margin-left:20px;font-size:18px">${text}</p>
            <hr />
            <br/>
           ${res.content}
          </body></html>`;
      }
    )
  );
};
