/**
 * @author giscafer
 * @email giscafer@outlook.com
 * @create date 2021-10-04 09:25:36
 * @modify date 2021-10-04 09:25:36
 * @desc 沪深通
 */
import toFixed from '@/utils/toFixed';
import { Axis, Chart, Line, Tooltip, Annotation } from 'bizcharts';
import { last } from 'lodash';
import { useMemo } from 'react';

function numberFormat(num: any) {
  return toFixed(Number(num) / 10000, 2);
}

function dataConvert(data: string[]) {
  const result: { time: string; value: string | number; name: string }[] = [];
  data.forEach((item) => {
    const arr = item.split(',');
    const time = arr[0];
    result.push({
      time,
      name: '沪股通',
      value: numberFormat(arr[1]),
    });
    result.push({
      time,
      name: '深股通',
      value: numberFormat(arr[4]),
    });
    result.push({
      time,
      name: '北向资金',
      value: numberFormat(arr[7]),
    });
  });
  return result;
}

const scale = {
  sales: {
    // minTickInterval: 10,
    type: 'linear',
    tickCount: 5,
    // tickInterval: 100,
  },
  value: {
    formatter: (val: string) => {
      return `${val} 亿`;
    },
  },
};

const HSGT = ({ data = [] }: { data: Record<string, any> }) => {
  const lineData = useMemo(() => {
    return dataConvert(data as string[]);
  }, [data]);

  const dataMarkerCfg = useMemo(() => {
    const list = data.filter((item: string)=>{
      const arr = item.split(',');
      return arr[1]!=='-'
    });
    const item = last(list as []) || '';
    const arr = item.split(',');
    return {
      content: `
      沪股通：净买额 ${numberFormat( arr[1] )} 亿，买入额 ${numberFormat( arr[2] )}亿，卖出额 ${numberFormat( arr[3] )}亿
      \n
      深股通：净买额 ${numberFormat( arr[4] )} 亿，买入额 ${numberFormat( arr[5] )}亿，卖出额 ${numberFormat( arr[6] )}亿
      \n
      北向资金：净买额 ${numberFormat( arr[7] )} 亿，买入额 ${numberFormat( arr[8] )}亿，卖出额 ${numberFormat( arr[9] )}亿 `,
      style: {
        height: 200,
        textAlign: 'left',
        fill: '#36c361',
      },
      line: {
        length: 200,
        style: {
          stroke: '#36c361',
        },
      },
    };
  }, [data]);

  return (
    <Chart height={400} autoFit data={lineData} scale={scale}>
      <Axis name="value" grid={false} />
      <Tooltip shared showCrosshairs />
      <Line position="time*value" color="name" shape="smooth" />
      <Annotation.Text position={['50%', '50%']} {...(dataMarkerCfg as any)} />
    </Chart>
  );
};

export default HSGT;
