import React, { useMemo } from 'react';
import { Statistic, StatisticCard } from '@ant-design/pro-card';
import { pick, sum } from 'lodash';

const { Divider } = StatisticCard;

const UpDownStatistic = ({ data = {} }: { data: Record<string, any> }) => {
  const total = useMemo(() => {
    return sum(Object.values(pick(data, ['up', 'down', 'r0'])));
  }, [data]);
  return (
    <StatisticCard.Group>
      <StatisticCard
        statistic={{
          title: '全部',
          tip: '当天开盘上市公司数量',
          value: total,
        }}
      />
      <Divider />
      <StatisticCard
        statistic={{
          title: '上涨',
          value: data?.up,
          valueStyle: { color: '#f22323' },
        }}
      />
      <StatisticCard
        statistic={{
          title: '涨停',
          value: data?.t,
          valueStyle: { color: '#f22323' },
          description: (
            <Statistic title="自然涨停" value={data?.tn} trend="up" />
          ),
        }}
      />
      <StatisticCard
        statistic={{
          title: '下跌',
          value: data?.down,
          suffix: '',
          valueStyle: { color: '#00A000' },
        }}
      />
      <StatisticCard
        statistic={{
          title: '跌停',
          value: data?.b,
          suffix: '',
          valueStyle: { color: '#00A000' },
        }}
      />
    </StatisticCard.Group>
  );
};

export default UpDownStatistic;
