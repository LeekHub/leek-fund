import Axios from 'axios';
import { TreeItem, Uri } from 'vscode';
import { randHeader } from '../shared/utils';
import { defaultXueQiuHeaders, getXueQiuToken } from '../shared/xueqiu-helper';


export class NewsTreeItem extends TreeItem { }

export class NewsService {
  private cookies = `device_id=${Math.random().toString(36).substring(2, 15)}`;
  constructor() {
    this.init();
  }

  get headers() {
    return {
      ...defaultXueQiuHeaders,
      ...randHeader(),
      Cookie: this.cookies,
    };
  }

  async init() {
    const c = await getXueQiuToken();
    this.cookies = c;
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
