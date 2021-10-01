import ProCard, { StatisticCard } from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';
import { useFetchNxfxbInfo } from './services';
import UpDownChart from './UpDownChart';
import UpDownStatistic from './UpDownStatistic';

const NxfxbPage = () => {
  const { nxfxbData } = useFetchNxfxbInfo();

  return (
    <RcResizeObserver key="resize-observer">
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
