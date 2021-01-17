interface XinHeResultRowValueType {
  title: string;
  value: string;
  key: string;
}

interface StockXinHeDataType {
  hotData?: StockXinHeHotDataType | undefined;
  niux?: StockXinHeNiuXDataType;
  concept?: { title: string; content: string }[];
}

interface StockXinHeHotDataType {
  hot?: string; //个股热度
  ylw?: string; //止盈止损(压力位)
  zcw?: string; //止盈止损(支撑位)
  zyw?: string; //止盈止损(止盈位)
  zsw?: string; //止盈止损(止损位)
  // 机构评级
  organizationReports?: XinHeResultRowValueType[][];
}

interface StockXinHeNiuXDataType {
  //牛叉诊股
  title: strig;
  content: string;
  long: string;
  mid: string;
  short: string;
  score: string;
}
