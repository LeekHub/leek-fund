/* eslint-disable */
// @ts-nocheck
const http = require('http');
const https = require('https');
// import { findAvailablePort } from '../shared/findAvailablePort';

let availablePort = 17100;

const excludeGn = [
  '深成',
  '昨日涨停',
  '沪股通',
  'MSCI中国',
  '央国企改革',
  '标准普尔',
  '创业板综',
  '富时罗素',
  '深股通',
  '融资融券',
  'S300',
  '沪深',
];

// 地理坐标数据映射
const geoCoordinates = {
  北京: [116.405285, 39.904989],
  天津: [117.190182, 39.125596],
  河北: [114.502461, 38.045474],
  山西: [112.549248, 37.857014],
  内蒙古: [111.670801, 40.818311],
  辽宁: [123.429096, 41.796767],
  吉林: [125.3245, 43.886841],
  黑龙江: [126.642464, 45.756967],
  上海: [121.472644, 31.231706],
  江苏: [118.767413, 32.041544],
  浙江: [119.5313, 29.8773],
  安徽: [117.283042, 31.86119],
  福建: [119.306239, 26.075302],
  江西: [115.892151, 28.676493],
  山东: [117.000923, 36.675807],
  河南: [113.665412, 34.757975],
  湖北: [114.298572, 30.584355],
  湖南: [112.982279, 28.19409],
  广东: [113.280637, 23.125178],
  广西: [108.320004, 22.82402],
  海南: [110.33119, 20.031971],
  重庆: [106.504962, 29.533155],
  四川: [104.065735, 30.659462],
  贵州: [106.713478, 26.578343],
  云南: [102.712251, 25.040609],
  西藏: [91.132212, 29.660361],
  陕西: [108.948024, 34.263161],
  甘肃: [103.823557, 36.058039],
  青海: [101.778916, 36.623178],
  宁夏: [106.278179, 38.46637],
  新疆: [87.617733, 43.792818],
  台湾: [121.509062, 25.044332],
};

// 将数值转换为亿元并保留两位小数
function convertToYi(num) {
  return (num / 100000000).toFixed(2);
}

