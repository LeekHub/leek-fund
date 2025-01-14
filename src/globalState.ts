import { ExtensionContext } from 'vscode';
import { DEFAULT_LABEL_FORMAT } from './shared/constant';
import { Telemetry } from './shared/telemetry';
import { ForexData } from './shared/typed';

const deviceId = Math.random().toString(16).substr(2) + Math.random().toString(32).substr(2);

let context: ExtensionContext = undefined as unknown as ExtensionContext;

let telemetry: Telemetry | any = null;

let iconType = 'arrow';

let fundAmount = {}; // 缓存数据
let fundAmountCacheDate = '2020-10-30'; // 标记缓存时间，解决 VScode 多天都没有关闭时，盈亏计算缓存问题
let stocksRemind: Record<string, any> = {};
let showEarnings = 1; // 是否展示盈亏
let remindSwitch = 1; // 是否打开提示
let kLineChartSwitch = 0; // k线图类型 1筹码分布K线图，0常规k线图
let newsIntervalTime = 20000; // 新闻刷新频率（毫秒）
let newsIntervalTimer: NodeJS.Timer | any = null; // 计算器控制
let labelFormat = DEFAULT_LABEL_FORMAT;

let stockHeldTipShow = true; // 是否开启股票持仓提示

let aStockCount = 0;
let usStockCount = 0;
let hkStockCount = 0;
let cnfStockCount = 0; // 期货数量
let hfStockCount = 0; // 海外期货数量
let noDataStockCount = 0;
let isHolidayChina = false; // 初始化状态，默认是false，免得API有问题，就当它不是好了，可以继续运行

let showStockErrorInfo = true; // 控制只显示一次错误弹窗（临时处理）
let immersiveBackground = true; // 基金图表是否沉浸式背景

let isDevelopment = false; // 是否开发环境

let fundGroups: Array<string> = [];
let fundLists: Array<Array<string>> = [];

let stockPrice = {}; // 缓存数据
let stockPriceCacheDate = '2020-10-30';

let forexList: Array<ForexData> = []; // 外汇信息
export default {
  context,
  telemetry,
  iconType,
  deviceId,
  fundAmount,
  fundAmountCacheDate,
  showEarnings,
  newsIntervalTime,
  newsIntervalTimer,
  aStockCount,
  usStockCount,
  hkStockCount,
  cnfStockCount, // 期货
  hfStockCount, // 海外期货
  noDataStockCount,
  /**
   * 当天是否中国节假日（在插件启动时获取）
   */
  isHolidayChina,
  stocksRemind,
  remindSwitch,
  kLineChartSwitch,
  labelFormat,
  showStockErrorInfo,
  immersiveBackground,
  isDevelopment,
  fundGroups,
  fundLists,

  stockPrice,
  stockPriceCacheDate,

  stockHeldTipShow,

  forexList
};
