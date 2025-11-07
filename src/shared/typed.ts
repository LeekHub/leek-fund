// 支持的股票类型
export const STOCK_TYPE = ['sh', 'sz', 'bj', 'hk', 'gb', 'us'];

export enum SortType {
  NORMAL = 0, // 基金默认顺序
  ASC = 1, // 涨跌升序
  DESC = -1, // 涨跌降序
  AMOUNTASC = 2, // 持仓金额升序
  AMOUNTDESC = -2, // 持仓金额降序
}

export enum IconType {
  ARROW = 'arrow',
  ARROW1 = 'arrow1',
  FOOD1 = 'food1',
  FOOD2 = 'food2',
  FOOD3 = 'food3',
  ICON_FOOD = 'iconfood',
  NONE = 'none',
}

/** Tree Item Type */
export enum TreeItemType {
  /** 基金 */
  FUND = 'fund',
  /** 股票 */
  STOCK = 'stock',
  /** 币安 */
  BINANCE = 'binance',
  /** 外汇 */
  FOREX = 'forex',
}
export interface IAmount {
  name: string;
  price: number | string;
  amount: number;
  shares?: number; // 持仓份额，新增字段
  priceDate: string;
  earnings: number;
  unitPrice: number;
  earningPercent: number;
  yestEarnings?: number;
}

export interface FundInfo {
  percent: any;
  yestpercent?: string; // 净值涨跌幅度
  name: string;
  code: string;
  showLabel?: boolean;
  id?: string;
  contextValue?: string;
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
  unitPrice?: number; // 成本价格
  priceDate?: string; // 价格日期
  yestPriceDate?: string; // 最新净值更新日期
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string | number; // 成交额
  earnings?: number; // 盈亏
  earningPercent?: number; // 盈亏率
  afterPrice?: string; // 盘后价格
  afterPercent?: string; // 盘后涨跌幅
  isStop?: boolean; // 停牌
  t2?: boolean;
  isUpdated?: boolean;
  showEarnings?: boolean;
  isStock?: boolean;
  _itemType?: TreeItemType;
  spotBuyPrice?: number; // 现汇买入价
  cashBuyPrice?: number; // 现钞买入价
  spotSellPrice?: number; // 现汇卖出价
  cashSellPrice?: number; // 现钞卖出价
  conversionPrice?: number; // 中行折算价
  publishDateTime?: string; // 发布日期：年月日 时分秒
  publishTime?: string; // 发布时间：时分秒
  heldAmount?: number; // 持仓数
  heldPrice?: number; // 持仓价
  todayHeldPrice?: number; // 当日持仓价
  isSellOut?: boolean; // 是否清仓
}

export const defaultFundInfo: FundInfo = {
  id: '',
  name: '',
  percent: '',
  code: '',
  showLabel: true,
};

export enum StockCategory {
  A = 'A Stock',
  US = 'US Stock',
  HK = 'HK Stock',
  Future = 'CN Future',
  OverseaFuture = 'Oversea Future',
  NODATA = 'Not Support Stock',
}

export interface ProfitStatusBarInfo {
  fundProfit: number;
  fundProfitPercent: number;
  fundAmount: number;
  priceDate: string;
}

export type HeldData = {
  heldAmount?: number;
  heldPrice?: number;
  todayHeldPrice?: number;
  isSellOut?: boolean;
};

export type ForexData = {
  name: string;
  filter: ((code: string) => boolean) | RegExp;
  spotBuyPrice?: number; // 现汇买入价
  cashBuyPrice?: number; // 现钞买入价
  spotSellPrice?: number; // 现汇卖出价
  cashSellPrice?: number; // 现钞卖出价
  conversionPrice?: number; // 中行折算价
  publishDateTime?: string; // 发布日期：年月日 时分秒
  publishTime?: string; // 发布时间：时分秒
};
