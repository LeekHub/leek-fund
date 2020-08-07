const vscode = require('vscode');
const axios = require('axios');
const { randHeader, keepDecimal, calcFixedNumber } = require('./utils');
const { DataProvider } = require('./views/dataprovider');
const { registerViewEvent } = require('./views/register-event');
const {
  isStockTime,
  isShowTime,
  getUpdateInterval,
  getFundCodes,
  getStockCodes,
  getItemColor,
} = require('./config-util');

let statusBarItems = {};
let fundCodes = [];
let fundList = []; // 基金数据缓存
let fundMap = {}; // 名称和code对应的
let dataProvider = null;
let extContext = null; // vscode.ExtensionContext
let stockData = [];
let updateInterval = 10000;
let timer = null;
let showTimer = null;
let stockCodes = [];

function activate(context) {
  extContext = context;
  init();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(handleConfigChange)
  );
  registerViewEvent(context);
}
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;

function init() {
  initShowTimeChecker();
  if (isShowTime()) {
    fundCodes = getFundCodes();
    stockCodes = getStockCodes();
    getFundNameList(fundCodes);
    // 配置变化时，获取基金名称缓存
    // console.log('fundCodes=', fundCodes);
    updateInterval = getUpdateInterval();
    fetchSZData(); // 上证指数
    fetchAllFundData(); // 基金数据
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    timer = setInterval(() => {
      if (isStockTime()) {
        fetchSZData(); // 上证指数
        fetchAllFundData(); // 基金数据
      } else {
        console.log('闭市了，不再请求');
      }
    }, updateInterval);
  } else {
    hideAllStatusBar();
  }
}

function initShowTimeChecker() {
  showTimer && clearInterval(showTimer);
  showTimer = setInterval(() => {
    if (isShowTime()) {
      init();
    } else {
      timer && clearInterval(timer);
      hideAllStatusBar();
    }
  }, 1000 * 60 * 10);
}

function hideAllStatusBar() {
  Object.keys(statusBarItems).forEach((item) => {
    statusBarItems[item].hide();
    statusBarItems[item].dispose();
  });
}

function handleConfigChange() {
  timer && clearInterval(timer);
  showTimer && clearInterval(showTimer);
  const codes = getFundCodes();
  stockCodes = getStockCodes();
  Object.keys(statusBarItems).forEach((item) => {
    if (codes.indexOf(item) === -1) {
      statusBarItems[item].hide();
      statusBarItems[item].dispose();
      delete statusBarItems[item];
    }
  });
  init();
}

function getFundNameList(codes) {
  console.log('getFundNameList request');
  const promiseList = [];
  for (const code of codes) {
    const p = new Promise((resolve, reject) => {
      const url = `http://fundgz.1234567.com.cn/js/${code}.js`;
      // console.log(url);
      axios
        // @ts-ignore
        .get(url)
        .then((response) => {
          const data = response.data;
          const text = data.replace('jsonpgz(', '').replace(');', '');
          const fundName = JSON.parse(text).name;
          fundMap[code] = fundName;
          resolve({ name: fundName, code });
        })
        .catch(() => resolve({ name: '基金代码错误', code }));
    });
    promiseList.push(p);
  }
  Promise.all(promiseList)
    .then((res) => {
      // console.log(res.length);
      // console.log(fundMap);
    })
    .catch((err) => console.log(err));
}

function getFundUrlByCode(fundCode) {
  // 历史数据
  // const fundUrl = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundCode}&page=1&per=1`;
  const fundUrl = `http://fundgz.1234567.com.cn/js/${fundCode}.js?rt="${new Date().getTime()}`;
  return fundUrl;
}

function fetchFundData(url, code) {
  return new Promise((resolve, reject) => {
    axios
      // @ts-ignore
      .get(url, { headers: randHeader() })
      .then((rep) => {
        const data = JSON.parse(rep.data.slice(8, -2));
        // {"fundcode":"320007","name":"诺安混合成长","jzrq":"2020-07-31","dwjz":"1.9900","gsz":"2.0444","gszzl":"2.73","gztime":"2020-08-03 10:42"}
        const { gszzl, gztime, name } = data;
        resolve({ percent: gszzl + '%', code, time: gztime, name });
      })
      .catch(() => resolve({ percent: 'NaN', name: '基金代码错误', code }));
  });
}

