import { commands, ExtensionContext, window, Uri, workspace } from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { showAiAnalysisPanel } from './utils/aiAnalysisPanel';

/**
 * 获取设置文件的默认路径
 * 优先选择当前工作区目录，如果没有工作区则选择下载目录
 */
function getDefaultSettingsPath(filename: string = 'leek-fund.settings.json'): string {
  const workspaceFolders = workspace.workspaceFolders;

  if (workspaceFolders && workspaceFolders.length > 0) {
    // 使用当前工作区目录
    return path.join(workspaceFolders[0].uri.fsPath, filename);
  } else {
    // 使用下载目录作为备选
    return path.join(os.homedir(), 'Downloads', filename);
  }
}
import fundSuggestList from './data/fundSuggestData';
import { BinanceProvider } from './explorer/binanceProvider';
import BinanceService from './explorer/binanceService';
import { ForexProvider } from './explorer/forexProvider';
import { FundProvider } from './explorer/fundProvider';
import FundService from './explorer/fundService';
import { NewsProvider } from './explorer/newsProvider';
import { NewsService } from './explorer/newsService';
import { StockProvider } from './explorer/stockProvider';
import StockService from './explorer/stockService';
import globalState from './globalState';
import FlashNewsOutputServer from './output/flash-news/FlashNewsOutputServer';
import { LeekFundConfig } from './shared/leekConfig';
import { LeekTreeItem } from './shared/leekTreeItem';
// import checkForUpdate from './shared/update';
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
import setStockPrice from './webview/setStockPrice';

import stockTrend from './webview/stockTrend';
import stockTrendPic from './webview/stockTrendPic';
import stockWindVane from './webview/stockWindVane';
import tucaoForum from './webview/tucaoForum';
import { StatusBar } from './statusbar/statusBar';
import binanceTrend from './webview/binanceTrend';
import { AiConfigView } from './webview/ai-config';

