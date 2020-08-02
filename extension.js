const cheerio = require('cheerio');
const vscode = require('vscode');
const axios = require('axios');
const { randHeader } = require('./utils');

let statusBarItems = {};
let fundCodes = [];
let fundList = []; // 基金数据缓存
let fundMap = {}; // 名称和code对应的
let updateInterval = 10000;
let timer = null;
let showTimer = null;

function activate(context) {
  init();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(handleConfigChange)
  );
}
exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;

function init() {
  initShowTimeChecker();
  if (isShowTime()) {
    fundCodes = getFundCodes();
    getFundNameList(fundCodes);
    // 配置变化时，获取基金名称缓存
    // console.log('fundCodes=', fundCodes);
    updateInterval = getUpdateInterval();
    fetchSZData(); // 上证指数
    fetchAllFundData(); // 基金数据
    timer = setInterval(() => {
      fetchSZData(); // 上证指数
      fetchAllFundData(); // 基金数据
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
      // @ts-ignore
      axios.get(url).then((response) => {
        const data = response.data;
        const text = data.replace('jsonpgz(', '').replace(');', '');
        const fundName = JSON.parse(text).name;
        fundMap[code] = fundName;
        resolve({ name: fundName, code });
      });
    });
    promiseList.push(p);
  }
  Promise.all(promiseList)
    .then((res) => {
      console.log(res.length);
      console.log(fundMap);
    })
    .catch((err) => console.log(err));
}

function getFundCodes() {
  const config = vscode.workspace.getConfiguration();
  const funds = config.get('leek-fund.funds');
  return funds;
}

function getUpdateInterval() {
  const config = vscode.workspace.getConfiguration();
  return config.get('leek-fund.updateInterval');
}

function isShowTime() {
  const config = vscode.workspace.getConfiguration();
  const configShowTime = config.get('leek-fund.showTime');
  let showTime = [0, 23];
  if (
    Array.isArray(configShowTime) &&
    configShowTime.length === 2 &&
    configShowTime[0] <= configShowTime[1]
  ) {
    showTime = configShowTime;
  }
  const now = new Date().getHours();
  return now >= showTime[0] && now <= showTime[1];
}

function getFundUrlByCode(fundCode) {
  // const date = new Date();
  // let day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  // day = '2020-7-31';
  const fundUrl = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundCode}&page=1&per=1`;
  // console.log(fundUrl);
  return fundUrl;
}

function fetchFundData(url, code) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    axios.get(url, { headers: randHeader() }).then((response) => {
      eval(response.data);
      // @ts-ignore
      const $ = cheerio.load(apidata.content);
      // @ts-ignore
      // console.log(apidata.content);
      const red = $('td.tor.bold.red');
      const green = $('td.tor.bold.grn');
      let value = '0.00%';
      if (red) {
        const text = red.text();
        if (text) {
          value = text;
        }
      }
      if (green) {
        const text = green.text();
        if (text) {
          value = text;
        }
      }
      resolve({ percent: value, code });
    });
  });
}

function fetchAllFundData() {
  console.log('fetchAllFundData');
  const promiseAll = [];
  for (const fundCode of fundCodes) {
    const url = getFundUrlByCode(fundCode);
    promiseAll.push(fetchFundData(url, fundCode));
  }
  Promise.all(promiseAll).then((result) => {
    const data = result.sort((a, b) => (a.percent > b.percent ? -1 : 1));
    // console.log(data);
    fundList = data;
  });
}

function fetchSZData() {
  axios
    // @ts-ignore
    .get(`https://api.money.126.net/data/feed/0000001?callback=a`) // 上证指数
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
          displayData(data);
        } catch (error) {}
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
  data.map((item) => {
    const key = item.code;
    if (statusBarItems[key]) {
      statusBarItems[key].text = getItemText(item);
      statusBarItems[key].color = getItemColor(item);
      statusBarItems[key].tooltip = getTooltipText(item);
    } else {
      statusBarItems[key] = createStatusBarItem(item);
    }
  });
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
      fundMap[fund.code]
    }」\n-------------------------------------\n`;
  }
  return `【基金详情】\n\n ${fundTemplate}`;
}

function getItemColor(item) {
  const config = vscode.workspace.getConfiguration();
  const riseColor = config.get('leek-fund.riseColor');
  const fallColor = config.get('leek-fund.fallColor');

  return item.percent >= 0 ? riseColor : fallColor;
}

function createStatusBarItem(item) {
  const barItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0 - fundCodes.indexOf(item.code)
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
    0 - 999999
  );
  barItem.text = `  「基金」详情`;
  barItem.color = getItemColor({ percent: 1 });
  barItem.tooltip = getFundTooltipText();
  barItem.show();
  return barItem;
}

function keepDecimal(num, fixed) {
  let result = parseFloat(num);
  if (isNaN(result)) {
    return '--';
  }
  return result.toFixed(fixed);
}

function calcFixedNumber(item) {
  let high =
    String(item.high).indexOf('.') === -1
      ? 0
      : String(item.high).length - String(item.high).indexOf('.') - 1;
  let low =
    String(item.low).indexOf('.') === -1
      ? 0
      : String(item.low).length - String(item.low).indexOf('.') - 1;
  let open =
    String(item.open).indexOf('.') === -1
      ? 0
      : String(item.open).length - String(item.open).indexOf('.') - 1;
  let yest =
    String(item.yestclose).indexOf('.') === -1
      ? 0
      : String(item.yestclose).length - String(item.yestclose).indexOf('.') - 1;
  let updown =
    String(item.updown).indexOf('.') === -1
      ? 0
      : String(item.updown).length - String(item.updown).indexOf('.') - 1;
  let max = Math.max(high, low, open, yest, updown);

  if (max === 0) {
    max = 2;
  }

  return max;
}
