import { useEffect, useState } from 'react';
import { fetchTryHandler } from '@/utils/common';
import dayjs from 'dayjs';

/**
 * 获取涨跌数据
 * @param info
 * @returns
 */
async function fetchUpDownData() {
  try {
    const res = await fetch(
      'https://emdatah5.eastmoney.com/dc/NXFXB/GetUpDownData?type=0'
    ).then((response) => response.json());
    if (res?.length > 0) {
      const data = res[0];
      data.day = dayjs(data.time).format('YYYY年MM月DD日');
      return res[0];
    }
    return {};
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 获取热门主题
 * @param info
 */
async function fetchHotTheme() {
  try {
    const res = await fetch(
      'https://emdatah5.eastmoney.com/dc/NXFXB/GetHotTheme'
    ).then((response) => response.json());
    if (res?.length > 0) {
      return res[0]['Data'];
    }
    return [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 沪深港通数据
 * @param info
 */
async function fetchHsgtData() {
  try {
    // [f51,f54,f52,f53,f58,f56,f57,f62,f60,f61] = [时间,沪净买,沪买入,沪卖出,深净买,深买入,深卖出,北向净买,北向买入,北向卖出]
    const res = await fetch(
      'https://push2.eastmoney.com/api/qt/kamtbs.rtmin/get?fields1=f1,f3&fields2=f51,f54,f52,f53,f58,f56,f57,f62,f60,f61'
    ).then((response) => response.json());
    return res.data.s2n || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export function useFetchNxfxbInfo() {
  const [nxfxbData, setNxfxbData] = useState<NxfxbData>({});
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    (async function getDatas() {
      setLoading(true);
      try {
        const result: NxfxbData = {};
        [result.updownData, result.hotThemeData, result.hsgtData] = await Promise.all([
          fetchTryHandler(fetchUpDownData),
          fetchTryHandler(fetchHotTheme),
          fetchTryHandler(fetchHsgtData),
        ]);
        setNxfxbData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { nxfxbData, loading };
}
