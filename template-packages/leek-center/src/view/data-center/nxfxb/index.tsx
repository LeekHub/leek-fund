import ProCard, { StatisticCard } from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';
import React, { useState } from 'react';
import { useFetchNxfxbInfo } from './services';
import UpDownChart from './UpDownChart';
import UpDownStatistic from './UpDownStatistic';

const NxfxbPage = () => {
  const [responsive, setResponsive] = useState(false);

  const { nxfxbData, loading } = useFetchNxfxbInfo();

  return (
    <RcResizeObserver
      key="resize-observer"
      onResize={(offset) => {
        setResponsive(offset.width < 596);
      }}
    >
      <ProCard
        title="涨跌统计"
        extra={nxfxbData.updownData?.day}
        split={'horizontal'}
        headerBordered
      >
        <UpDownStatistic data={nxfxbData.updownData as Record<string, any>} />
        <StatisticCard
          title="涨跌分布统计"
          chart={
            <UpDownChart data={nxfxbData.updownData as Record<string, any>} />
          }
        />
      </ProCard>
    </RcResizeObserver>
  );
};

export default NxfxbPage;
