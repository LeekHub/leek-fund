/**
 * 默认模板格式
 */
export const DEFAULT_LABEL_FORMAT = {
  statusBarLabelFormat: '「${name}」${price} ${icon}（${percent}）',
  sidebarStockLabelFormat:
    '${icon|padRight|4}${percent|padRight|11}${price|padRight|15}「${name}」',
  sidebarFundLabelFormat: '${icon|padRight|4}${percent|padRight}「${name}」${earnings} ${time}',
};
