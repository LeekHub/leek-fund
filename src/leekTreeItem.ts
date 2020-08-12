import { TreeItem, ExtensionContext, TreeItemCollapsibleState } from 'vscode';
import { join } from 'path';

export enum SortType {
  NORMAL = 0,
  ASC = 1,
  DESC = -1,
}

export interface FundInfo {
  percent: any;
  name: string;
  code: string;
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
      isStock,
      name,
      code,
      type,
      symbol,
      price,
      percent,
      open,
      yestclose,
      high,
      low,
      updown,
      volume,
      amount,
    } = info;
    const grow = percent.indexOf('-') === 0 ? false : true;
    this.iconPath = context.asAbsolutePath(
      join('resources', `${grow ? 'up-arrow' : 'down-arrow'}.svg`)
    );

    const text = isStock
      ? `${percent}%   ${price}    「${name}」${type}${symbol}`
      : `${percent}%   「${name}」(${code})`;

    this.label = text;
    this.id = code;
    this.command = {
      title: name, // 标题
      command: isStock ? 'leetfund.stockItemClick' : 'leetfund.fundItemClick', // 命令 ID
      arguments: [
        isStock ? '0' + symbol : code, // 基金/股票编码
        name, // 基金/股票名称
        text,
        `${type}${symbol}`,
      ],
    };

    if (isStock) {
      this.tooltip = `【今日行情】${type}${symbol}\n 涨跌：${updown}   百分比：${percent}%\n 最高：${high}   最低：${low}\n 今开：${open}   昨收：${yestclose}\n 成交量：${volume}   成交额：${amount}`;
    } else {
      this.tooltip = '点击查看详情';
    }
  }
}
