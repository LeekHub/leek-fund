import { OutputChannel, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekFundConfig } from '../../shared/leekConfig';
import { events } from '../../shared/utils';
import Jin10FlushService from './impl/Jin10FlushService';

export default class FlashNewsDaemon {
  public op: OutputChannel | undefined;
  public newsCount: number = 0;

  newsCache: string[] = [];

  isEnable: boolean = false;
  // private services: NewsFlushServiceAbstractClass[] = [];
  jin10Services: Jin10FlushService | undefined;
  flashNewsBarItem: StatusBarItem | undefined;

  constructor() {
    this.isEnable = LeekFundConfig.getConfig('leek-fund.flash-news');
    if (this.isEnable) {
      this.initServices();
    }
  }

  initServices() {
    this.op = window.createOutputChannel('韭菜盒子 - 快讯');
    this.flashNewsBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 3);
    this.flashNewsBarItem.text = `⚡️️ ${this.newsCount}`;
    this.flashNewsBarItem.command = 'leek-fund.flash-news-show';
    this.flashNewsBarItem.show();

    new Jin10FlushService(this);
  }

  print(news: string) {
    this.newsCount++;
    this.newsCache.push(news);
    this.newsCache = this.newsCache.slice(-3);
    if (this.flashNewsBarItem) {
      this.flashNewsBarItem.text = `⚡️️ ${this.newsCount}`;
      this.flashNewsBarItem.tooltip = `${this.newsCache.join(
        '\r\n-----------------------------\r\n'
      )}`;
      this.flashNewsBarItem.show();
    }
    this.op?.appendLine(`${news}\r\n-----------------------------`);
  }
  destory() {
    events.emit('FlashNewsServices#stop');
    this.newsCache.length = 0;
    this.newsCount = 0;
    this.flashNewsBarItem?.dispose();
    this.op?.dispose();
  }
  reload() {
    const _enable: boolean = LeekFundConfig.getConfig('leek-fund.flash-news');
    if (this.isEnable !== _enable) {
      this.isEnable = _enable;
      if (!_enable) {
        this.destory();
      } else {
        this.initServices();
      }
    }
  }
  showOutput() {
    this.op?.show();
    this.newsCount = 0;
    if (this.flashNewsBarItem) {
      this.flashNewsBarItem.text = `⚡️️ ${this.newsCount}`;
      this.flashNewsBarItem.show();
    }
  }
}
