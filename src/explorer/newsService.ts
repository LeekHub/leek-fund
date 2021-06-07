import Axios from 'axios';
import { Tracing } from 'trace_events';
import { TreeItem, Uri, workspace } from 'vscode';
import { randHeader } from '../shared/utils';

export class NewsTreeItem extends TreeItem {}

export class NewsService {
  private cookies: string = '';
  constructor() {
    this.init();
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
          .filter((h: string) => h != '')
          .join(';') + ';';
    });
  }

  async getNewsUserList(userIds: string[]): Promise<NewsTreeItem[]> {
    const treeItems = [];
    const promiseList = [];
    const headers = {};
    const config = workspace.getConfiguration();
    Object.assign(headers, randHeader(), { Cookie: this.cookies });
    for (let userId of userIds) {
      const url = `https://xueqiu.com/statuses/original/show.json?user_id=${userId}`;
      const p = Axios.get(url, { headers });
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
    const headers = {};
    const config = workspace.getConfiguration();
    Object.assign(headers, randHeader(), { Cookie: this.cookies });
    try {
      const result = await Axios.get(url, { headers }).catch((err) => console.error(err));
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
