import { OutputChannel } from 'vscode';
import * as WebSocket from 'ws';
import FlashNewsDaemon from '../FlashNewsDaemon';
import NewsFlushServiceAbstractClass from '../NewsFlushServiceAbstractClass';

const MSG_NEWS_FLASH = 1e3;

export default class Jin10FlushService extends NewsFlushServiceAbstractClass {
  private ws: WebSocket | undefined;
  private isDone: boolean = false;
  private heartbeatTimer: NodeJS.Timeout | undefined;
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
    const ws = new WebSocket('wss://wss-flash-1.jin10.com/');
    this.ws = ws;
    console.log('init ws:', this);
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', (msg) => {
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

    ws.addEventListener('error', (err) => {
      console.log('金十快讯 ws 错误：', err);
    });

    ws.addEventListener('close', () => {
      console.log('金十快讯 ws 关闭');
      if (!this.isDone) {
        this.ws = void 0;
        this.init();
      }
    });
  }
  stop() {
    this.isDone = true;
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.ws?.close();
  }
  pause() {}
  private sendHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return false;
      }
      this.ws.send('');
    }, 10000);
  }
  private processData(bf: Buffer) {
    const type = bf.readUInt16LE();
    const dataLen = bf.readUInt16LE(2);
    if (type === MSG_NEWS_FLASH) {
      const data = JSON.parse(bf.toString('utf-8', 4, 4 + dataLen));
      const { type, time, important, remark, id } = data;
      console.log('data: ', data);
      if(!important) return;

      const contentSuffix = `（https://flash.jin10.com/detail/${id}）\r\n[金十快讯 - ${time}]`;

      if (type === 0) {
        const content = this.formatContent(data.data.content);
        content && this.print(`${content}${contentSuffix}`);
      }
      if (type === 1) {
        this.print(
          `${data.country}${data.time_period}${data.name}:${data.actual}${data.unit}${contentSuffix}`
        );
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
