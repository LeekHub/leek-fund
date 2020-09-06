const deviceId = Math.random().toString(16).substr(2) + Math.random().toString(32).substr(2);

let iconType = 'arrow';

let fundAmount = {}; // 缓存数据
let showEarnings = 1; // 是否展示盈亏
let newsIntervalTime = 20000; // 新闻刷新频率（毫秒）
let newsIntervalTimer: NodeJS.Timer | any = null; // 计算器控制

export default {
  iconType,
  deviceId,
  fundAmount,
  showEarnings,
  newsIntervalTime,
  newsIntervalTimer,
};
