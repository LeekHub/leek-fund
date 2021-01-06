// 支持的股票类型
export const STOCK_TYPE = ['sh', 'sz', 'hk', 'gb', 'us'];

export enum SortType {
  NORMAL = 0, // 基金默认顺序
  ASC = 1, // 涨跌升序
  DESC = -1, // 涨跌降序
  AMOUNTASC = 2, // 持仓金额升序
  AMOUNTDESC = -2, // 持仓金额降序
}

export enum IconType {
  ARROW = 'arrow',
  FOOD1 = 'food1',
  FOOD2 = 'food2',
  FOOD3 = 'food3',
  ICON_FOOD = 'iconfood',
}

/** Tree Item Type */
export enum TreeItemType {
  /** 基金 */
  FUND = 'fund',
  /** 股票 */
  STOCK = 'stock',
  /** 币安 */
  BINANCE = 'binance',
}

export interface IAmount {
  name: string;
  price: number | string;
  amount: number;
  priceDate: string;
  earnings: number;
  unitPrice: number;
  earningPercent: number;
  yestEarnings?: number;
}

export interface FundInfo {
  percent: any;
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
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string | number; // 成交额
  earnings?: number; // 盈亏
  earningPercent?: number; // 盈亏率
  isStop?: boolean; // 停牌
  t2?: boolean;
  isUpdated?: boolean;
  showEarnings?: boolean;
  isStock?: boolean;
  _itemType?: TreeItemType;
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
  NODATA = 'Not Support Stock',
}
