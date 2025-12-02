import axios from 'axios';

export interface JYGArticleItem {
  title: string;
  content: string;
  warn_words: string | null;
  create_time?: string;
  article_id?: string;
}

async function getJYGTokenFromETag(): Promise<string> {
  try {
    const url = 'https://hm.baidu.com/hm.js?58aa18061df7855800f2a1b32d6da7f4';
    const res = await axios.get(url, {
      responseType: 'text',
      headers: {
        Cookie: 'HMACCOUNT=50E5CAF378DF1999; HMACCOUNT_BFESS=50E5CAF378DF1999',
        Referer: 'https://www.jiuyangongshe.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
      validateStatus: () => true,
    });
    const headers = res.headers || {} as any;
    const etag: string | undefined = headers['etag'] || headers['ETag'] || headers['Etag'];
    return etag ? String(etag).replace(/(^\"|\"$)/g, '') : '';
  } catch (e) {
    return '';
  }
}

export async function fetchJYGNewsByCode(stockName: string, limit = 15, start = 0): Promise<JYGArticleItem[]> {
  const safeCode = (stockName || '').trim();
  if (!safeCode) return [];

  // 第一步：获取 token（使用 ETag）
  const tokenFromEnv = process.env.JYG_TOKEN || '';
  const token = tokenFromEnv || await getJYGTokenFromETag();
  const timestamp = Date.now().toString();

  try {
    const url = 'https://app.jiuyangongshe.com/jystock-app/api/v2/article/search';
    const payload = {
      back_garden: 0,
      keyword: safeCode,
      order: 1,
      limit: 15,
      start: 0,
      type: '1',
    } as const;

    const res = await axios.post(url, payload, {
      headers: {
        Origin: 'https://www.jiuyangongshe.com',
        platform: '3',
        timestamp,
        token,
        'Content-Type': 'application/json',
        Referer: 'https://www.jiuyangongshe.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
      timeout: 15000,
      validateStatus: () => true,
    });

    if (!res || res.status >= 400) {
      console.error('JYG search HTTP error', res && res.status, res && res.statusText);
      return [];
    }

    const data = res.data || {};
    if (data.errCode && data.errCode !== '0') {
      console.error('JYG search API errCode', data.errCode, data.msg);
    }
    const result: any[] = data?.data?.result || [];
    if (!Array.isArray(result) || result.length === 0) return [];

    const items: JYGArticleItem[] = [];
    for (const it of result) {
      const item: JYGArticleItem = {
        title: it?.title ?? '',
        content: it?.content ?? '',
        warn_words: (it?.warn_words ?? null),
        create_time: it?.create_time,
        article_id: it?.article_id,
      };
      items.push(item);
    }
    return items;
  } catch (e) {
    console.error('fetchJYGNewsByCode error', e);
    return [];
  }
}

export default {
  fetchJYGNewsByCode,
};

// yarn compile
// node -e '(async()=>{const m=require("./out/webview/jiuyangongshe-news.js");await (m.testJYGNews||(m.default&&m.default.testJYGNews))("sh601633",3,0)})()'

export async function testJYGNews(stockCode: string = '601633', limit = 5, start = 0) {
  try {
    const items = await fetchJYGNewsByCode(stockCode, limit, start);
    console.log(`JYG test -> code=${stockCode}, items=${items.length}`);
    console.log(
      JSON.stringify(
        items.slice(0, Math.min(3, items.length)).map((x) => ({
          title: x.title,
          warn_words: x.warn_words,
          content: x.content && x.content.slice(0, 200),
          create_time: x.create_time,
          article_id: x.article_id,
        })),
        null,
        2
      )
    );
    return items;
  } catch (e) {
    console.error('testJYGNews error', e);
    return [];
  }
}


