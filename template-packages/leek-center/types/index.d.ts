/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.less' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module '*hexin-v' {
  const getHexinToken: () => string;
}

declare interface FundMoreDataType {
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
}

type XinHeResultRowValueType = {
  title: string;
  value: string;
  key: string;
};
declare interface StockXinHeDataType {
  hot?: string; //个股热度
  ylw?: string; //止盈止损(压力位)
  zcw?: string; //止盈止损(支撑位)
  zyw?: string; //止盈止损(止盈位)
  zsw?: string; //止盈止损(止损位)
  // 机构评级
  organizationReports?: XinHeResultRowValueType[][];
  concept?: { title: string; content: string }[];
  niux?: {
    //牛叉诊股
    title: strig;
    content: string;
    long: string;
    mid: string;
    short: string;
    score: string;
  };
}
