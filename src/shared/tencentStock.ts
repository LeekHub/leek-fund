import Axios from 'axios';
import Log from './log';
import { decode } from 'iconv-lite';

const searchUrl = 'https://proxy.finance.qq.com/ifzqgtimg/appstock/smartbox/search/get';
const stockDataUrl = 'https://qt.gtimg.cn/q=';
export const searchStockList = async (keyword: string) => {
  Log.info('searchStockList keyword: ', keyword);
  const stockResponse = await Axios.get(searchUrl, {
    params: {
      q: keyword,
    },
  });
  // Log.info('stockResponse: ', stockResponse.data);
  const stockListArray = stockResponse?.data?.data?.stock || [];
  // Log.info('stockListStr: ', stockListArray, keyword);
  const stockList = stockListArray.map((stockItemArr: string[]) => {
    return {
      code: stockItemArr[1].toLowerCase(),
      name: stockItemArr[2],
      market: stockItemArr[0],
      abbreviation: stockItemArr[3],
    };
  });
  Log.info('stockList: ', stockList, keyword);
  return stockList;
};

export const getTencentHKStockData = async (codes: string[]) => {
  // Log.info('before getStockData codes: ', codes);
  const stockDataResponse = await Axios.get(stockDataUrl, {
    responseType: 'arraybuffer',
    params: {
      q: codes.map((code) => `r_${code}`).join(','),
      fmt: 'json',
    },
    transformResponse: [
      (data) => {
        const body = decode(data, 'GBK');
        return JSON.parse(body);
      },
    ],
  });

  const stockDataList = codes.map((code: string) => {
    let codeConfiged = code;
    if (codeConfiged.startsWith('hk')) {
      codeConfiged = 'hk' + codeConfiged.substring(2).toLocaleLowerCase(); // 处理大小写，否则会造成删除不了
    } else {
      codeConfiged = codeConfiged.toLowerCase();
    }
    const rCode = `r_${code}`;
    const stockItemArr = stockDataResponse.data[rCode];
    if (!stockItemArr) {
      return {
        code: codeConfiged,
        name: 'NODATA',
      };
    }
    return {
      code: codeConfiged,
      name: stockItemArr[1],
      price: stockItemArr[3],
      yestclose: stockItemArr[4],
      open: stockItemArr[5],
      high: stockItemArr[33],
      low: stockItemArr[34],
      volume: stockItemArr[36],
      amount: stockItemArr[37],
      buy1: stockItemArr[9],
      sell1: stockItemArr[19],
      time: stockItemArr[30],
    };
  });
  // Log.info('stockDataList: ', stockDataList, codes);
  return stockDataList;
};
