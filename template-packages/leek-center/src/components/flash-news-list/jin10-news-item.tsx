import { NewsItemFunctionComponent } from '.';

function isTagNews(content: string) {
  return /^【(报道|行情)】/.test(content);
}

function pickTitleAndSummary(content: string) {
  const result: Record<string, string> = {};
  if (content[0] === '【' && !isTagNews(content)) {
    const endTagIndex = content.indexOf('】');
    result.title = content.substring(0, endTagIndex + 1);
    result.summary = content
      .substring(endTagIndex + 1)
      .replace(/^<br\s*\/>/, '');
  } else {
    result.title = content;
  }
  return result;
}

const Jin10NewsItem: NewsItemFunctionComponent = function ({ news }) {
  const { type, data } = news;
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
        {data.pic ? (
          <div className="flash-news-pic">
            <a href={data.pic}>
              <img
                style={{
                  width: 256,
                  height: 144,
                  objectFit: 'cover',
                  objectPosition: 'top center',
                }}
                src={data.pic}
                alt=""
              />
            </a>
          </div>
        ) : null}
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
