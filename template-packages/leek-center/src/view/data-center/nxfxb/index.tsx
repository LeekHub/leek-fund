import toFixed from '@/utils/toFixed';
import ProCard, { StatisticCard } from '@ant-design/pro-card';
import RcResizeObserver from 'rc-resize-observer';
import HSGT from './HSGT';
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
        <ProCard>
          <h2 className="fontColor">今日热门主题</h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: 600,
            }}
          >
            {nxfxbData.hotThemeData?.map((item: any) => {
              return (
                <div>
                  {item.CategoryName}
                  <span
                    style={{ color: item.CZDF > 0 ? '#ff5957' : '#36c361' }}
                  >
                    {' '}
                    {item.CZDF > 0 && '+'}
                    {toFixed(item.CZDF)}%
                  </span>
                  （{item.SecurityName}
                  <span
                    style={{ color: item.CZDF > 0 ? '#ff5957' : '#36c361' }}
                  >
                    {' '}
                    {item.CZDF > 0 && '+'}
                    {toFixed(item.SZDF)}%
                  </span>
                  ）
                </div>
              );
            })}
          </div>
        </ProCard>
        <StatisticCard
          title="涨跌分布统计"
          chart={
            <UpDownChart data={nxfxbData.updownData as Record<string, any>} />
          }
        />
        <StatisticCard
          title="沪深港通"
          chart={<HSGT data={nxfxbData.hsgtData as Record<string, any>} />}
        />
      </ProCard>
    </RcResizeObserver>
  );
};

export default NxfxbPage;
