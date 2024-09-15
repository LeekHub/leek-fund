import axios from 'axios';
import { formatDate, randHeader } from './utils';
import Log from './log';

export class HolidayHelper {
  /**
   * 根据年份，取出全年节假日情况
   * @param year 年份字符串，如：'2020'
   */
  public static getHolidayDataByYear = async (year: string) => {
    // 使用 https://timor.tech/api/holiday 的API
    // https://timor.tech/api/holiday/year/2020
    const url = `https://timor.tech/api/holiday/info/${year}`;
    try {
      const response = await axios.get(url, {
        headers: {
          ...randHeader(),
          Referer: 'https://timor.tech/',
        }
      });
      const data = response.data;
      // 返回的结构体如下：
      // 解释：
      //   {
      //     "code": 0,               // 0服务正常。-1服务出错
      //     "holiday": {
      //       "10-01": {
      //         "holiday": true,     // 该字段一定为true
      //         "name": "国庆节",     // 节假日的中文名。
      //         "wage": 3,           // 薪资倍数，3表示是3倍工资
      //         "date": "2018-10-01" // 节假日的日期
      //       },
      //       "10-02": {
      //         "holiday": true,     // 该字段一定为true
      //         "name": "国庆节",     // 节假日的中文名。
      //         "wage": 3,           // 薪资倍数，3表示是3倍工资
      //         "date": "2018-10-01" // 节假日的日期
      //       }
      //     }
      //   }
      if (!data || data.code !== 0) {
        throw new Error('year节假日服务器返回-1，服务出错！');
      }

      return data;
    } catch (err) {
      console.log(url);
      console.error(err);
      return null;
    }
  };

  /**
   * 根据日取出节假日情况
   * @param date 日期
   */
  public static getHolidayDataByDate = async (date: Date) => {
    // 使用 https://timor.tech/api/holiday 的API
    // https://timor.tech/api/holiday/info/2020-09-18
    const url = `https://timor.tech/api/holiday/info/${formatDate(date)}`;
    try {
      const response = await axios.get(url, {
        headers: {
          ...randHeader(),
          Referer: 'https://timor.tech/',
        }
      });
      const data = response.data;

      // 返回的结构体如下：
      // 实例： {"code":0,"type":{"type":0,"name":"周五","week":5},"holiday":null}
      // 解释：
      // {
      //     "code": 0,              // 0服务正常。-1服务出错
      //     "type": {
      //       "type": enum(0, 1, 2, 3), // 节假日类型，分别表示 工作日、周末、节日、调休。
      //       "name": "周六",         // 节假日类型中文名，可能值为 周一 至 周日、假期的名字、某某调休。
      //       "week": enum(1 - 7)    // 一周中的第几天。值为 1 - 7，分别表示 周一 至 周日。
      //     },
      //     "holiday": { // 非节日节点为null
      //       "holiday": false,     // true表示是节假日，false表示是调休
      //       "name": "国庆前调休",  // 节假日的中文名。如果是调休，则是调休的中文名，例如'国庆前调休'
      //       "wage": 1,            // 薪资倍数，1表示是1倍工资
      //       "after": false,       // 只在调休下有该字段。true表示放完假后调休，false表示先调休再放假
      //       "target": '国庆节'     // 只在调休下有该字段。表示调休的节假日
      //     }
      //   }
      if (!data || data.code !== 0) {
        throw new Error('date节假日服务器返回-1，服务出错！');
      }

      return data;
    } catch (err) {
      console.log(url);
      console.error(err);
      return null;
    }
  };

  public static isHolidayInChina = async (date: Date = new Date()) => {
    let tof = false;

    let dataObj = await HolidayHelper.getHolidayDataByDate(date);

    if (dataObj) {
      tof = dataObj.type?.type === 2;
      Log.info("HolidayHelper ~ 节假日= ~ :", dataObj?.type?.name);
    }

    return tof;
  };
}