function fetchAllFundData() {
  console.log('fetching fund data……');
  const promiseAll = [];
  for (const fundCode of fundCodes) {
    const url = getFundUrlByCode(fundCode);
    promiseAll.push(fetchFundData(url, fundCode));
  }
  Promise.all(promiseAll)
    .then((result) => {
      const data = result.sort((a, b) => (a.percent > b.percent ? -1 : 1));
      // console.log(data);
      fundList = data;
      renderFundView(fundList);
    })
    .catch((err) => {
      console.log(err);
    });
}

function fetchSZData() {
  console.log('fetching stock data…');
  const url = `https://api.money.126.net/data/feed/${stockCodes.join(
    ','
  )}?callback=a`;
  axios
    // @ts-ignore
    .get(url) // 上证指数
    .then(
      (rep) => {
        try {
          const result = JSON.parse(rep.data.slice(2, -2));
          let data = [];
          Object.keys(result).map((item) => {
            if (!result[item].code) {
              result[item].code = item; //兼容港股美股
            }
            data.push(result[item]);
          });
          stockData = data;
          displayData(data);
          renderStockView(data);
        } catch (err) {
          console.log(err);
        }
      },
      (error) => {
        console.error(error);
      }
    )
    .catch((error) => {
      console.error(error);
    });
}

function displayData(data) {
  // console.log(data);
  const item = data[0];
  const key = item.code;
  if (statusBarItems[key]) {
    statusBarItems[key].text = getItemText(item);
    statusBarItems[key].color = getItemColor(item);
    statusBarItems[key].tooltip = getTooltipText(item);
  } else {
    statusBarItems[key] = createStatusBarItem(item);
  }
  // 手动加基金item
  if (statusBarItems['fund']) {
    statusBarItems['fund'].text = ` 🐥「基金详情」`;
    statusBarItems['fund'].color = getItemColor({ percent: 1 }); // 随意写的 percent
    statusBarItems['fund'].tooltip = getFundTooltipText();
  } else {
    statusBarItems['fund'] = createFundStatusBarItem();
  }
}

function getItemText(item) {
  return `「${item.name}」${keepDecimal(item.price, calcFixedNumber(item))}  ${
    item.percent >= 0 ? '📈' : '📉'
  }（${keepDecimal(item.percent * 100, 2)}%）`;
}

function getTooltipText(item) {
  return `【今日行情】${item.type}${item.symbol}\n涨跌：${
    item.updown
  }   百分：${keepDecimal(item.percent * 100, 2)}%\n最高：${
    item.high
  }   最低：${item.low}\n今开：${item.open}   昨收：${item.yestclose}`;
}
// 基金 Tooltip
function getFundTooltipText() {
  let fundTemplate = '';
  for (let fund of fundList) {
    fundTemplate += `${
      fund.percent.indexOf('-') === 0
        ? '↓ '
        : fund.percent === '0.00%'
        ? ''
        : '↑ '
    } ${fund.percent}   「${
      fund.name
    }」\n-------------------------------------\n`;
  }
  return `【基金详情】\n\n ${fundTemplate}`;
}

// 左侧栏基金数据刷新
function renderFundView(fundList) {
  const list = [];
  for (let fund of fundList) {
    const str = `${fund.percent}   「${fund.name}」(${fund.code})`;
    list.push({
      grow: fund.percent.indexOf('-') === 0 ? false : true,
      text: str,
      code: fund.code,
      name: fund.name,
    });
  }
  dataProvider = new DataProvider(extContext);
  dataProvider.setItem(list);
  vscode.window.registerTreeDataProvider('fund', dataProvider);
}

// 左侧栏股票数据刷新
function renderStockView(stockData) {
  const stockList = [];
  const arr = stockData.sort((a, b) => (a.percent >= b.percent ? -1 : 1));
  arr.forEach((item) => {
    const { code, percent, symbol, name, price, type } = item;
    stockList.push({
      isStock: true,
      grow: percent >= 0,
      code,
      stockCode: `${type}${symbol}`,
      name,
      text: `${keepDecimal(
        percent * 100,
        2
      )}%   ${price}    「${name}」${type}${symbol}`,
    });
  });
  const data2 = new DataProvider(extContext);
  data2.setItem(stockList);
  vscode.window.registerTreeDataProvider('stock', data2);
}

function createStatusBarItem(item) {
  const barItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    3
  );
  barItem.text = getItemText(item);
  barItem.color = getItemColor(item);
  barItem.tooltip = getTooltipText(item);
  barItem.show();
  return barItem;
}
// 基金状态栏信息
function createFundStatusBarItem() {
  const barItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    2
  );
  barItem.text = `  「基金」详情`;
  barItem.color = getItemColor({ percent: 1 });
  barItem.tooltip = getFundTooltipText();
  barItem.show();
  return barItem;
}
