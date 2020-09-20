// 支持的股票类型
export const STOCK_TYPE = ['sh', 'sz', 'hk', 'gb', 'us'];

export enum SortType {
  NORMAL = 0,
  ASC = 1,
  DESC = -1,
}

export enum IconType {
  ARROW = 'arrow',
  FOOD1 = 'food1',
  FOOD2 = 'food2',
  FOOD3 = 'food3',
  ICON_FOOD = 'iconfood',
}

export interface IAmount {
  name: string;
  price: number | string;
  amount: number;
  priceDate: string;
  earnings: number;
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
  price?: string; // 当前价格
  volume?: string; // 成交量
  amount?: string | number; // 成交额
  earnings?: number;
  isStop?: boolean; // 停牌
  t2?: boolean;
  isUpdated?: boolean;
  showEarnings?: boolean;
  isStock?: boolean;
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
  Other = 'Other Stock',
}
