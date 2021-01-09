import { useEffect, useState } from 'react';
import fetch from '@/utils/fetch';
import { FundInfo, LeekTreeItem } from '@/../types/shim-background';

export function useFetchFundMoreInfo(info: FundInfo): FundMoreDataType | undefined {
  const [fundMoreData, setFundMoreData] = useState<FundMoreDataType>();

  useEffect(() => {
    async function fetchFundMoreInfo() {
      setFundMoreData(void 0);
      const res = await fetch({
        url: `https://fund.eastmoney.com/${info.code}.html`,
        responseType: 'text',
      });
      const fragment = document.createElement('html');
      const newFundMoreData: FundMoreDataType = {
        latest1m: '0',
        latest3m: '0',
        latest6m: '0',
        latest12m: '0',
        latest36m: '0',
        sinceToday: '0',
        positionStocks: {},
        sameKindOtherFund: [],
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
              newFundMoreData.setupDate =
                /(\d{4}-\d{2}-\d{2})/.exec(td.innerText)?.[0] ?? '获取失败';
              break;
          }
        });
      });

      // 同类型基金
      const sameKindOtherFundCodes: string[] = [];
      fragment.querySelectorAll('.rankInSimilarWrap #titleItemActive0 .buyFundItem_fundMsg').forEach((div) => {
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

      setFundMoreData(newFundMoreData);
    }
    fetchFundMoreInfo();
  }, [info]);

  return fundMoreData;
}
