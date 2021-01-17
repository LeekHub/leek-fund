import { OutputChannel, StatusBarAlignment, StatusBarItem, window } from 'vscode';
import { LeekFundConfig } from '../../shared/leekConfig';
import { events } from '../../shared/utils';
import Jin10FlushService from './impl/Jin10FlushService';
import XuanGuBaoFlushService from './impl/XuanGuBaoFLushServices';
import NewsFlushServiceAbstractClass, {
  FlashNewsServerInterface,
} from './NewsFlushServiceAbstractClass';

const throttle = require('lodash.throttle');
let instance: FlashNewsDaemon | undefined;

export default class FlashNewsDaemon {
  public depServers = new Set<FlashNewsServerInterface>();
  public flushServices = new Set<NewsFlushServiceAbstractClass>();
  public caches: any[][] = [];

  isDestory = false;

  constructor() {
    this.initServices();
  }

  static KillAllServer() {
    if (instance) {
      instance.depServers.forEach((dep) => {
        dep.destory();
        instance?.depServers.delete(dep);
      });
      instance.destory();
    }
  }

  static registerServer(dep: FlashNewsServerInterface) {
    if (!instance) {
      instance = new FlashNewsDaemon();
    }

    instance.depServers.add(dep);
    instance.caches.reverse().forEach((params) => {
      return dep.print.apply(dep, [params[0], params[1]]);
    });

    if (instance.isDestory) {
      instance.initServices();
    }
    return function cancelServer() {
      instance?.depServers.delete(dep);
      instance?.tryDestory();
    };
  }

  initServices() {
    // 暂时不要金十快讯，金十更适合期货。
    this.flushServices.add(new Jin10FlushService(this));
    this.flushServices.add(new XuanGuBaoFlushService(this));
    this.isDestory = false;
  }

  print(news: string, source?: { type: string; data: any; time: number }) {
    this.caches.unshift([news, source]);
    this.caches.slice(0, 30);
    this.depServers.forEach((dep) => {
      dep.print(news, source);
    });
  }

  tryDestory() {
    if (this.depServers.size < 1) {
      this.destory();
    }
  }

  /**
   * 销毁
   */
  destory() {
    this.caches.length = 0
    this.flushServices.forEach((service) => {
      service.destory();
    });
    this.isDestory = true;
  }

  reload() {}
}
