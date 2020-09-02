import { commands, ExtensionContext, window } from 'vscode';
import fundSuggestList from './data/FundSuggestList';
import { LeekTreeItem } from './leekTreeItem';
import { LeekFundService } from './service';
import checkForUpdate from './update';
import { colorOptionList, randomColor } from './utils';
import { FundProvider } from './views/fundProvider';
import { LeekFundModel } from './views/model';
import { NewsProvider } from './views/newsProvider';
import { NewsService } from './views/newsService';
import { StockProvider } from './views/stockProvider';
import allFundTrend from './webview/allFundTrend';
import donate from './webview/donate';
import fundFlow from './webview/fundFlow';
import fundHistory from './webview/fundHistory';
import fundRank from './webview/fundRank';
import fundTrend from './webview/fundTrend';
import openNews from './webview/news';
import stockTrend from './webview/stockTrend';

export function registerViewEvent(
  context: ExtensionContext,
  service: LeekFundService,
  fundProvider: FundProvider,
  stockProvider: StockProvider,
  newsProvider: NewsProvider
) {
  const leekModel = new LeekFundModel();
  const newsService = new NewsService();

  // Fund operation
  commands.registerCommand('leek-fund.refreshFund', () => {
    fundProvider.refresh();
    const handler = window.setStatusBarMessage(`基金数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('leek-fund.deleteFund', (target) => {
    leekModel.removeFundCfg(target.id, () => {
      fundProvider.refresh();
    });
  });
  commands.registerCommand('leek-fund.addFund', () => {
    /* if (!service.fundSuggestList.length) {
      service.getFundSuggestList();
      window.showInformationMessage(`获取基金数据中，请稍后再试`);
      return;
    } */

    window.showQuickPick(fundSuggestList, { placeHolder: '请输入基金代码' }).then((code) => {
      if (!code) {
        return;
      }
      leekModel.updateFundCfg(code.split('|')[0], () => {
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
    leekModel.removeStockCfg(target.id, () => {
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
      leekModel.updateStockCfg(newCode, () => {
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
  // 基金置顶
  commands.registerCommand('leek-fund.setFundTop', (target) => {
    leekModel.setFundTopCfg(target.id, () => {
      fundProvider.refresh();
    });
  });
  // 股票置顶
  commands.registerCommand('leek-fund.setStockTop', (target) => {
    leekModel.setStockTopCfg(target.id, () => {
      fundProvider.refresh();
    });
  });

  /**
   * News command
   */
  commands.registerCommand('leek-fund.newItemClick', async (userName, userId) => {
    const newsList: any | never = await newsService.getNewsData(userId);
    openNews(userName, newsList);
  });
  commands.registerCommand('leek-fund.viewUserTimeline', async (target) => {
    const userName = target.label;
    const userId = target.id;
    const newsList: any | never = await newsService.getNewsData(userId);
    openNews(userName, newsList, true);
  });

  commands.registerCommand('leek-fund.addNews', () => {
    window
      .showInputBox({ placeHolder: '请输入雪球用户ID（进入用户首页复制最后的数字串）' })
      .then(async (id) => {
        if (!id) {
          return;
        }
        const newsUserIds = leekModel.getCfg('leek-fund.newsUserIds') || [];
        if (newsUserIds.includes(id)) {
          window.showInformationMessage(`ID为 ${id} 的用户已存在，无需添加`);
          return;
        }
        try {
          const list = await newsService.getNewsUserList([id]);
          if (list.length === 1) {
            newsUserIds.push(id);
            leekModel.setConfig('leek-fund.newsUserIds', newsUserIds).then(() => {
              newsProvider.refresh();
            });
          }
        } catch (e) {
          window.showErrorMessage(`获取用户（${id}）信息失败`);
        }
      });
  });

  commands.registerCommand('leek-fund.deleteUser', (target) => {
    const newsUserIds = leekModel.getCfg('leek-fund.newsUserIds') || [];
    const newIds = newsUserIds.filter((id: string) => id !== target.id);
    leekModel.setConfig('leek-fund.newsUserIds', newIds).then(() => {
      newsProvider.refresh();
    });
  });

  /**
   * Settings command
   */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.hideText', () => {
      service.toggleLabel();
      fundProvider.refresh();
      stockProvider.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockStatusBar', () => {
      const stockList = service.stockList;
      const stockNameList = stockList.map((item: LeekTreeItem) => {
        return {
          label: `${item.info.name}`,
          description: `${item.info.code}`,
        };
      });
      window
        .showQuickPick(stockNameList, {
          placeHolder: '输入过滤选择，支持多选（限4个）',
          canPickMany: true,
        })
        .then((res) => {
          if (!res?.length) {
            return;
          }
          let codes = res.map((item) => item.description);
          if (codes.length > 4) {
            codes = codes.slice(0, 4);
          }
          console.log(codes.length);
          leekModel.updateStatusBarStockCfg(codes, () => {
            const handler = window.setStatusBarMessage(`下次数据刷新见效`);
            setTimeout(() => {
              handler.dispose();
            }, 1500);
          });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.setRiseAndFallColor', () => {
      const colorList = colorOptionList();
      window
        .showQuickPick(
          [
            { label: '📈状态栏股票涨的颜色', description: 'rise' },
            { label: '📉状态栏股票跌的颜色', description: 'fall' },
          ],
          {
            placeHolder: '第一步：选择设置对象',
          }
        )
        .then((item: any) => {
          if (!item) {
            return;
          }

          window
            .showQuickPick(colorList, {
              placeHolder: `第二步：设置颜色（${item.label}）`,
            })
            .then((colorItem: any) => {
              if (!colorItem) {
                return;
              }
              let color = colorItem.description;
              if (color === 'random') {
                color = randomColor();
              }
              leekModel.setConfig(
                item.description === 'rise' ? 'leek-fund.riseColor' : 'leek-fund.fallColor',
                color
              );
            });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.configSetting', () => {
      commands.executeCommand('workbench.action.openSettings', '@ext:giscafer.leek-fund');
    })
  );

  context.subscriptions.push(commands.registerCommand('leek-fund.donate', () => donate()));

  checkForUpdate();
}
