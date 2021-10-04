import { Axis, Chart, Interaction, Interval, Legend, Tooltip } from 'bizcharts';
import { useMemo } from 'react';

function dataConvert(obj: any = {}) {
  return [
    { type: '涨停', value: obj.t, marked: false },
    { type: '涨停~5%', value: obj.rp10, marked: false },
    { type: '5%~1%', value: obj.rp5, marked: false },
    { type: '1%~0%', value: obj.rp01, marked: false },
    { type: '平盘', value: obj.rp0, marked: true },
    { type: '0%~-1%', value: obj.rn01, marked: true },
    { type: '-1%~-5%', value: obj.rn1, marked: true },
    { type: '-5%~跌停', value: obj.rn5, marked: true },
    { type: '跌停', value: obj.b, marked: true },
  ];
}

const scale = {
  value: {
    alias: '涨跌分布统计',
    nice: true,
    formatter: (val: string) => {
      return `${val} 家`;
    },
  },
};

const axisCfg = {
  axis: false,
  title: {
    style: {
      fontSize: '14',
      fill: '#ff5957',
      fontWeight: 'bold',
    },
  },
};

function UpDownChart({ data }: { data: Record<string, any> }) {
  const barData = useMemo(() => {
    return dataConvert(data);
  }, [data]);
  return (
    <Chart padding={[60]} autoFit height={360} data={barData} scale={scale}>
      <Axis name="type" />
      <Axis name="value" {...(axisCfg as any)} visible={false} line={false} />
      <Interaction type="active-region" />

      <Tooltip showCrosshairs showMarkers={false} />
      <Interval
        position="type*value"
        color={[
          'type*value*marked',
          (type: number, value: number | string, marked: boolean) => {
            return marked ? '#36c361' : '#ff5957';
          },
        ]}
        label={[
          'type*value',
          (type: number, value: any) => {
            return {
              style: { color: '#fff' },
              content: (originData: any) => {
                /*  if (originData.type === '涨停') {
                  return null;
                } */
                return `${value} 家`;
              },
            };
          },
        ]}
      />
      <Legend visible={false} />
      {/* <Annotation.DataMarker {...(dataMarkerCfg as any)} /> */}
    </Chart>
  );
}

export default UpDownChart;
