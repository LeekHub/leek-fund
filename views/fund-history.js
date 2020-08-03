/**
 * @author: giscafer ,https://github.com/giscafer
 * @date: 2020-08-03 23:49:00
 * @description: 基金历史数据
 */

const axios = require('axios');
const { randHeader } = require('../utils');

function getFundUrlByCode(fundCode) {
  const fundUrl = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundCode}&page=1&per=24`;
  return fundUrl;
}

function getFundHistoryData(code) {
  const url = getFundUrlByCode(code);
  return new Promise((resolve, reject) => {
    axios
      // @ts-ignore
      .get(url, { headers: randHeader() })
      .then((response) => {
        eval(response.data);
        // @ts-ignore

        resolve({ code, content: apidata.content });
      })
      .catch(() => resolve({ code, content: '历史净值获取失败' }));
  });
}

function qryAllFundHistoryData(fundCodes) {
  const promiseAll = [];
  for (const fundCode of fundCodes) {
    promiseAll.push(getFundHistoryData(fundCode));
  }
  Promise.all(promiseAll).then((result) => {
    console.log(result);
  });
}

module.exports = {
  qryAllFundHistoryData,
  getFundHistoryData,
};
// qryAllFundHistoryData(['0000001', '0000300', '0000016', '0000688', '0399006']);
