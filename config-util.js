const vscode = require('vscode');
const { clean, unique } = require('./utils');

const SHOWTIME_CONFIG_KEY = 'leek-fund.showTime';
const UPDATE_INTERVAL_CONFIG_KEY = 'leek-fund.updateInterval';
const FUND_CODE_CONFIG_KEY = 'leek-fund.funds';
const STOCK_CODE_CONFIG_KEY = 'leek-fund.stocks';

/**
 * 开市时间[9,15]
 */
const isStockTime = () => {
  let stockTime = [9, 15];
  const date = new Date();
  const hours = date.getHours();
  const minus = date.getMinutes();
  const delay = hours === 15 && minus === 5; // 15点5分的时候刷新一次，避免数据延迟
  return (hours >= stockTime[0] && hours <= stockTime[1]) || delay;
};

const isShowTime = () => {
  const config = vscode.workspace.getConfiguration();
  const configShowTime = config.get(SHOWTIME_CONFIG_KEY);
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
};

const getUpdateInterval = () => {
  const config = vscode.workspace.getConfiguration();
  return config.get(UPDATE_INTERVAL_CONFIG_KEY);
};

const getFundCodes = () => {
  const config = vscode.workspace.getConfiguration();
  const funds = config.get(FUND_CODE_CONFIG_KEY) || [];
  return funds;
};

const deleteFund = (target) => {
  const config = vscode.workspace.getConfiguration();
  const funds = getFundCodes();
  const result = funds.filter((code) => code !== target);
  config.update(FUND_CODE_CONFIG_KEY, result, true);
  vscode.window.showInformationMessage(`Successfully delete.`);
};

const addFund = () => {
  vscode.window.showInputBox().then((code) => {
    if (!code) {
      return;
    }

    const config = vscode.workspace.getConfiguration();
    const funds = config.get(FUND_CODE_CONFIG_KEY) || [];

    let codes = [...funds, code];
    codes = clean(codes);
    codes = unique(codes);

    config.update(FUND_CODE_CONFIG_KEY, codes, true);
    vscode.window.showInformationMessage(`Successfully add.`);
  });
};

const getStockCodes = () => {
  const config = vscode.workspace.getConfiguration();
  const stocks = config.get(STOCK_CODE_CONFIG_KEY);
  return stocks;
};

const getItemColor = (item) => {
  const config = vscode.workspace.getConfiguration();
  const riseColor = config.get('leek-fund.riseColor');
  const fallColor = config.get('leek-fund.fallColor');

  return item.percent >= 0 ? riseColor : fallColor;
};

module.exports = {
  isStockTime,
  isShowTime,
  getUpdateInterval,
  getFundCodes,
  getStockCodes,
  deleteFund,
  addFund,
  getItemColor,
};
