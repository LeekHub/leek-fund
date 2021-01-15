import { useEffect, useState } from 'react';
import fetch from '@/utils/fetch';
import { FundInfo } from '@/../types/shim-background';
import { fetchTryHandler } from '@/utils/common';

/**
 * 获取基本数据
 * @param info
 * @returns
 */
async function fetchFundMoreInfo(info: FundInfo) {
  // setFundMoreData(void 0);
  const res = await fetch({
    url: `https://fund.eastmoney.com/${info.code}.html`,
    responseType: 'text',
  });
  const fragment = document.createElement('html');
  const newFundMoreData: FundBaseData = {
    latest1m: '0',
    latest3m: '0',
    latest6m: '0',
    latest12m: '0',
    latest36m: '0',
    sinceToday: '0',
    positionStocks: {},
    sameKindOtherFund: [],
    jjpj: 0,
  };
  fragment.innerHTML = res.data as string;

  // 获取收益统计
  newFundMoreData.latest1m =
    fragment.querySelector('div.dataOfFund > dl.dataItem01 > dd:nth-child(3) > span.ui-num')
      ?.innerHTML ?? '获取失败';
  newFundMoreData.latest3m =
    fragment.querySelector('div.dataOfFund > dl.dataItem02 > dd:nth-child(3) > span.ui-num')
      ?.innerHTML ?? '获取失败';
  newFundMoreData.latest6m =
    fragment.querySelector('div.dataOfFund > dl.dataItem03 > dd:nth-child(3) > span.ui-num')
      ?.innerHTML ?? '获取失败';
  newFundMoreData.latest12m =
    fragment.querySelector('div.dataOfFund > dl.dataItem01 > dd:nth-child(4) > span.ui-num')
      ?.innerHTML ?? '获取失败';
  newFundMoreData.latest36m =
    fragment.querySelector('div.dataOfFund > dl.dataItem02 > dd:nth-child(4) > span.ui-num')
      ?.innerHTML ?? '获取失败';
  newFundMoreData.sinceToday =
    fragment.querySelector('div.dataOfFund > dl.dataItem03 > dd:nth-child(4) > span.ui-num')
      ?.innerHTML ?? '获取失败';

  // 获取持仓信息
  fragment
    .querySelectorAll('#position_shares > div.poptableWrap > table > tbody > tr')
    .forEach((el, index) => {
      if (index < 1) return; // 第一个是表头
      const stockName = (el.querySelector('td:nth-child(1) > a') as HTMLElement)?.innerText;
      const stockPercent = (el.querySelector('td:nth-child(2)') as HTMLElement)?.innerText;

      newFundMoreData.positionStocks![stockName] = stockPercent;
    });
  console.log(fragment.querySelector('#position_shares .end_date'));
  newFundMoreData.positionStocksDate = fragment
    .querySelector('#position_shares .end_date')
    ?.innerHTML.replace('持仓截止日期: ', '');

  // 基金基本信息
  fragment.querySelectorAll('.infoOfFund tr').forEach((tr, trIndex) => {
    tr.querySelectorAll('td').forEach((td, tdIndex) => {
      switch (`${trIndex}-${tdIndex}`) {
        case '0-0': // 类型
          newFundMoreData.fundType = td.querySelector('a')?.innerText;
          break;
        case '0-1': // 规模
          newFundMoreData.fundMoneySize = /基金规模：(.*)/.exec(td.innerText)?.[1];
          break;
        case '0-2': // 经理
          newFundMoreData.fundManager = td.querySelector('a')?.innerText;
          break;
        case '1-0': // 成立时间
          newFundMoreData.setupDate = /(\d{4}-\d{2}-\d{2})/.exec(td.innerText)?.[0] ?? '获取失败';
          break;
      }
    });
  });

  // 同类型基金
  const sameKindOtherFundCodes: string[] = [];
  fragment
    .querySelectorAll('.rankInSimilarWrap #titleItemActive0 .buyFundItem_fundMsg')
    .forEach((div) => {
      const a = div.querySelector('a.shortName') as HTMLElement;

      const fundName = a.innerText;
      const code = /\/(\d+)\.html$/.exec(a.getAttribute('href') || '')?.[1];
      const date = div.querySelector('.buyFundItem_date')?.innerHTML ?? '获取失败';
      const rate = div.querySelector('.buyFundItem_rate')?.innerHTML ?? '获取失败';
      if (!code || ~sameKindOtherFundCodes.indexOf(code)) return;
      sameKindOtherFundCodes.push(code);
      newFundMoreData.sameKindOtherFund!.push({
        code,
        fundName,
        date,
        rate,
      });
    });

  //综合评级
  const jjpjEl = fragment.querySelectorAll('div[class^=jjpj]')?.[0];
  if (jjpjEl) {
    newFundMoreData.jjpj = parseInt(jjpjEl.getAttribute('class')?.replace('jjpj', '') ?? '0');
  }

  return newFundMoreData;
}

/**
 * 获取评级数据
 * @param info
 * @returns
 */
async function fetchFundPJDatas(info: FundInfo) {
  try {
    const res = await fetch({
      url: 'http://api.fund.eastmoney.com/F10/JJPJ/',
      method: 'GET',
      params: {
        fundcode: info.code,
        pageIndex: 1,
        pageSize: 5,
        _: Date.now(),
      },
      headers: {
        Referer: 'http://fundf10.eastmoney.com/',
      },
    });
    const { data } = res;
    if (data.ErrCode === 0) {
      return data.Data;
    }
    return [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 获取盈利概率
 * @param info
 */
async function fetchFundYLGL(info: FundInfo) {
  try {
    const res = await fetch({
      url: 'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNCSDiag',
      method: 'GET',
      params: {
        version: '10.0',
        deviceid: 0,
        product: 'EFund',
        plat: 'Iphone',
        FCODE: info.code,
      },
    });
    console.log('fetchFundYLGL: ', res);
    const { data } = res;
    if (data.ErrCode === 0) {
      return data.Datas;
    }
    return void 0;
  } catch (err) {
    console.error(err);
    return void 0;
  }
}

export function useFetchFundMoreInfo(
  info: FundInfo
): {
  fundMoreData: FundData;
  loading: boolean;
} {
  const [fundMoreData, setFundMoreData] = useState<FundData>({});
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    (async function getDatas() {
      setLoading(true);
      try {
        const result: FundData = {};
        [result.baseData, result.PJDatas, result.mncsdiag] = await Promise.all([
          fetchTryHandler(fetchFundMoreInfo, info),
          fetchTryHandler(fetchFundPJDatas, info),
          fetchTryHandler(fetchFundYLGL, info),
        ]);
        console.log('result: ', result);
        setFundMoreData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [info]);

  return { fundMoreData, loading };
}
