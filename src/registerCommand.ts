import { commands, ExtensionContext, window } from 'vscode';
import fundSuggestList from './data/fundSuggestData';
import { BinanceProvider } from './explorer/binanceProvider';
import BinanceService from './explorer/binanceService';
import { FundProvider } from './explorer/fundProvider';
import FundService from './explorer/fundService';
import { NewsProvider } from './explorer/newsProvider';
import { NewsService } from './explorer/newsService';
import { StockProvider } from './explorer/stockProvider';
import StockService from './explorer/stockService';
import globalState from './globalState';
import FlashNewsDaemon from './output/flash-news/FlashNewsDaemon';
import FlashNewsOutputServer from './output/flash-news/FlashNewsOutputServer';
import { LeekFundConfig } from './shared/leekConfig';
import { LeekTreeItem } from './shared/leekTreeItem';
import checkForUpdate from './shared/update';
import { colorOptionList, randomColor } from './shared/utils';
import allFundTrend from './webview/allFundTrend';
import donate from './webview/donate';
import fundFlow, { mainFundFlow } from './webview/fundFlow';
import fundHistory from './webview/fundHistory';
import fundPosition from './webview/fundPosition';
import fundRank from './webview/fundRank';
import fundTrend from './webview/fundTrend';
import leekCenterView from './webview/leekCenterView';
import openNews from './webview/news';
import setAmount from './webview/setAmount';
import stockTrend from './webview/stockTrend';
import stockTrendPic from './webview/stockTrendPic';
import tucaoForum from './webview/tucaoForum';

