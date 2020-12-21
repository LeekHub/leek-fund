import { commands, window } from 'vscode';
import globalState from '../globalState';
import { setStocksRemindCfgCb } from '../webview/leekCenterView';
import { LeekTreeItem } from './leekTreeItem';
import { FundInfo } from './typed';
import { multi1000 } from './utils';

export function executeStocksRemind(
  newStockList: Array<LeekTreeItem>,
  oldStockList: Array<LeekTreeItem>
) {
  if (!oldStockList.length || +globalState.remindSwitch === 0) {
    return;
  }
  const stocksRemind = globalState.stocksRemind;
  const remindCodes = Object.keys(stocksRemind);

  const oldStocksMap: Record<string, FundInfo> = {};
  oldStockList.forEach(({ info }) => {
    oldStocksMap[info.code] = info;
  });

  newStockList.forEach((stock) => {
    try {
      const { info } = stock;
      if (remindCodes.includes(info.code)) {
        const oldStockInfo = oldStocksMap[info.code];
        const currentPrice = multi1000(parseFloat(info.price || '0'));
        const currentPrecent = multi1000(parseFloat(info.percent || '0'));

        const oldPrice = multi1000(parseFloat(oldStockInfo.price || '0'));
        const oldPrecent = multi1000(parseFloat(oldStockInfo.percent || '0'));

        const priceRange = Math.abs(currentPrice - oldPrice);
        const precentRange = Math.abs(currentPrecent - oldPrecent);

        // 如果用 info.updown（当前-昨收） 有可能导致股价从高位回落也上涨触发提醒，或高位回落不下跌不提醒。
        // 所以改由 当前 - 上次
        const currentUpdown = currentPrice - oldPrice >= 0 ? 1 : -1;

        const remindConfig = stocksRemind[info.code];
        const remindPrices: string[] = remindConfig.price;
        const remindPercents: string[] = remindConfig.percent;

        remindPrices.forEach((remindPriceStr) => {
          const remindPrice = multi1000(parseFloat(remindPriceStr));
          if (remindPrice / 0 !== currentUpdown / 0) {
            return;
          }
          const marginPrice = Math.abs(currentPrice - Math.abs(remindPrice));

          /* fix: #136 */
          if (currentPrice === 0) return;

          if (priceRange > marginPrice) {
            console.log('价格提醒:', oldPrice, currentPrice, remindPrice);
            showRemindNotice(
              info,
              `股价提醒：「${info.name}」 ${currentUpdown > 0 ? '上涨' : '下跌'}至 ${info.price}`
            );
          }
        });

        remindPercents.forEach((remindPercentStr) => {
          const remindPercent = multi1000(parseFloat(remindPercentStr));
          if (remindPercent / 0 !== currentUpdown / 0) {
            return;
          }
          const marginPrecent = Math.abs(currentPrecent - remindPercent);

          /* fix: #136 */
          if (currentPrecent === 0) return;

          if (precentRange > marginPrecent) {
            showRemindNotice(
              info,
              `股价提醒：「${info.name}」 ${remindPercent >= 0 ? '上涨' : '下跌'}超 ${
                info.percent
              }%，现报：${info.price}`
            );
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  });
}

const _remindedCache: Record<string, boolean> = {};
function showRemindNotice(info: FundInfo, msg: string) {
  const { code } = info;
  if (_remindedCache[code]) {
    return;
  }
  // 避免波动反复频繁提醒，3分钟内不再提醒
  _remindedCache[code] = true;
  setTimeout(() => {
    _remindedCache[code] = false;
  }, 3000 * 60);
  //TODO 暂时关闭提醒?
  window.showWarningMessage(msg, '删除该股提醒', '关闭所有提醒').then((res) => {
    switch (res) {
      case '关闭所有提醒':
        commands.executeCommand('leek-fund.toggleRemindSwitch', 0);
        break;
      case '删除该股提醒':
        let newCfg = { ...globalState.stocksRemind };
        delete newCfg[code];
        setStocksRemindCfgCb(newCfg);
      default:
        break;
    }
  });
}
