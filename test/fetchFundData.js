const cheerio = require('cheerio');
const axios = require('axios');
const { randHeader } = require('../utils');
// @ts-ignore
const baseUrl = 'https://api.money.126.net/data/feed/';

// @ts-ignore
// const request = axios.create({});

function getFundUrlByCode(fundCode) {
  const date = new Date();
  let day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  day = '2020-7-31';
  const fundUrl = `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${fundCode}&page=1&per=1`;
  console.log(day, fundUrl);
  return fundUrl;
}

const fundCodes = [
  '001632',
  /* '420009',
  '320007',
  '003096',
  '001102',
  '003885',
  '001071',
  '005963',
  '005223',
  '002316',
  '161726',
  '161028',
  '161020',
  '519674',
  '161725', */
];

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
    console.log(data);
  });
}

fetchAllFundData();
