import axios from 'axios';
import { Webview, window } from 'vscode';

export class FlashNewsService {
  constructor(private webview: Webview | null) {}

  public async fetchNewsData() {
    const NEWS_FLASH_URL = 'https://baoer-api.xuangubao.cn/api/v6/message/newsflash';
    const subjectIds = [9, 10, 723, 35, 469];

    // 获取最新20条消息用于实时更新
    const latestRes = await axios.get(NEWS_FLASH_URL, {
      params: {
        limit: 20,
        subj_ids: subjectIds.join(','),
        platform: 'pcweb',
      },
    });

    // 获取当天所有消息用于全量显示
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000);

    const allDayRes = await axios.get(NEWS_FLASH_URL, {
      params: {
        limit: 100,
        subj_ids: subjectIds.join(','),
        start_time: todayStartTimestamp,
        platform: 'pcweb',
      },
    });

    if (latestRes.data.code === 20000 && allDayRes.data.code === 20000) {
      const { messages, next_cursor } = latestRes.data.data;
      const allDayMessages = allDayRes.data.data.messages || [];

      // 对当天全量新闻进行去重
      const uniqueAllDayMessages: any[] = [];
      const seenIds = new Set<number>();

      allDayMessages.forEach((msg: any) => {
        if (!seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          uniqueAllDayMessages.push(msg);
        }
      });

      return {
        messages: messages,
        next_cursor: next_cursor,
        lastUpdate: Date.now(),
        allDayMessages: uniqueAllDayMessages
      };
    }
    throw new Error('API Error');
  }

  async getNewsData() {
    try {
      const data = await this.fetchNewsData();
      this.webview?.postMessage({
        command: 'newsData',
        data
      });
    } catch (err) {
      console.error('Fetch news error', err);
      // window.showErrorMessage('获取快讯失败'); // 既然是静默刷新，可以不弹窗或者减少打扰
      this.sendEmptyData();
    }
  }

  private sendEmptyData() {
    this.webview?.postMessage({
      command: 'newsData',
      data: {
        messages: [],
        allDayMessages: []
      },
    });
  }
}
