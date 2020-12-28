import FlashNewsDaemon from '../FlashNewsDaemon';
import NewsFlushServiceAbstractClass from '../NewsFlushServiceAbstractClass';
import axios from 'axios';
import { formatDateTime } from '../../../shared/utils';

type XuanGuBaoMessage = {
  title: string;
  summary: string;
  impact: number;
  bkj_infos?: any[];
  created_at: number;
  id: number;
};

const NEWS_FLASH_URL = 'https://baoer-api.xuangubao.cn/api/v6/message/newsflash';

export default class XuanGuBaoFlushService extends NewsFlushServiceAbstractClass {
  isStop: boolean = false;
  subjectIds: number[] = [35, 469]; // 盘中异动，市场机会
  lastestId: number = -1;
  pollingTimer: NodeJS.Timeout | undefined;
  constructor(readonly daemon: FlashNewsDaemon) {
    super(daemon);
    this.polling();
  }
  polling() {
    if (this.isStop) return;
    axios
      .get(NEWS_FLASH_URL, {
        params: {
          limit: 20,
          subj_ids: this.subjectIds.join(','),
          has_explain: false,
          platform: 'pcweb',
        },
      })
      .then((res) => {
        const { data } = res;
        if (data.code === 20000) {
          const { messages } = data.data;
          if ((messages as XuanGuBaoMessage[]).length) {
            const tempArr: XuanGuBaoMessage[] = [];
            let _lastestId = messages[0].id;
            messages.every((msg: XuanGuBaoMessage) => {
              if (msg.id !== this.lastestId) {
                // this._print(msg);
                tempArr.push(msg);
                return true;
              }
            });

            // 输出需要反转一下时间轴
            tempArr.reverse().forEach((msg) => this._print(msg));

            this.lastestId = _lastestId;
          }
          this.pollingTimer = setTimeout(this.polling.bind(this), 10000);
        } else {
          console.error(data.message);
        }
      })
      .catch((e) => {
        console.error(e);
        this.pollingTimer = setTimeout(this.polling.bind(this), 5000);
      });
  }
  _print(msg: XuanGuBaoMessage) {
    // let content = `${msg.title}`;
    let impact = '';
    let bkjStr = '';
    if (msg.impact !== 0) {
      impact = msg.impact === 1 ? '【利多 🚀️ 】' : '【利空 🍜️ 】';
    }

    if (msg.bkj_infos?.length) {
      bkjStr = `相关板块：${msg.bkj_infos.map((bkj) => `[${bkj.name}]`).join(' - ')}\r\n`;
    }

    this.print(
      `${msg.title} ${impact} \r\n${msg.summary}\r\n${bkjStr}[选股宝 - ${formatDateTime(
        new Date(msg.created_at * 1000)
      )}]`
    );
  }
  destory(): void {
    console.log('销毁 选股宝 快讯服务');
    this.pollingTimer && clearTimeout(this.pollingTimer);
    this.isStop = true;
  }
}
