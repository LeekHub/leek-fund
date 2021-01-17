import { classes } from '@/utils/ui';
import React from 'react';
import { NewsItemFunctionComponent } from '.';
import includes from 'lodash/includes';

/**
 * 板块
 */
function renderBK(bkj_infos: undefined | Record<string, string>[]) {
  if (!bkj_infos || !bkj_infos.length) return null;
  return (
    <div className="flash-news-bk">
      相关板块：
      {bkj_infos.map((bk) => (
        <span key={bk.id}>{bk.name}</span>
      ))}
    </div>
  );
}

/**
 * 个股
 */
function renderStocks(all_stocks: undefined | Record<string, string>[]) {
  if (!all_stocks || !all_stocks.length) return null;
  return (
    <div className="flash-news-stock">
      相关个股：
      {all_stocks.map((stock) => (
        <span key={stock.symbol}>
          <span className="name">{stock.name}</span> {stock.symbol}
        </span>
      ))}
    </div>
  );
}

const XuanGuBaoNewsItem: NewsItemFunctionComponent = function ({ news }) {
  let impact = '';
  if (news.impact !== 0) {
    impact = news.impact === 1 ? '【利多 🚀️ 】' : '【利空 🍜️ 】';
  }

  return (
    <>
      <div
        className={classes(
          'flash-news-title',
          news.impact === 1 ? 'red' : '',
          news.impact === -1 ? 'green' : ''
        )}
      >
        {impact}
        {news.title}
      </div>
      <div className="flash-news-summary">{news.summary}</div>
      {renderBK(news.bkj_infos)}
      {renderStocks(news.all_stocks)}
    </>
  );
};

XuanGuBaoNewsItem.filter = function (filter: string[], news: any) {
  return filter.some((type) => {
    return includes(news?.subj_ids ?? [], parseInt(type));
  });
};

export default XuanGuBaoNewsItem;
