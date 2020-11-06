import { join } from 'path';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';
import globalState from '../globalState';
import { FundInfo, IconType } from './typed';
import { formatTreeText } from './utils';

export class LeekTreeItem extends TreeItem {
  info: FundInfo;
  type: string | undefined;
  isCategory: boolean;
  contextValue: string | undefined;
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
      earningPercent,
      time,
      isStop,
      t2,
      contextValue,
    } = info;
    this.type = type;
    this.contextValue = contextValue;
    let _percent: number | string = Math.abs(percent);
    if (isNaN(_percent)) {
      _percent = '--';
    } else {
      _percent = _percent.toFixed(2);
    }
    let icon = 'up';
    const grow = percent.indexOf('-') === 0 ? false : true;
    const val = Math.abs(percent);
    if (grow) {
      if (IconType.ARROW === globalState.iconType) {
        icon = val >= 2 ? 'up' : 'up1';
      } else if (IconType.FOOD1 === globalState.iconType) {
        icon = 'meat2';
      } else if (IconType.FOOD2 === globalState.iconType) {
        icon = 'kabob';
      } else if (IconType.FOOD3 === globalState.iconType) {
        icon = 'wine';
      } else if (IconType.ICON_FOOD === globalState.iconType) {
        icon = '🍗';
      }
      _percent = '+' + _percent;
    } else {
      if (IconType.ARROW === globalState.iconType) {
        icon = val >= 2 ? 'down' : 'down1';
      } else if (IconType.FOOD1 === globalState.iconType) {
        icon = 'noodles';
      } else if (IconType.FOOD2 === globalState.iconType) {
        icon = 'bakeleek';
      } else if (IconType.FOOD3 === globalState.iconType) {
        icon = 'noodles';
      } else if (IconType.ICON_FOOD === globalState.iconType) {
        icon = '🍜';
      }
      _percent = '-' + _percent;
    }
    if (isStop) {
      icon = 'stop';
    }
    let iconPath: string | undefined = '';
    if (showLabel) {
      iconPath =
        globalState.iconType !== IconType.ICON_FOOD
          ? context?.asAbsolutePath(join('resources', `${icon}.svg`))
          : icon;
    }
    const isIconPath = iconPath?.lastIndexOf('.svg') !== -1;
    if (isIconPath && type !== 'nodata') {
      this.iconPath = iconPath;
    }
    let text = '';
    if (showLabel) {
      if (isStock) {
        const risePercent = isStop
          ? formatTreeText('停牌', 11)
          : formatTreeText(`${_percent}%`, 11);
        if (type === 'nodata') {
          text = info.name;
        } else {
          text = `${!isIconPath ? iconPath : ''}${risePercent}${formatTreeText(
            price,
            15
          )}「${name}」`;
        }
      } else {
        text =
          `${!isIconPath ? iconPath : ''}${formatTreeText(`${_percent}%`)}「${name}」${
            t2 || !(globalState.showEarnings && amount > 0)
              ? ''
              : `(${grow ? '盈' : '亏'}：${grow ? '+' : ''}${earnings})`
          }` + `${t2 ? `(${time})` : ''}`;
        // ${earningPercent !== 0 ? '，率：' + earningPercent + '%' : ''}
      }
    } else {
      text = isStock
        ? `${formatTreeText(`${_percent}%`, 11)}${formatTreeText(price, 15)} 「${code}」`
        : `${formatTreeText(`${_percent}%`)}「${code}」`;
    }

    this.label = text;
    this.id = info.id || code;
    this.command = {
      title: name, // 标题
      command: isStock ? 'leek-fund.stockItemClick' : 'leek-fund.fundItemClick', // 命令 ID
      arguments: [
        isStock ? '0' + symbol : code, // 基金/股票编码
        name, // 基金/股票名称
        text,
        `${type}${symbol}`,
      ],
    };
    if (type === 'nodata') {
      this.command.command = '';
    }

    if (isStock) {
      if (type === 'nodata') {
        this.tooltip = '接口不支持，右键删除关注';
      } else {
        this.tooltip = `【今日行情】${
          !showLabel ? name : ''
        }${type}${symbol}\n 涨跌：${updown}   百分比：${_percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
      }
    } else {
      this.tooltip = `「${name}」(${code})`;
    }
  }
}
