import { classes } from '@/utils/ui';
import React from 'react';
import { NewsItemFunctionComponent } from '.';

function isTagNews(content: string) {
  return /^【(报道|行情)】/.test(content);
}

function pickTitleAndSummary(content: string) {
  const result: Record<string, string> = {};
  if (content[0] === '【' && !isTagNews(content)) {
    result.title = content.substring(0, content.indexOf('】') + 1);
    result.summary = content.substring(content.indexOf('】') + 1);
  } else {
    result.title = content;
  }
  return result;
}

const Jin10NewsItem: NewsItemFunctionComponent = function ({ news }) {
  const { type, time, important, remark, id, data } = news;
  if (type === 0) {
    const contentNews = pickTitleAndSummary(data.content);
    return (
      <>
        <div
          className="flash-news-title"
          dangerouslySetInnerHTML={{ __html: contentNews.title }}
        ></div>
        <div
          className="flash-news-summary"
          dangerouslySetInnerHTML={{ __html: contentNews.summary }}
        ></div>
      </>
    );
  }
  return null;
};

Jin10NewsItem.filter = function (filter: string[], news: any) {
  return (
    (filter.includes('normal') && !news.important) ||
    (filter.includes('important') && news.important)
  );
};

export default Jin10NewsItem;
