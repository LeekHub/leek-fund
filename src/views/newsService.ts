import axios from 'axios';
import { TreeItem, Uri, workspace } from 'vscode';
import { randHeader } from '../utils';

export class NewsTreeItem extends TreeItem {}

export class NewsService {
  constructor() {}

  async getNewsUserList(userIds: string[]): Promise<NewsTreeItem[]> {
    const treeItems = [];
    const promiseList = [];
    const headers = {};
    const config = workspace.getConfiguration();
    const xueqiuCookie = config.get('leek-fund.xueqiuCookie');
    Object.assign(headers, randHeader(), { Cookie: xueqiuCookie });
    for (let userId of userIds) {
      const url = `https://xueqiu.com/statuses/original/show.json?user_id=${userId}`;
      const p = axios.get(url, { headers });
      promiseList.push(p.catch((err) => console.log(err)));
    }
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
    return treeItems;
  }

  async getNewsData(userId: string): Promise<any[]> {
    let newsList: any[] = [];
    const url = `https://xueqiu.com/v4/statuses/user_timeline.json?page=1&user_id=${userId}`;
    const headers = {};
    const config = workspace.getConfiguration();
    const xueqiuCookie = config.get('leek-fund.xueqiuCookie');
    Object.assign(headers, randHeader(), { Cookie: xueqiuCookie });
    const result = await axios.get(url, { headers }).catch((err) => console.error(err));
    if (result && result.status === 200) {
      const {
        data: { statuses },
      } = result;
      newsList = [...statuses];
    }

    return newsList;
  }
}
