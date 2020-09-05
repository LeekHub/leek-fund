import { join } from 'path';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import global from './global';
import { formatTreeText } from './utils';

export enum SortType {
  NORMAL = 0,
  ASC = 1,
  DESC = -1,
}

export enum IconType {
  ARROW = 'arrow',
  FOOD1 = 'food1',
  FOOD2 = 'food2',
  ICON_FOOD = 'iconfood',
}

// 支持的股票类型
export const STOCK_TYPE = ['sh', 'sz', 'hk', 'gb', 'us'];

export interface FundInfo {
  percent: any;
  name: string;
  code: string;
  showLabel?: boolean;
  symbol?: string;
  type?: string;
  yestclose?: string | number; // 昨日净值
  open?: string | number;
  highStop?: string | number;
  high?: string | number;
  lowStop?: string | number;
  low?: string | number;
  time?: string;
  updown?: string; // 涨跌值 price-yestclose
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string; // 成交额
  isStock?: boolean;
}

export class LeekTreeItem extends TreeItem {
  info: FundInfo;
  constructor(info: FundInfo, context: ExtensionContext) {
    super('', TreeItemCollapsibleState.None);
    this.info = info;
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
      amount,
    } = info;
    let _percent = Math.abs(percent).toFixed(2);

    let icon = 'up';
    const grow = percent.indexOf('-') === 0 ? false : true;
    const val = Math.abs(percent);
    if (grow) {
      if (IconType.ARROW === global.iconType) {
        icon = val >= 2 ? 'up' : 'up1';
      } else if (IconType.FOOD1 === global.iconType) {
        icon = 'meat2';
      } else if (IconType.FOOD2 === global.iconType) {
        icon = 'kabob';
      } else if (IconType.ICON_FOOD === global.iconType) {
        icon = '🍗';
      }
      _percent = '+' + _percent;
    } else {
      if (IconType.ARROW === global.iconType) {
        icon = val >= 2 ? 'down' : 'down1';
      } else if (IconType.FOOD1 === global.iconType) {
        icon = 'noodles';
      } else if (IconType.FOOD2 === global.iconType) {
        icon = 'bakeleek';
      } else if (IconType.ICON_FOOD === global.iconType) {
        icon = '🍜';
      }
      _percent = '-' + _percent;
    }
    let iconPath = '';
    if (showLabel) {
      iconPath =
        global.iconType !== IconType.ICON_FOOD
          ? context.asAbsolutePath(join('resources', `${icon}.svg`))
          : icon;
    }
    const isIconPath = iconPath.lastIndexOf('.svg') !== -1;
    if (isIconPath) {
      this.iconPath = iconPath;
    }
    let text = '';
    if (showLabel) {
      text = isStock
        ? `${!isIconPath ? iconPath : ''}${formatTreeText(`${_percent}%`, 11)}${formatTreeText(
            price,
            15
          )}「${name}」`
        : `${!isIconPath ? iconPath : ''}${formatTreeText(`${_percent}%`)}「${name}」(${code})`;
    } else {
      text = isStock
        ? `${formatTreeText(`${_percent}%`, 11)}${formatTreeText(price, 15)} 「${code}」`
        : `${formatTreeText(`${_percent}%`)}「${code}」`;
    }

    this.label = text;
    this.id = code;
    this.command = {
      title: name, // 标题
      command: isStock ? 'leet-fund.stockItemClick' : 'leet-fund.fundItemClick', // 命令 ID
      arguments: [
        isStock ? '0' + symbol : code, // 基金/股票编码
        name, // 基金/股票名称
        text,
        `${type}${symbol}`,
      ],
    };

    if (isStock) {
      this.tooltip = `【今日行情】${
        !showLabel ? name : ''
      }${type}${symbol}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
    } else {
      this.tooltip = `${!showLabel ? name : '点击查看详情'}`;
    }
  }
}
