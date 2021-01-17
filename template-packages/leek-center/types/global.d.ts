declare function acquireVsCodeApi(): any;

declare type StockRemindType = Record<string, Record<'percent' | 'price', (string | number)[]>>;
