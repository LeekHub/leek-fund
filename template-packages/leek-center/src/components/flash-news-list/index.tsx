import React from 'react';
import { Timeline } from 'antd';
import { useObserver } from 'mobx-react';
import store from '@/stores/index';
import dayjs from 'dayjs';
import XuanGuBaoNewsItem from './xuangubao-news-item';
import Jin10NewsItem from './jin10-news-item';

import './index.less';

const NewsTypeMapComponents = {
  xgb: XuanGuBaoNewsItem,
  jin10: Jin10NewsItem,
};

export type NewsItemFunctionComponent = React.FC<{
  news: any;
}> & { filter: (filter: string[], news: any) => boolean };

type NewsType = {
  type: keyof typeof NewsTypeMapComponents;
  time: number;
  data: any;
};

function filterNews(newsFilter: Record<string, string[]>, news: any) {
  const filter = newsFilter[news.type];
  if (!filter) return false;
  const com =
    NewsTypeMapComponents[news.type as keyof typeof NewsTypeMapComponents];

  return com.filter(filter, news.data);
}

export default function FlashNewsList({
  newsFilter,
}: {
  newsFilter: Record<string, string[]>;
}) {
  const dateSet = new Set<string>();
  return useObserver(() => {
    const newsList = store.news.newsList.filter((news) =>
      filterNews(newsFilter, news)
    );
    console.log('newsList: ', newsList);
    if (!newsList.length) {
      return (
        <div style={{ padding: '100px 0' }} className="empty">
          没有任何数据
        </div>
      );
    }
    return (
      <div style={{ padding: '20px 0' }}>
        <Timeline>
          {newsList.map((news: NewsType) => {
            const ItemComponent: NewsItemFunctionComponent =
              NewsTypeMapComponents[news.type];
            const dayOB = dayjs(news.time);

            let dateCom = null;
            const date = dayOB.format('YYYYMMDD');
            if (!dateSet.has(date)) {
              dateSet.add(date);
              dateCom = (
                <Timeline.Item dot={null}>
                  <div className="flash-news-date red">
                    {dayOB.format('YYYY年MM月DD日')}
                  </div>
                </Timeline.Item>
              );
            }

            return (
              <React.Fragment
                key={`${news.type}_${news.data.id}${
                  dateCom ? '_has-date' : ''
                }`}
              >
                {dateCom}
                <Timeline.Item>
                  <div className="flash-news">
                    <div className="flash-news-time">
                      {dayOB.format('HH:mm:ss')}
                    </div>
                    <div className="flash-news-com">
                      <ItemComponent news={news.data}></ItemComponent>
                    </div>
                  </div>
                </Timeline.Item>
              </React.Fragment>
            );
          })}
        </Timeline>
      </div>
    );
  });
}
