const vscode = require('vscode');
const { getFundHistoryData } = require('./fund-history');
const { deleteFund, addFund } = require('../config-util');

exports.registerViewEvent = (context) => {
  // 基金删除
  vscode.commands.registerCommand('fund.delete', (target) =>
    deleteFund(target.id)
  );
  // 基金添加
  vscode.commands.registerCommand('fund.add', () => addFund());

  // 注册事件
  context.subscriptions.push(
    // 股票点击
    vscode.commands.registerCommand(
      'extension.leetfund.stockItemClick',
      (code, name, text, stockCode) => {
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
          <h3>实时走势图</3> <br/>
          <img src="http://img1.money.126.net/chart/hs/time/210x140/${code}.png" width="420"/>
          <br/>
          <h3>时分K线图</3> <br/>
          <img src="https://image.sinajs.cn/newchart/min/n/${stockCode.toLowerCase()}.gif" width="420"/>
          <br/>
          <h3>日K线图</3> <br/>
          <img src="http://image.sinajs.cn/newchart/daily/n/${stockCode.toLowerCase()}.gif" width="420"/>
          <h3>周K线图</3> <br/>
          <img src="http://image.sinajs.cn/newchart/weekly/n/${stockCode.toLowerCase()}.gif" width="420"/>
          <h3>月K线图</3> <br/>
          <img src="https://image.sinajs.cn/newchart/monthly/n/${stockCode.toLowerCase()}.gif" width="420"/>
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
            min-width:600px;
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
