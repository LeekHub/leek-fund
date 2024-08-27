import * as WebSocket from 'ws';
import globalState from '../../../globalState';
import FlashNewsDaemon from '../FlashNewsDaemon';
import NewsFlushServiceAbstractClass from '../NewsFlushServiceAbstractClass';

const MSG_NEWS_FLASH = 1e3;

export default class Jin10FlushService extends NewsFlushServiceAbstractClass {
  private ws: WebSocket | undefined;
  private isDone: boolean = false;
  private heartbeatTimer: NodeJS.Timeout | undefined;
  private idIndexs: string[] = [];
  constructor(readonly daemon: FlashNewsDaemon) {
    super(daemon);
    try {
      this.init();
    } catch (err) {
      console.error(err);
    }
  }
  init() {
    this.openSocket();
  }
  openSocket() {
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = void 0;
    }
    const ws = new WebSocket('wss://wss-flash-2.jin10.com/');
    this.ws = ws;
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', (msg: { data: Iterable<number> }) => {
      try {
        this.processData(Buffer.from(new Uint8Array(msg.data)));
      } catch (err) {
        console.error(err);
      }
    });
    ws.addEventListener('open', () => {
      console.log('金十快讯 ws 打开');
      this.sendHeartbeat();
    });

    ws.addEventListener('error', (err: any) => {
      globalState.telemetry.sendEvent('error:jin10Service', { error: err });
      console.log("🚀 ~ 金十快讯 ws 错误：Jin10FlushService ~ ws.addEventListener ~ err:", err);
    });

    ws.addEventListener('close', () => {
      console.log('金十快讯 ws 关闭');
      if (!this.isDone) {
        this.ws = void 0;
        setTimeout(() => this.init(), 10000);
      }
    });
  }
  destroy() {
    console.log('销毁 金十 快讯服务');
    this.isDone = true;
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }
  pause() { }
  private sendHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return false;
      }
      this.ws.send('');
    }, 10000);
  }
  /**
   * 是否广告
   * @param content
   */
  private isAD(content: string) {
    return /^<a.*?>\s*<img.*?\/><\/a>$/.test(content);
  }
  private processData(bf: Buffer) {
    const type = bf.readUInt16LE();
    const dataLen = bf.readUInt16LE(2);
    if (type === MSG_NEWS_FLASH) {
      const data = JSON.parse(bf.toString('utf-8', 4, 4 + dataLen));
      console.log('金十快讯: ', data);
      const { type, time, id, action, channel } = data;
      if (
        ~this.idIndexs.indexOf(id) ||
        action !== 1 ||
        !(channel.includes(1) || channel.includes(5)) ||
        this.isAD(data.data.content)
      )
        return;
      this.idIndexs.push(id);
      // console.log('data: ', data);
      // if (!important) return; // 去掉判断显示更多的内容

      const contentSuffix = `（https://flash.jin10.com/detail/${id}）\r\n[金十快讯 - ${time}]`;

      if (type === 0) {
        const content = this.formatContent(data.data.content);
        content &&
          this.print(`${content}${contentSuffix}`, {
            type: 'jin10',
            data,
            time: new Date(data.time).getTime(),
          });
      }
      if (type === 1) {
        const { country, time_period, name, actual, unit } = data.data;
        this.print(`${country}${time_period}${name}:${actual}${unit}${contentSuffix}`, {
          type: 'jin10',
          data,
          time: new Date(data.time).getTime(),
        });
      }
    }
  }

  private formatContent(content: string) {
    let result = content.replace(/<br\/>/gi, '\r\n　　').replace(/(<([^>]+)>)/gi, '');
    if (result[0] === '【') {
      result = result.replace('】', '】\r\n　　');
    } else {
      result = '　　' + result;
    }
    return result;
  }

  private getRemarkLink(remark: any[] = []) {
    for (let index = 0; index < remark.length; index++) {
      const element = remark[index];
      if (element.type === 'link') {
        return element.link;
      }
    }
    return null;
  }
}
