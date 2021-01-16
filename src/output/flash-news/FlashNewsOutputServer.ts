import throttle = require('lodash.throttle');
import { OutputChannel, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekFundConfig } from '../../shared/leekConfig';
import FlashNewsDaemon from './FlashNewsDaemon';
import { FlashNewsServerInterface } from './NewsFlushServiceAbstractClass';

export default class FlashNewsOutputServer implements FlashNewsServerInterface {
  flashNewsBarItem: StatusBarItem | undefined;
  public op: OutputChannel | undefined;
  public newsCount: number = 0;

  isEnableOutput: boolean = false;
  newsCache: string[] = [];
  unregisterServer: (() => void) | undefined;

  constructor() {
    this.isEnableOutput = LeekFundConfig.getConfig('leek-fund.flash-news');
    this.updateNewsBarItem = throttle(this.updateNewsBarItem, 1000);
    this.setup();
  }

  setup() {
    if (this.isEnableOutput) {
      this.op = window.createOutputChannel('韭菜盒子 - 快讯');
      this.flashNewsBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 3);
      this.flashNewsBarItem.text = `⚡️️ ${this.newsCount}`;
      this.flashNewsBarItem.command = 'leek-fund.flash-news-show';
      this.flashNewsBarItem.show();
      this.unregisterServer = FlashNewsDaemon.registerServer(this);
    }
  }

  reload() {
    const _enable: boolean = LeekFundConfig.getConfig('leek-fund.flash-news');
    if (this.isEnableOutput !== _enable) {
      this.isEnableOutput = _enable;
      if (!_enable) {
        this.destory()
      } else {
        this.setup();
      }
    }
  }

  destory() {
    this.newsCount = 0;
    this.newsCache.length = 0;
    this.unregisterServer?.();
    this.op?.dispose();
    this.flashNewsBarItem?.dispose();
  }

  print(news: string) {
    if (!this.isEnableOutput) return;
    this.newsCount++;
    this.newsCache.push(news);
    this.newsCache = this.newsCache.slice(-5);
    this.updateNewsBarItem();
    this.op?.appendLine(`${news}\r\n-----------------------------`);
  }

  updateNewsBarItem() {
    if (this.flashNewsBarItem) {
      this.flashNewsBarItem.text = `⚡️️ ${this.newsCount}`;
      this.flashNewsBarItem.tooltip = `${this.newsCache.join(
        '\r\n-----------------------------\r\n'
      )}`;
      this.flashNewsBarItem.show();
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
