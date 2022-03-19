import Axios from 'axios';
import { TreeItem, Uri } from 'vscode';
import { randHeader } from '../shared/utils';

const defaultHeaders = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'max-age=0',
  Connection: 'keep-alive',
  Host: 'xueqiu.com', // 股票的话这里写 stock.xueqiu.com
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': 1,
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36};',
};

export class NewsTreeItem extends TreeItem {}

export class NewsService {
  private cookies = `device_id=${Math.random().toString(36).substring(2, 15)}`;
  constructor() {
    this.init();
  }

  get headers() {
    return {
      ...defaultHeaders,
      ...randHeader(),
      Cookie: this.cookies,
    };
  }

  init() {
    Axios.get(`https://xueqiu.com/`).then((response) => {
      const cookiesHeader = response.headers['set-cookie'];
      this.cookies +=
        cookiesHeader
          .map((h: string) => {
            let content = h.split(';')[0];
            return content.endsWith('=') ? '' : content;
          })
          .filter((h: string) => h !== '')
          .join(';') + ';';
    });
  }

  async getNewsUserList(userIds: string[]): Promise<NewsTreeItem[]> {
    const treeItems = [];
    const promiseList = [];
    for (let userId of userIds) {
      const url = `https://xueqiu.com/statuses/original/show.json?user_id=${userId}`;
      const p = Axios.get(url, { headers: this.headers });
      promiseList.push(p.catch((err) => console.log(err)));
    }
    try {
      const result: any = await Promise.all(promiseList);
      for (let item of result) {
        if (item && item.status === 200) {
          const {
            data: { user },
          } = item;
          const treeItem = new NewsTreeItem(user.screen_name);
          treeItem.id = `${user.id}`;
          treeItem.tooltip = user.description;
          const images = user.profile_image_url.split(',');
          treeItem.iconPath = Uri.parse(`https:${user.photo_domain}${images[images.length - 1]}`);
          treeItem.command = {
            title: user.screen_name,
            command: 'leek-fund.newItemClick',
            arguments: [user.screen_name, user.id],
          };
          treeItems.push(treeItem);
        }
      }
    } catch (e) {
      console.log(e);
      this.init();
    }
    return treeItems;
  }

  async getNewsData(userId: string): Promise<any[]> {
    let newsList: any[] = [];
    const url = `https://xueqiu.com/v4/statuses/user_timeline.json?page=1&user_id=${userId}`;
    try {
      const result = await Axios.get(url, { headers: this.headers }).catch((err) =>
        console.error(err)
      );
      if (result && result.status === 200) {
        const {
          data: { statuses },
        } = result;
        newsList = [...statuses];
      } else {
        this.init();
      }
    } catch (e) {
      console.log(e);
      this.init();
    }
    return newsList;
  }
}