export function registerViewEvent(
  context: ExtensionContext,
  fundService: FundService,
  stockService: StockService,
  fundProvider: FundProvider,
  stockProvider: StockProvider,
  newsProvider: NewsProvider,
  flashNewsOutputServer: FlashNewsOutputServer,
  binanceProvider: BinanceProvider,
  forexProvider: ForexProvider
) {
  const newsService = new NewsService();
  const binanceService = new BinanceService(context);

  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleFlashNews', () => {
      const isEnable = LeekFundConfig.getConfig('leek-fund.flash-news');
      LeekFundConfig.setConfig('leek-fund.flash-news', !isEnable).then(() => {
        window.showInformationMessage(`已${isEnable ? '关闭' : '启用'} OUTPUT 的 Flash News！`);
      });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.refreshFollow', () => {
      newsProvider.refresh();
      window.showInformationMessage(`刷新成功`);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.flash-news-show', () => {
      flashNewsOutputServer.showOutput();
    })
  );

  // Fund operation
  context.subscriptions.push(
    commands.registerCommand('leek-fund.refreshFund', () => {
      globalState.fundGroups = LeekFundConfig.getConfig('leek-fund.fundGroups', []);
      globalState.fundLists = LeekFundConfig.getConfig('leek-fund.funds', []);
      fundProvider.refresh();
      const handler = window.setStatusBarMessage(`基金数据已刷新`);
      setTimeout(() => {
        handler.dispose();
      }, 1000);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.deleteFund', (target) => {
      LeekFundConfig.removeFundCfg(target.id, () => {
        fundService.fundList = [];
        fundProvider.refresh();
      });
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.addFund', (target) => {
      /* if (!service.fundSuggestList.length) {
        service.getFundSuggestList();
        window.showInformationMessage(`获取基金数据中，请稍后再试`);
        return;
      } */

      window.showQuickPick(fundSuggestList, { placeHolder: '请输入基金代码' }).then((code) => {
        if (!code) {
          return;
        }
        LeekFundConfig.addFundCfg(target.id, code.split('|')[0], () => {
          fundProvider.refresh();
        });
      });
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.addFundGroup', () => {
      window.showInputBox({ placeHolder: '请输入基金分组名称' }).then((name) => {
        if (!name) {
          return;
        }
        LeekFundConfig.addFundGroupCfg(name, () => {
          fundProvider.refresh();
        });
      });
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.removeFundGroup', (target) => {
      LeekFundConfig.removeFundGroupCfg(target.id, () => {
        fundService.fundList = [];
        fundProvider.refresh();
      });
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.renameFundGroup', (target) => {
      window.showInputBox({ placeHolder: '请输入基金分组名称' }).then((name) => {
        if (!name) {
          return;
        }
        LeekFundConfig.renameFundGroupCfg(target.id, name, () => {
          fundProvider.refresh();
        });
      });
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.sortFund', () => {
      fundProvider.changeOrder();
      fundProvider.refresh();
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.sortAmountFund', () => {
      fundProvider.changeAmountOrder();
      fundProvider.refresh();
    })
  );

  // Stock operation
  context.subscriptions.push(
    commands.registerCommand('leek-fund.refreshStock', () => {
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
    let timer: NodeJS.Timeout | null = null;
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
      leekCenterView(stockService, fundService);
    })
  );
  context.subscriptions.push(
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
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.sortStock', () => {
      stockProvider.changeOrder();
      stockProvider.refresh();
    })
  );

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
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewFundHistory', (item) => fundHistory(item))
  );
  // 基金持仓
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewFundPosition', (item) => fundPosition(item))
  );
  // 基金排行
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewFundRank', () => fundRank())
  );
  // 基金走势图
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewFundTrend', () => allFundTrend(fundService))
  );
  // 资金流向
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewFundFlow', () => fundFlow())
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewMainFundFlow', () => mainFundFlow())
  );
  // 基金置顶
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setFundTop', (target) => {
      LeekFundConfig.setFundTopCfg(target.id, () => {
        fundProvider.refresh();
      });
    })
  );
  // 股票置顶
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockTop', (target) => {
      LeekFundConfig.setStockTopCfg(target.id, () => {
        fundProvider.refresh();
      });
    })
  );
  // 股票上移
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockUp', (target) => {
      LeekFundConfig.setStockUpCfg(target.id, () => {
        fundProvider.refresh();
      });
    })
  );
  // 股票下移
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockDown', (target) => {
      LeekFundConfig.setStockDownCfg(target.id, () => {
        fundProvider.refresh();
      });
    })
  );
  // AI分析股票
  context.subscriptions.push(
    commands.registerCommand('leek-fund.aiStockAnalysis', async (target) => {
      const { XuanGuBaoNewsView } = require('./webview/xuangubao-news');
      const xuanGuBaoNewsView = XuanGuBaoNewsView.getInstance();
      const result = await xuanGuBaoNewsView.send_ai_stock_analysis(target);
      if (result !== '') {
        // 控制台输出 - 限制长度避免控制台截断
        const consoleResult = result.length > 2000 ? result.substring(0, 2000) + '...（内容过长，完整结果请查看OUTPUT面板或Webview）' : result;
        console.log('AI 分析结果 -', target?.info?.name, ' 股票代码：', target?.info?.code, '\n', consoleResult);

        // 输出到 OUTPUT 面板
        const channel = window.createOutputChannel('LeekFund AI 分析');
        channel.appendLine(`==== AI 分析（${target.info.name} | ${target.info.code}）====`);
        channel.appendLine(result);
        channel.appendLine('');
        channel.show(true);

        // 使用 Webview 面板展示，限制可视高度并可滚动
        showAiAnalysisPanel(context, target.info.name, result);
      }
    })
  );

  // 设置基金持仓金额
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setFundAmount', () => {
      if (fundService.fundList.length === 0) {
        window.showWarningMessage('数据刷新中，请重试！');
        return;
      }
      setAmount(fundService);
    })
  );
  // 设置股票成本价
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setStockPrice', () => {
      if (stockService.stockList.length === 0) {
        window.showWarningMessage('数据刷新中，请重试！');
        return;
      }
      setStockPrice(stockService);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.stockTrendPic', (target) => {
      const { code, name, type, symbol } = target.info;
      stockTrendPic(code, name, `${type}${symbol}`);
    })
  );

  /**
   * News command
   */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.newItemClick', (userName, userId) => {
      openNews(newsService, userId, userName);
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.viewUserTimeline', (target) => {
      const userName = target.label;
      const userId = target.id;
      openNews(newsService, userId, userName, true);
    })
  );

  context.subscriptions.push(
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
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.deleteUser', (target) => {
      const newsUserIds = LeekFundConfig.getConfig('leek-fund.newsUserIds') || [];
      const newIds = newsUserIds.filter((id: string) => id !== target.id);
      LeekFundConfig.setConfig('leek-fund.newsUserIds', newIds).then(() => {
        newsProvider.refresh();
      });
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.setXueqiuCookie', () => {
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
          LeekFundConfig.setConfig('leek-fund.xueqiuCookie', cookie).then(() => {
            newsProvider.refresh();
          });
        });
    })
  );

  /**
   * Binance command
   */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.refreshBinance', () => {
      binanceProvider?.refresh();
    })
  );

  /* 添加交易对 */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.addBinancePair', async () => {
      const pairsList = await binanceService.getParis();
      window.showQuickPick(pairsList, { placeHolder: '请输入交易对' }).then((pair) => {
        if (!pair) return;
        LeekFundConfig.updateBinanceCfg(pair, () => binanceProvider?.refresh());
      });
    })
  );

  /* 删除交易对 */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.deletePair', (target) => {
      LeekFundConfig.removeBinanceCfg(target.id, () => {
        binanceProvider?.refresh();
      });
    })
  );

  /* 交易对置顶 */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setPairTop', (target) => {
      LeekFundConfig.setBinanceTopCfg(target.id, () => {
        binanceProvider?.refresh();
      });
    })
  );

  /* 排序 */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.binanceSort', () => {
      binanceProvider.changeOrder();
    })
  );

  /* 点击交易对 */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.binanceItemClick', (code, name) => binanceTrend(name))
  );

  /**
   * Forex command
   */
  context.subscriptions.push(
    commands.registerCommand('leek-fund.refreshForex', () => {
      forexProvider.refresh();
    })
  );

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
          placeHolder: '输入过滤选择，支持多选（限6个）',
          canPickMany: true,
        })
        .then((res) => {
          if (!res) {
            res = [];
          }
          let codes = res.map((item) => item.description);
          if (codes.length > 6) {
            codes = codes.slice(0, 6);
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
            { label: '📌 状态栏股票设置', description: 'statusbar-stock' },
            {
              label: `🟦 状态栏显示或隐藏 ${
                process.platform === 'darwin' ? '(Cmd+Opt+T)' : '(Ctrl+Alt+T)'
              }`,
              description: 'toggle-status-bar',
            },
            { label: '🟩 基金状态栏显示或隐藏', description: 'toggle-fund-bar' },
            { label: '🟥 股票状态栏显示或隐藏', description: 'toggle-stock-bar' },
            {
              label: '🧩 状态栏图标显示或隐藏',
              description: 'toggle-status-bar-icon',
            },
            { label: '📈 状态栏股票涨时文字颜色', description: 'statusbar-rise' },
            { label: '📉 状态栏股票跌时文字颜色', description: 'statusbar-fall' },
            { label: '🍖 涨跌图标更换', description: 'icontype' },
            { label: '👀 显示/隐藏文本', description: 'hideText' },
            {
              label: globalState.showEarnings ? '隐藏盈亏' : '💰 显示盈亏',
              description: 'earnings',
            },
            {
              label: globalState.remindSwitch ? '⏱️ 关闭提醒' : '⏰ 打开提醒',
              description: 'remindSwitch',
            },
            {
              label: globalState.kLineChartSwitch ? '🔛 切换为常规k线图' : '📴 切换为筹码分布K线图',
              description: 'kLineChartSwitch',
            },
            {
              label: globalState.stockHeldTipShow ? '关闭持仓高亮' : '开启持仓高亮',
              description: 'stockHeldTipShow',
            },
            {
              label: '📤 导出设置',
              description: 'exportSettings',
            },
            {
              label: '📥 导入设置',
              description: 'importSettings',
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
          } else if (type === 'toggle-status-bar') {
            commands.executeCommand('leek-fund.toggleStatusBarVisibility');
          } else if (type === 'toggle-fund-bar') {
            commands.executeCommand('leek-fund.toggleFundBarVisibility');
          } else if (type === 'toggle-stock-bar') {
            commands.executeCommand('leek-fund.toggleStockBarVisibility');
          } else if (type === 'toggle-status-bar-icon') {
            commands.executeCommand('leek-fund.toggleStatusBarIconVisibility');
          } else if (type === 'icontype') {
            // 基金&股票涨跌图标
            window
              .showQuickPick(
                [
                  {
                    label: '箭头图标（红涨绿跌）',
                    description: 'arrow',
                  },
                  {
                    label: '箭头图标（绿涨红跌）',
                    description: 'arrow1',
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
                  {
                    label: '无图标',
                    description: 'none',
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
          } else if (type === 'kLineChartSwitch') {
            commands.executeCommand('leek-fund.toggleKLineChartSwitch');
          } else if (type === 'stockHeldTipShow') {
            commands.executeCommand('leek-fund.toggleStockHeldTipShow');
          } else if (type === 'exportSettings') {
            commands.executeCommand('leek-fund.exportSettings');
          } else if (type === 'importSettings') {
            commands.executeCommand('leek-fund.importSettings');
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

  // 选股风向标
  context.subscriptions.push(
    commands.registerCommand('leek-fund.stockWindVane', () => stockWindVane())
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleRemindSwitch', (on?: number) => {
      const newValue = on !== undefined ? (on ? 1 : 0) : globalState.remindSwitch === 1 ? 0 : 1;
      LeekFundConfig.setConfig('leek-fund.stockRemindSwitch', newValue);
      globalState.remindSwitch = newValue;
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleKLineChartSwitch', (on?: number) => {
      const newValue = on !== undefined ? (on ? 1 : 0) : globalState.kLineChartSwitch === 1 ? 0 : 1;
      LeekFundConfig.setConfig('leek-fund.stockKLineChartSwitch', newValue);
      globalState.kLineChartSwitch = newValue;
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleStockHeldTipShow', () => {
      const newValue = !globalState.stockHeldTipShow;
      LeekFundConfig.setConfig('leek-fund.stockHeldTipShow', newValue);
      globalState.stockHeldTipShow = newValue;
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
      stockNameList.unshift({
        label: `删除`,
        description: `-1`,
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
          if (newStockId === '-1') {
            if (index > -1) {
              newCfg.splice(index, 1);
            }
          } else {
            if (statusBarStocks.includes(newStockId)) {
              window.showWarningMessage(`「${res.label}」已在状态栏`);
              return;
            }
            if (index > -1) {
              newCfg[index] = res.description;
            }
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

  // Settings Import/Export Commands
  context.subscriptions.push(
    commands.registerCommand('leek-fund.exportSettings', async () => {
      try {
        const workspaceConfig = workspace.getConfiguration();
        const allSettings: any = {};

        // Get all leek-fund settings dynamically from extension context
        const extensionManifest = globalState.context.extension.packageJSON;
        const configurationProperties =
          extensionManifest.contributes?.configuration?.properties || {};

        // Filter to only leek-fund configuration keys
        const leekFundConfigKeys = Object.keys(configurationProperties).filter((key) =>
          key.startsWith('leek-fund.')
        );

        // Get all leek-fund settings that have actual values
        leekFundConfigKeys.forEach((key) => {
          const value = workspaceConfig.get(key);
          if (value !== undefined) {
            allSettings[key] = value;
          }
        });

        // Additional inspection method as fallback to catch any dynamically created settings
        const leekFundInspection = workspaceConfig.inspect('leek-fund');
        const inspectionSources = [
          leekFundInspection?.globalValue,
          leekFundInspection?.workspaceValue,
          leekFundInspection?.workspaceFolderValue,
        ];

        inspectionSources.forEach((source) => {
          if (source && typeof source === 'object') {
            Object.keys(source).forEach((key) => {
              const fullKey = `leek-fund.${key}`;
              if (!allSettings[fullKey]) {
                const value = workspaceConfig.get(fullKey);
                if (value !== undefined) {
                  allSettings[fullKey] = value;
                }
              }
            });
          }
        });

        if (Object.keys(allSettings).length === 0) {
          window.showInformationMessage('没有找到任何以 "leek-fund." 开头的设置');
          return;
        }

        // Show save dialog
        const uri = await window.showSaveDialog({
          defaultUri: Uri.file(getDefaultSettingsPath()),
          filters: {
            'JSON files': ['json'],
            'All files': ['*'],
          },
        });

        if (uri) {
          const settingsJson = JSON.stringify(allSettings, null, 2);
          await workspace.fs.writeFile(uri, Buffer.from(settingsJson));
          window.showInformationMessage(`设置已导出到: ${uri.fsPath}`);
        }
      } catch (error) {
        window.showErrorMessage(`导出设置失败: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('leek-fund.importSettings', async () => {
      try {
        // Show open dialog
        const uris = await window.showOpenDialog({
          defaultUri: Uri.file(getDefaultSettingsPath()),
          canSelectFiles: true,
          canSelectFolders: false,
          canSelectMany: false,
          filters: {
            'JSON files': ['json'],
            'All files': ['*'],
          },
        });

        if (!uris || uris.length === 0) {
          return;
        }

        const uri = uris[0];
        const content = await workspace.fs.readFile(uri);
        const settingsText = Buffer.from(content).toString('utf8');

        let importedSettings: any;
        try {
          importedSettings = JSON.parse(settingsText);
        } catch (parseError) {
          window.showErrorMessage('无法解析 JSON 文件，请检查文件格式');
          return;
        }

        // Filter settings that start with 'leek-fund.'
        const leekFundSettings: any = {};
        Object.keys(importedSettings).forEach((key) => {
          if (key.startsWith('leek-fund.')) {
            leekFundSettings[key] = importedSettings[key];
          }
        });

        if (Object.keys(leekFundSettings).length === 0) {
          window.showInformationMessage('文件中没有找到任何以 "leek-fund." 开头的设置');
          return;
        }

        // Confirm import
        const result = await window.showInformationMessage(
          `将导入 ${Object.keys(leekFundSettings).length} 个设置项，这将覆盖现有的设置。是否继续？`,
          '确认导入',
          '取消'
        );

        if (result !== '确认导入') {
          return;
        }

        // Import settings
        const workspaceConfig = workspace.getConfiguration();
        let successCount = 0;
        let failCount = 0;

        for (const [key, value] of Object.entries(leekFundSettings)) {
          try {
            await workspaceConfig.update(key, value, true);
            successCount++;
          } catch (error) {
            console.error(`Failed to import setting ${key}:`, error);
            failCount++;
          }
        }

        if (successCount > 0) {
          window.showInformationMessage(
            `设置导入完成：成功 ${successCount} 项${failCount > 0 ? `，失败 ${failCount} 项` : ''}`
          );

          // Refresh the extension state
          commands.executeCommand('leek-fund.refreshFund');
          commands.executeCommand('leek-fund.refreshStock');
        } else {
          window.showErrorMessage('导入设置失败');
        }
      } catch (error) {
        window.showErrorMessage(`导入设置失败: ${error}`);
      }
    })
  );


  // 选股宝快讯命令
  context.subscriptions.push(
    commands.registerCommand('leek-fund.xuangubaoNews', () => {
      const { XuanGuBaoNewsView } = require('./webview/xuangubao-news');
      XuanGuBaoNewsView.getInstance().show();
    })
  );
  // 设置 A股 AI 分析历史长度
  context.subscriptions.push(
    commands.registerCommand('leek-fund.setAiStockHistoryRange', async () => {
      const QuickPickItems = [
        { label: '1年', description: '1y', picked: false },
        { label: '6个月', description: '6m', picked: false },
        { label: '3个月', description: '3m', picked: false },
        { label: '1个月', description: '1m', picked: false },
        { label: '1周', description: '1w', picked: false },
      ];
      const current = LeekFundConfig.getConfig('leek-fund.aiStockHistoryRange', '3m');
      QuickPickItems.forEach(it => it.picked = it.description === current);
      const sel = await window.showQuickPick(QuickPickItems, { placeHolder: '选择A股AI分析历史长度' });
      if (sel && sel.description) {
        await LeekFundConfig.setConfig('leek-fund.aiStockHistoryRange', sel.description);
        window.showInformationMessage(`已设置A股AI分析近${sel.label}复权日线数据`);
      }
    })
  );
  // AI 配置管理
  context.subscriptions.push(
    commands.registerCommand('leek-fund.openAiConfig', () => {
      AiConfigView.getInstance().show();
    })
  );
  // checkForUpdate();
}

export function registerCommandPaletteEvent(context: ExtensionContext, statusbar: StatusBar) {
  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleStatusBarIconVisibility', () => {
      statusbar.toggleStatusBarIconVisibility();
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleStatusBarVisibility', () => {
      statusbar.toggleVisibility();
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleFundBarVisibility', () => {
      statusbar.toggleFundBarVisibility();
    })
  );
  context.subscriptions.push(
    commands.registerCommand('leek-fund.toggleStockBarVisibility', () => {
      statusbar.toggleStockBarVisibility();
    })
  );
}