// 获取区域资金数据
function fetchEastMoneyData() {
  return new Promise((resolve, reject) => {
    const url =
      'https://data.eastmoney.com/dataapi/bkzj/getbkzj?key=f174&code=m%3A90%2Bt%3A1';
    // const url = 'https://data.eastmoney.com/dataapi/bkzj/getbkzj?key=f174&code=m%3A90%2Bt%3A';

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            const result = {
              bk_xAxis: [],
              bk_seriesData: [],
              bk_min: 600,
              bk_max: -600,
              map_echarts_data: [],
            };

            if (jsonData.data && jsonData.data.diff) {
              jsonData.data.diff.forEach((item) => {
                const value = parseFloat(convertToYi(item.f174));
                result.bk_xAxis.push(item.f14);
                result.bk_seriesData.push(value);

                // 更新最大值和最小值
                result.bk_min = Math.min(result.bk_min, value);
                result.bk_max = Math.max(result.bk_max, value);

                // 处理地图数据
                const regionName = item.f14.replace(/板块$/, '');
                if (geoCoordinates[regionName]) {
                  result.map_echarts_data.push({
                    label: item.f14,
                    name: value,
                    value: geoCoordinates[regionName],
                  });
                }
              });
            }

            // 确保最小值和最大值保留两位小数
            result.bk_min = parseFloat(result.bk_min.toFixed(2)) - 50;
            result.bk_max = parseFloat(result.bk_max.toFixed(2)) + 50;

            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// 概念资金流
function fetchGnEastMoneyData() {
  return new Promise((resolve, reject) => {
    const url =
      'https://data.eastmoney.com/dataapi/bkzj/getbkzj?key=f174&code=m%3A90%2Bt%3A3';

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            const result = {
              gn_top_xAxis: [],
              gn_top_seriesData: [],
              gn_bottom_xAxis: [],
              gn_bottom_seriesData: [],
              gn_top_min: 300,
              gn_top_max: -300,
              gn_bottom_min: 300,
              gn_bottom_max: -300,
            };

            if (jsonData.data && jsonData.data.diff) {
              // 将数据转换为包含值和名称的对象数组，并过滤掉 excludeGn 中包含的项目
              const dataArray = jsonData.data.diff
                .filter(
                  (item) =>
                    !excludeGn.some((excludeText) =>
                      item.f14.includes(excludeText)
                    )
                )
                .map((item) => ({
                  name: item.f14,
                  value: parseFloat(convertToYi(item.f174)),
                }));

              // 按值排序
              dataArray.sort((a, b) => b.value - a.value);

              // 获取前10个最大值
              const topData = dataArray.slice(0, 10);
              topData.forEach((item) => {
                result.gn_top_xAxis.push(item.name);
                result.gn_top_seriesData.push(item.value);

                // 更新最大值组的最大最小值
                result.gn_top_min = Math.min(result.gn_top_min, item.value);
                result.gn_top_max = Math.max(result.gn_top_max, item.value);
              });

              // 获取后10个最小值
              const bottomData = dataArray.slice(-6);
              bottomData.forEach((item) => {
                result.gn_bottom_xAxis.push(item.name);
                result.gn_bottom_seriesData.push(item.value);

                // 更新最小值组的最大最小值
                result.gn_bottom_min = Math.min(
                  result.gn_bottom_min,
                  item.value
                );
                result.gn_bottom_max = Math.max(
                  result.gn_bottom_max,
                  item.value
                );
              });
            }

            // 确保最小值和最大值保留两位小数
            result.gn_top_min =
              parseFloat(result.gn_top_min.toFixed(2)) -
              (parseFloat(result.gn_top_min.toFixed(2)) * 1) / 4;
            result.gn_top_max = Math.ceil(
              parseFloat(result.gn_top_max.toFixed(2)) +
              (parseFloat(result.gn_top_max.toFixed(2)) * 1) / 4
            );
            result.gn_bottom_min =
              parseFloat(result.gn_bottom_min.toFixed(2)) -
              (parseFloat(result.gn_bottom_min.toFixed(2)) * 1) / 4;
            result.gn_bottom_max = Math.ceil(
              parseFloat(result.gn_bottom_max.toFixed(2)) +
              (parseFloat(result.gn_bottom_max.toFixed(2)) * 1) / 4
            );

            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
// 行业资金流
function fetchHyEastMoneyData() {
  return new Promise((resolve, reject) => {
    const url =
      'https://data.eastmoney.com/dataapi/bkzj/getbkzj?key=f174&code=m%3A90%2Bt%3A2';

    https
      .get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            const result = {
              hy_top_xAxis: [],
              hy_top_seriesData: [],
              hy_top_min: 300,
              hy_top_max: -300,
            };

            if (jsonData.data && jsonData.data.diff) {
              // 将数据转换为包含值和名称的对象数组，并过滤掉 excludeGn 中包含的项目
              const dataArray = jsonData.data.diff
                .filter(
                  (item) =>
                    !excludeGn.some((excludeText) =>
                      item.f14.includes(excludeText)
                    )
                )
                .map((item) => ({
                  name: item.f14,
                  value: parseFloat(convertToYi(item.f174)),
                }));

              // 按值排序
              dataArray.sort((a, b) => b.value - a.value);

              // 获取前10个最大值
              const topData = dataArray.slice(0, 10);
              topData.forEach((item) => {
                result.hy_top_xAxis.push(item.name);
                result.hy_top_seriesData.push(item.value);

                // 更新最大值组的最大最小值
                result.hy_top_min = Math.min(result.hy_top_min, item.value);
                result.hy_top_max = Math.max(result.hy_top_max, item.value);
              });
            }

            // 确保最小值和最大值保留两位小数
            result.hy_top_min = Math.floor(
              parseFloat(result.hy_top_min.toFixed(2)) -
              (parseFloat(result.hy_top_min.toFixed(2)) * 1) / 4
            );
            result.hy_top_max = Math.ceil(
              Math.ceil(
                parseFloat(result.hy_top_max.toFixed(2)) +
                (parseFloat(result.hy_top_max.toFixed(2)) * 1) / 4
              )
            );

            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * 获取东财数据服务器Host
 */
// export function getEastMoneyDataServerHost() {
//   return `http://localhost:${availablePort || 17100}`;
// }

export default async function createEastMoneyDataServer() {
  // availablePort = await findAvailablePort(17100); // 从17100端口开始寻找
  // 创建HTTP服务器
  const server = http.createServer(async (req, res) => {
    // 设置CORS头
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url === "/api/stock/data" && req.method === "GET") {
      try {
        const data = await fetchEastMoneyData();
        const gnData = await fetchGnEastMoneyData();
        const hyData = await fetchHyEastMoneyData();
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ...data, ...gnData, ...hyData }));
      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  });

  server.listen(availablePort, () => {
    console.log(`🚀 ~ EastMoneyData Server running at http://localhost:${availablePort}`);
  });

}


