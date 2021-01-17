interface FundData {
  baseData?: FundBaseData;
  PJDatas?: Record<string, string>[]; // 评级数据
  mncsdiag?: FundMNCSDiagData;
}

interface FundBaseData {
  latest1m: string;
  latest3m: string;
  latest6m: string;
  latest12m: string;
  latest36m: string;
  sinceToday: string; //成立以来
  positionStocks?: Record<string, string>; // 持仓股
  positionStocksDate?: string;
  fundType?: string;
  fundManager?: string;
  fundMoneySize?: string; // 规模
  setupDate?: string; // 成立日期
  sameKindOtherFund?: Record<string, string>[]; // 同类型基金
  jjpj: number; //基金综合评级
}

interface FundMNCSDiagData {
  DIAGONSEACH: {
    PROWIN: string; // 综合评分
    FGOLD: string; // 基金评分
  };

  PROFIT_Z: string; // 持有7天盈利概率
  PROFIT_3Y: string; // 持有3月盈利概率
  PROFIT_6Y: string; // 持有6月盈利概率
  PROFIT_1N: string; // 持有1年盈利概率
}
