import { window, commands, ExtensionContext, ViewColumn } from 'vscode';
import { FundModel } from './views/model';
import { FundService } from './service';
import { FundProvider } from './views/fundProvider';
import { StockProvider } from './views/stockProvider';

export function registerViewEvent(
  context: ExtensionContext,
  service: FundService,
  fundPorvider: FundProvider,
  stockPorvider: StockProvider
) {
  const fundModel = new FundModel();

  // Fund operation
  commands.registerCommand('fund.refresh', () => {
    fundPorvider.refresh();
    const handler = window.setStatusBarMessage(`基金数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('fund.delete', (target) => {
    fundModel.removeFundCfg(target.id, () => {
      fundPorvider.refresh();
    });
  });
  commands.registerCommand('fund.add', () => {
    window
      .showInputBox({
        prompt: '请输入基金代码，多个用英文逗号隔开（回车保存）',
      })
      .then((code) => {
        if (!code) {
          return;
        }
        fundModel.updateFundCfg(code.replace(/，/g, ','), () => {
          fundPorvider.refresh();
        });
      });
  });
  commands.registerCommand('fund.sort', () => {
    fundPorvider.changeOrder();
    fundPorvider.refresh();
  });

  // Stock operation
  commands.registerCommand('stock.refresh', () => {
    stockPorvider.refresh();
    const handler = window.setStatusBarMessage(`股票数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('stock.delete', (target) => {
    fundModel.removeStockCfg(target.id, () => {
      stockPorvider.refresh();
    });
  });
  commands.registerCommand('stock.add', () => {
    window
      .showInputBox({
        prompt: '请输入股票代码，多个用英文逗号隔开（回车保存）',
      })
      .then((code) => {
        if (!code) {
          return;
        }
        fundModel.updateStockCfg(code.replace(/，/g, ','), () => {
          stockPorvider.refresh();
        });
      });
  });
  commands.registerCommand('stock.sort', () => {
    stockPorvider.changeOrder();
    stockPorvider.refresh();
  });

  // Webview
  context.subscriptions.push(
    // 股票点击
    commands.registerCommand(
      'leetfund.stockItemClick',
      (code, name, text, stockCode) => {
        console.log('stockCode=', stockCode);
        // 创建webview
        const panel = window.createWebviewPanel(
          'stockWebview', // viewType
          name, // 视图标题
          ViewColumn.One, // 显示在编辑器的哪个部位
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
    commands.registerCommand(
      'leetfund.fundItemClick',
      async (code, name, text) => {
        const res = await service.getFundHistoryByCode(code);
        // 创建webview
        const panel = window.createWebviewPanel(
          'fundWebview',
          name,
          ViewColumn.One
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
}
