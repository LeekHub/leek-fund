import { join } from 'path';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import globalState from '../globalState';
import { DEFAULT_LABEL_FORMAT } from './constant';
import { FundInfo, IconType, TreeItemType } from './typed';
import { formatLabelString, formatTreeText, toFixed } from './utils';

export class LeekTreeItem extends TreeItem {
  info: FundInfo;
  type: string | undefined;
  isCategory: boolean;
  contextValue: string | undefined;
  _itemType?: TreeItemType;

  constructor(info: FundInfo, context: ExtensionContext | undefined, isCategory = false) {
    super('', TreeItemCollapsibleState.None);
    this.info = info;
    this.isCategory = isCategory;
    const {
      showLabel,
      isStock,
      name,
      code,
      type,
      symbol,
      percent,
      price,
      open,
      yestclose,
      high,
      low,
      updown,
      volume,
      amount = 0,
      earnings,
      // priceDate,
      time,
      afterPrice,
      afterPercent,
      isStop,
      t2,
      contextValue,
      _itemType,
      spotBuyPrice = 0,
      spotSellPrice = 0,
      cashBuyPrice = 0,
      cashSellPrice = 0,
      conversionPrice = 0,
      publishDateTime = '',
      heldAmount = 0,
      heldPrice = 0,
    } = info;

    if (_itemType) {
      this._itemType = _itemType;
    } else {
      this._itemType = isStock ? TreeItemType.STOCK : TreeItemType.FUND;
    }

    if (contextValue === 'separator') {
      const separatorText = `──────── ${name} ────────`;
      this.type = type;
      this.contextValue = contextValue;
      this.label = separatorText;
      this.id = info.id || code;
      this.tooltip = name;
      return;
    }

    const isStockItem = this._itemType === TreeItemType.STOCK;
    const isFundItem = this._itemType === TreeItemType.FUND;
    const isBinanceItem = this._itemType === TreeItemType.BINANCE;
    const isForex = this._itemType === TreeItemType.FOREX;

    this.type = type;
    this.contextValue = contextValue;
    let _percent: number | string = Math.abs(percent);
    if (isNaN(_percent)) {
      _percent = '--';
    } else {
      _percent = _percent.toFixed(2);
    }
    let icon = 'up';
    const grow = percent?.indexOf('-') === 0 ? false : true;
    const val = Math.abs(percent);
    if (grow) {
      if (IconType.ARROW === globalState.iconType) {
        icon = val >= 2 ? 'up' : 'up1';
      } else if (IconType.ARROW1 === globalState.iconType) {
        icon = val >= 2 ? 'up2' : 'up3';
      } else if (IconType.FOOD1 === globalState.iconType) {
        icon = 'meat2';
      } else if (IconType.FOOD2 === globalState.iconType) {
        icon = 'kabob';
      } else if (IconType.FOOD3 === globalState.iconType) {
        icon = 'wine';
      } else if (IconType.ICON_FOOD === globalState.iconType) {
        icon = '🍗';
      } else if (IconType.NONE === globalState.iconType) {
        icon = '';
      }
      _percent = '+' + _percent;
    } else {
      if (IconType.ARROW === globalState.iconType) {
        icon = val >= 2 ? 'down' : 'down1';
      } else if (IconType.ARROW1 === globalState.iconType) {
        icon = val >= 2 ? 'down2' : 'down3';
      } else if (IconType.FOOD1 === globalState.iconType) {
        icon = 'noodles';
      } else if (IconType.FOOD2 === globalState.iconType) {
        icon = 'bakeleek';
      } else if (IconType.FOOD3 === globalState.iconType) {
        icon = 'noodles';
      } else if (IconType.ICON_FOOD === globalState.iconType) {
        icon = '🍜';
      } else if (IconType.NONE === globalState.iconType) {
        icon = '';
      }
      _percent = '-' + _percent;
    }
    if (isStop) {
      icon = 'stop';
    }
    let iconPath: string | undefined = '';
    if (showLabel) {
      iconPath =
        globalState.iconType !== IconType.ICON_FOOD && globalState.iconType !== IconType.NONE
          ? context?.asAbsolutePath(join('resources', `${icon}.svg`))
          : icon;
    }
    const isIconPath = iconPath?.lastIndexOf('.svg') !== -1;
    if (isIconPath && type !== 'nodata') {
      this.iconPath = iconPath;
    }
    let text = '';

    if (showLabel) {
      /* `showLabel: true` */
      if (isStockItem) {
        const risePercent = isStop ? '停牌' : `${_percent}%`;
        if (type === 'nodata') {
          text = info.name;
        } else {
          /* text = `${!isIconPath ? iconPath : ''}${risePercent}${formatTreeText(
            price,
            15
          )}「${name}」`; */
          text = formatLabelString(
            globalState.labelFormat?.['sidebarStockLabelFormat'] ??
              DEFAULT_LABEL_FORMAT.sidebarStockLabelFormat,
            {
              ...info,
              icon: !isIconPath ? iconPath : '',
              percent: risePercent,
            }
          );
        }
      } else if (isFundItem) {
        /* text =
          `${!isIconPath ? iconPath : ''}${formatTreeText(`${_percent}%`)}「${name}」${
            t2 || !(globalState.showEarnings && amount > 0)
              ? ''
              : `(${grow ? '盈' : '亏'}：${grow ? '+' : ''}${earnings})`
          }` + `${t2 ? `(${time})` : ''}`; */
        text = formatLabelString(
          globalState.labelFormat?.['sidebarFundLabelFormat'] ??
            DEFAULT_LABEL_FORMAT.sidebarFundLabelFormat,
          {
            ...info,
            icon: !isIconPath ? iconPath : '',
            percent: `${_percent}%`,
            earnings:
              t2 || !(globalState.showEarnings && Number(amount) > 0)
                ? ''
                : `(${grow ? '盈' : '亏'}：${grow ? '+' : ''}${earnings})`,
            time: t2 && time ? `(${time})` : '',
          }
        );
        // ${earningPercent !== 0 ? '，率：' + earningPercent + '%' : ''}
      } else if (isBinanceItem) {
        text = formatLabelString(
          globalState.labelFormat?.['sidebarBinanceLabelFormat'] ??
            DEFAULT_LABEL_FORMAT.sidebarBinanceLabelFormat,
          {
            ...info,
            icon: !isIconPath ? iconPath : '',
            percent: `${_percent}%`,
          }
        );
      } else if (isForex) {
        text = formatLabelString(
          globalState.labelFormat?.['sidebarForexLabelFormat'] ??
            DEFAULT_LABEL_FORMAT.sidebarForexLabelFormat,
          {
            ...info,
          }
        );
      }
    } else {
      /* `showLabel: false` */
      text = isStockItem
        ? `${formatTreeText(`${_percent}%`, 11)}${formatTreeText(price, 15)} 「${code}」`
        : `${formatTreeText(`${_percent}%`)}「${code}」`;
    }
    if (heldAmount && globalState.stockHeldTipShow) {
      this.label = {
        label: text,
        highlights: [[0, text.length]],
      };
      this.description = '（持仓）';
    } else {
      this.label = text;
    }
    this.id = info.id || code;
    if (isStockItem || isFundItem || isBinanceItem) {
      let typeAndSymbol = `${type}${symbol}`;
      const isFuture = /nf_/.test(code) || /hf_/.test(code);
      if (isFuture) {
        typeAndSymbol = code;
      }
      this.command = {
        title: name, // 标题
        command: isStockItem
          ? 'leek-fund.stockItemClick'
          : isBinanceItem
          ? 'leek-fund.binanceItemClick'
          : 'leek-fund.fundItemClick', // 命令 ID
        arguments: [
          isStockItem ? '0' + symbol : code, // 基金/股票编码
          name, // 基金/股票名称
          text,
          typeAndSymbol,
        ],
      };
      if (type === 'nodata') {
        this.command.command = '';
      }
    }

    if (isStockItem) {
      const labelText = !showLabel ? name : '';

      const isFuture = /nf_/.test(code) || /hf_/.test(code);

      // type字段：国内期货前缀 `nf_` 。股票的 type 是交易所 (sz,sh,bj)
      const typeText = type;
      const symbolText = isFuture ? name : symbol;

      if (type === 'nodata') {
        this.tooltip = '接口不支持，右键删除关注';
      } else if (isFuture) {
        this.tooltip = `【今日行情】${name} ${code}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨结：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
      } else {
        this.tooltip = `【今日行情】${labelText}${typeText}${symbolText}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}${
          afterPrice ? `\n 盘后：${afterPrice}   涨跌幅：${afterPercent}%` : ''
        }${
          heldAmount ? `\n 成本：${heldPrice}   持仓：${heldAmount}` : ''
        }\n 成交量：${volume}   成交额：${amount}`;
      }
    } else if (isBinanceItem) {
      this.tooltip = `【今日行情】${name}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
    } else if (isForex) {
      this.tooltip = `现汇买入价：${spotBuyPrice}\n现钞买入价：${cashBuyPrice}\n现汇卖出价：${spotSellPrice}\n现钞卖出价：${cashSellPrice}\n中行折算价：${conversionPrice}\n发布日期：${publishDateTime}`;
    } else {
      this.tooltip = `「${name}」(${code})`;
    }
  }
}