export function registerViewEvent(
  context: ExtensionContext,
  fundService: FundService,
  stockService: StockService,
  fundProvider: FundProvider,
  stockProvider: StockProvider,
  newsProvider: NewsProvider,
  flashNewsOutputServer: FlashNewsOutputServer,
  binanceProvider?: BinanceProvider
) {
  const leekModel = new LeekFundConfig();
  const newsService = new NewsService();
  const binanceService = new BinanceService(context);

  commands.registerCommand('leek-fund.toggleFlashNews', () => {
    const isEnable = LeekFundConfig.getConfig('leek-fund.flash-news');
    LeekFundConfig.setConfig('leek-fund.flash-news', !isEnable).then(() => {
      window.showInformationMessage(`已${isEnable ? '启用' : '关闭'} OUTPUT 的 Flash News！`);
    });
  });

  commands.registerCommand('leek-fund.flash-news-show', () => {
    flashNewsOutputServer.showOutput();
  });

  // Fund operation
  commands.registerCommand('leek-fund.refreshFund', () => {
    fundProvider.refresh();
    const handler = window.setStatusBarMessage(`基金数据已刷新`);
    setTimeout(() => {
      handler.dispose();
    }, 1000);
  });
  commands.registerCommand('leek-fund.deleteFund', (target) => {
    LeekFundConfig.removeFundCfg(target.id, () => {
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
      LeekFundConfig.updateFundCfg(code.split('|')[0], () => {
        fundProvider.refresh();
      });
    });
  });
  commands.registerCommand('leek-fund.sortFund', () => {
    fundProvider.changeOrder();
    fundProvider.refresh();
  });
  commands.registerCommand('leek-fund.sortAmountFund', () => {
    fundProvider.changeAmountOrder();
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
    LeekFundConfig.removeStockCfg(target.id, () => {
      stockProvider.refresh();
    });
  });
  commands.registerCommand('leek-fund.leekCenterView', () => {
    if (stockService.stockList.length === 0 && fundService.fundList.length === 0) {
      window.showWarningMessage('数据刷新中，请稍候！');
      return;
    }
    leekCenterView(stockService, fundService);
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
        const res = await stockService.getStockSuggestList(value);
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
      LeekFundConfig.updateStockCfg(newCode, () => {
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
    commands.registerCommand('leek-fund.stockItemClick', (code, name, text, stockCode) =>
      stockTrend(code, name, stockCode)
    )
  );
  // 基金点击
  context.subscriptions.push(
    commands.registerCommand('leek-fund.fundItemClick', (code, name) => fundTrend(code, name))
  );
  // 基金右键历史信息点击
  commands.registerCommand('leek-fund.viewFundHistory', (item) => fundHistory(item));
  // 基金持仓
  commands.registerCommand('leek-fund.viewFundPosition', (item) => fundPosition(item));
  // 基金排行
  commands.registerCommand('leek-fund.viewFundRank', () => fundRank());
  // 基金走势图
  commands.registerCommand('leek-fund.viewFundTrend', () => allFundTrend(fundService));
  // 资金流向
  commands.registerCommand('leek-fund.viewFundFlow', () => fundFlow());
  commands.registerCommand('leek-fund.viewMainFundFlow', () => mainFundFlow());
  // 基金置顶
  commands.registerCommand('leek-fund.setFundTop', (target) => {
    LeekFundConfig.setFundTopCfg(target.id, () => {
      fundProvider.refresh();
    });
  });
  // 股票置顶
  commands.registerCommand('leek-fund.setStockTop', (target) => {
    LeekFundConfig.setStockTopCfg(target.id, () => {
      fundProvider.refresh();
    });
  });
  // 设置基金持仓金额
  commands.registerCommand('leek-fund.setFundAmount', () => {
    if (fundService.fundList.length === 0) {
      window.showWarningMessage('数据刷新中，请重试！');
      return;
    }
    setAmount(fundService);
  });
  commands.registerCommand('leek-fund.stockTrendPic', (target) => {
    const { code, name, type, symbol } = target.info;
    stockTrendPic(code, name, `${type}${symbol}`);
  });

  /**
   * News command
   */
  commands.registerCommand('leek-fund.newItemClick', (userName, userId) => {
    openNews(newsService, userId, userName);
  });
  commands.registerCommand('leek-fund.viewUserTimeline', (target) => {
    const userName = target.label;
    const userId = target.id;
    openNews(newsService, userId, userName, true);
  });

  commands.registerCommand('leek-fund.addNews', () => {
    window
      .showInputBox({ placeHolder: '请输入雪球用户ID（进入用户首页复制最后的数字串）' })
      .then(async (id) => {
        if (!id) {
          return;
        }
        const newsUserIds = LeekFundConfig.getConfig('leek-fund.newsUserIds') || [];
        if (newsUserIds.includes(id)) {
          window.showInformationMessage(`ID为 ${id} 的用户已存在，无需添加`);
          return;
        }
        try {
          const list = await newsService.getNewsUserList([id]);
          if (list.length === 1) {
            newsUserIds.push(id);
            LeekFundConfig.setConfig('leek-fund.newsUserIds', newsUserIds).then(() => {
              newsProvider.refresh();
            });
          }
        } catch (e) {
          window.showErrorMessage(`获取用户（${id}）信息失败`);
        }
      });
  });

  commands.registerCommand('leek-fund.deleteUser', (target) => {
    const newsUserIds = LeekFundConfig.getConfig('leek-fund.newsUserIds') || [];
    const newIds = newsUserIds.filter((id: string) => id !== target.id);
    LeekFundConfig.setConfig('leek-fund.newsUserIds', newIds).then(() => {
      newsProvider.refresh();
    });
  });

  commands.registerCommand('leek-fund.setXueqiuCookie', (target) => {
    window
      .showInputBox({
        placeHolder:
          '由于防爬虫机制，需要用户设置雪球网站 Cookie（进入雪球网站按F12——>NetWork 复制请求头的 Cookie 值）',
      })
      .then(async (cookieString = '') => {
        const cookie = cookieString.trim();
        if (!cookie) {
          return;
        }
        console.log(cookie);
        LeekFundConfig.setConfig('leek-fund.xueqiuCookie', cookie).then(() => {
          newsProvider.refresh();
        });
      });
  });

  /**
   * Binance command
   */
  commands.registerCommand('leek-fund.refreshBinance', () => {
    binanceProvider?.refresh();
  });

  /* 添加交易对 */
  commands.registerCommand('leek-fund.addBinancePair', async () => {
    const pairsList = await binanceService.getParis();
    window.showQuickPick(pairsList, { placeHolder: '请输入交易对' }).then((pair) => {
      if (!pair) return;
      LeekFundConfig.updateBinanceCfg(pair, () => binanceProvider?.refresh());
    });
  });

  /* 删除交易对 */
  commands.registerCommand('leek-fund.deletePair', (target) => {
    LeekFundConfig.removeBinanceCfg(target.id, () => {
      binanceProvider?.refresh();
    });
  });

  /* 交易对置顶 */
  commands.registerCommand('leek-fund.setPairTop', (target) => {
    LeekFundConfig.setBinanceTopCfg(target.id, () => {
      binanceProvider?.refresh();
    });
  });
  /**
   * Settings command
   */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.hideText', () => {
      fundService.toggleLabel();
      stockService.toggleLabel();
      fundProvider.refresh();
      stockProvider.refresh();
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockStatusBar', () => {
      const stockList = stockService.stockList;
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
          if (!res) {
            res = [];
          }
          let codes = res.map((item) => item.description);
          if (codes.length > 4) {
            codes = codes.slice(0, 4);
          }
          LeekFundConfig.updateStatusBarStockCfg(codes, () => {
            const handler = window.setStatusBarMessage(`下次数据刷新见效`);
            setTimeout(() => {
              handler.dispose();
            }, 1500);
          });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.customSetting', () => {
      const colorList = colorOptionList();
      window
        .showQuickPick(
          [
            { label: '状态栏股票设置', description: 'statusbar-stock' },
            { label: '状态栏股票涨📈的文字颜色', description: 'statusbar-rise' },
            { label: '状态栏股票跌📉的文字颜色', description: 'statusbar-fall' },
            { label: '基金&股票涨跌图标更换', description: 'icontype' },
            { label: '👀显示/隐藏文本', description: 'hideText' },
            {
              label: globalState.showEarnings ? '隐藏盈亏' : '👀显示盈亏',
              description: 'earnings',
            },
            {
              label: globalState.remindSwitch ? '关闭提醒' : '🔔️打开提醒',
              description: 'remindSwitch',
            },
          ],
          {
            placeHolder: '第一步：选择设置项',
          }
        )
        .then((item: any) => {
          if (!item) {
            return;
          }
          const type = item.description;
          // 状态栏颜色设置
          if (type === 'statusbar-rise' || type === 'statusbar-fall') {
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
                LeekFundConfig.setConfig(
                  type === 'statusbar-rise' ? 'leek-fund.riseColor' : 'leek-fund.fallColor',
                  color
                );
              });
          } else if (type === 'statusbar-stock') {
            // 状态栏股票设置
            commands.executeCommand('leek-fund.setStockStatusBar');
          } else if (type === 'icontype') {
            // 基金&股票涨跌图标
            window
              .showQuickPick(
                [
                  {
                    label: '箭头图标',
                    description: 'arrow',
                  },
                  {
                    label: '食物图标1（吃面、吃鸡腿）',
                    description: 'food1',
                  },
                  {
                    label: '食物图标2（烤韭菜、烤肉）',
                    description: 'food2',
                  },
                  {
                    label: '食物图标3（吃面、喝酒）',
                    description: 'food3',
                  },
                  {
                    label: '食物字体图标（吃面、吃鸡腿）',
                    description: 'iconfood',
                  },
                ],
                {
                  placeHolder: `第二步：选择基金&股票涨跌图标`,
                }
              )
              .then((iconItem: any) => {
                if (!iconItem) {
                  return;
                }
                if (globalState.iconType !== iconItem.description) {
                  LeekFundConfig.setConfig('leek-fund.iconType', iconItem.description);
                  globalState.iconType = iconItem.description;
                }
              });
          } else if (type === 'earnings') {
            const newValue = globalState.showEarnings === 1 ? 0 : 1;
            LeekFundConfig.setConfig('leek-fund.showEarnings', newValue);
            globalState.showEarnings = newValue;
          } else if (type === 'hideText') {
            commands.executeCommand('leek-fund.hideText');
          } else if (type === 'remindSwitch') {
            commands.executeCommand('leek-fund.toggleRemindSwitch');
          }
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.openConfigPage', () => {
      commands.executeCommand('workbench.action.openSettings', '@ext:giscafer.leek-fund');
    })
  );

  context.subscriptions.push(commands.registerCommand('leek-fund.donate', () => donate(context)));
  context.subscriptions.push(commands.registerCommand('leek-fund.tucaoForum', () => tucaoForum()));

  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleRemindSwitch', (on?: number) => {
      const newValue = on !== undefined ? (on ? 1 : 0) : globalState.remindSwitch === 1 ? 0 : 1;
      LeekFundConfig.setConfig('leek-fund.stockRemindSwitch', newValue);
      globalState.remindSwitch = newValue;
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.changeStatusBarItem', (stockId) => {
      const stockList = stockService.stockList;
      const stockNameList = stockList
        .filter((stock) => stock.id !== stockId)
        .map((item: LeekTreeItem) => {
          return {
            label: `${item.info.name}`,
            description: `${item.info.code}`,
          };
        });

      window
        .showQuickPick(stockNameList, {
          placeHolder: '更换状态栏个股',
        })
        .then((res) => {
          if (!res) return;
          const statusBarStocks = LeekFundConfig.getConfig('leek-fund.statusBarStock');
          const newCfg = [...statusBarStocks];
          const newStockId = res.description;
          const index = newCfg.indexOf(stockId);
          if (statusBarStocks.includes(newStockId)) {
            window.showWarningMessage(`「${res.label}」已在状态栏`);
            return;
          }
          if (index > -1) {
            newCfg[newCfg.indexOf(stockId)] = res.description;
          }
          LeekFundConfig.updateStatusBarStockCfg(newCfg, () => {
            const handler = window.setStatusBarMessage(`下次数据刷新见效`);
            setTimeout(() => {
              handler.dispose();
            }, 1500);
          });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.immersiveBackground', (isChecked: boolean) => {
      LeekFundConfig.setConfig('leek-fund.immersiveBackground', isChecked);
      globalState.immersiveBackground = isChecked;
    })
  );

  checkForUpdate();
}
