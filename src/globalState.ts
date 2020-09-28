const deviceId = Math.random().toString(16).substr(2) + Math.random().toString(32).substr(2);

let iconType = 'arrow';

let fundAmount = {}; // 缓存数据
let showEarnings = 1; // 是否展示盈亏
let newsIntervalTime = 20000; // 新闻刷新频率（毫秒）
let newsIntervalTimer: NodeJS.Timer | any = null; // 计算器控制

let aStockCount = 0;
let usStockCount = 0;
let hkStockCount = 0;
let noDataStockCount = 0;
let isHolidayChina = false; // 初始化状态，默认是false，免得API有问题，就当它不是好了，可以继续运行

export default {
  iconType,
  deviceId,
  fundAmount,
  showEarnings,
  newsIntervalTime,
  newsIntervalTimer,
  aStockCount,
  usStockCount,
  hkStockCount,
  noDataStockCount,
  /**
   * 当天是否中国节假日（在插件启动时获取）
   */
  isHolidayChina,
};
