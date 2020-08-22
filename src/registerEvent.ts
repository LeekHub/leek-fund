import { commands, ExtensionContext, window, Uri, env } from 'vscode';
import { LeekFundService } from './service';
import { FundProvider } from './views/fundProvider';
import { FundModel } from './views/model';
import { StockProvider } from './views/stockProvider';
import allFundTrend from './webview/allFundTrend';
import fundFlow from './webview/fundFlow';
import fundHistory from './webview/fundHistory';
import fundRank from './webview/fundRank';
import fundTrend from './webview/fundTrend';
import stockTrend from './webview/stockTrend';
import donate from './webview/donate';

export function registerViewEvent(
  context: ExtensionContext,
  service: LeekFundService,
  fundProvider: FundProvider,
  stockProvider: StockProvider
) {
  const fundModel = new FundModel();

  // Fund operation
  commands.registerCommand('leek-fund.refreshFund', () => {
    fundProvider.refresh();
    const handler = window.setStatusBarMessage(`基金数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('leek-fund.deleteFund', (target) => {
    fundModel.removeFundCfg(target.id, () => {
      fundProvider.refresh();
    });
  });
  commands.registerCommand('leek-fund.addFund', () => {
    if (!service.fundSuggestList.length) {
      window.showInformationMessage(`获取基金数据中，请稍后再试`);
      return;
    }

    window
      .showQuickPick(service.fundSuggestList, { placeHolder: '请输入基金代码' })
      .then((code) => {
        if (!code) {
          return;
        }
        fundModel.updateFundCfg(code.split('|')[0], () => {
          fundProvider.refresh();
        });
      });
  });
  commands.registerCommand('leek-fund.sortFund', () => {
    fundProvider.changeOrder();
    fundProvider.refresh();
  });

  // Stock operation
  commands.registerCommand('leek-fund.refreshStock', () => {
    stockProvider.refresh();
    const handler = window.setStatusBarMessage(`股票数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('leek-fund.deleteStock', (target) => {
    fundModel.removeStockCfg(target.id, () => {
      stockProvider.refresh();
    });
  });
  commands.registerCommand('leek-fund.addStock', () => {
    // vscode QuickPick 不支持动态查询，只能用此方式解决
    // https://github.com/microsoft/vscode/issues/23633
    const qp = window.createQuickPick();
    qp.items = [{ label: '请输入关键词查询，如：0000001 或 上证指数' }];
    let code: string | undefined;
    let timer: NodeJS.Timer | null = null;
    qp.onDidChangeValue((value) => {
      qp.busy = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(async () => {
        const res = await service.getStockSuggestList(value);
        qp.items = res;
        qp.busy = false;
      }, 100); // 简单防抖
    });
    qp.onDidChangeSelection((e) => {
      if (e[0].description) {
        code = e[0].label && e[0].label.split(' | ')[0];
      }
    });
    qp.show();
    qp.onDidAccept(() => {
      if (!code) {
        return;
      }
      // 存储到配置的时候是接口的参数格式，接口请求时不需要再转换
      const newCode = code.replace('gb', 'gb_').replace('us', 'usr_');
      fundModel.updateStockCfg(newCode, () => {
        stockProvider.refresh();
      });
      qp.hide();
      qp.dispose();
    });
  });
  commands.registerCommand('leek-fund.sortStock', () => {
    stockProvider.changeOrder();
    stockProvider.refresh();
  });

  /**
   * WebView
   */
  // 股票点击
  context.subscriptions.push(
    commands.registerCommand('leet-fund.stockItemClick', (code, name, text, stockCode) =>
      stockTrend(code, name, text, stockCode)
    )
  );
  // 基金点击
  context.subscriptions.push(
    commands.registerCommand('leet-fund.fundItemClick', (code, name) => fundTrend(code, name))
  );
  // 基金右键历史信息点击
  commands.registerCommand('leek-fund.viewFundHistory', (item) => fundHistory(service, item));
  // 基金排行
  commands.registerCommand('leek-fund.viewFundRank', () => fundRank(service));
  // 基金走势图
  commands.registerCommand('leek-fund.viewFundTrend', () => allFundTrend(service));
  // 资金流向
  commands.registerCommand('leek-fund.viewFundFlow', () => fundFlow());

  /**
   * Settings command
   */
  context.subscriptions.push(
    commands.registerCommand(`leek-fund.hideText`, () => {
      console.log('hideText');
      service.toggleLabel();
      console.log('hideText=', service.showLabel);
      fundProvider.refresh();
      stockProvider.refresh();
    })
  );
  /*  context.subscriptions.push(
    commands.registerCommand(`leek-fund.hideText`, () =>
      env.openExternal(Uri.parse('https://unicode.org/emoji/charts-12.0/full-emoji-list.html'))
    )
  ); */
  context.subscriptions.push(commands.registerCommand('leek-fund.donate', () => donate()));
}
