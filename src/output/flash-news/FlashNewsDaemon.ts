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

  isDestroy = false;

  constructor() {
    this.initServices();
  }

  static KillAllServer() {
    if (instance) {
      instance.depServers.forEach((dep) => {
        dep.destroy();
        instance?.depServers.delete(dep);
      });
      instance.destroy();
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

    if (instance.isDestroy) {
      instance.initServices();
    }
    return function cancelServer() {
      instance?.depServers.delete(dep);
      instance?.tryDestroy();
    };
  }

  initServices() {
    // 暂时不要金十快讯，金十更适合期货。
    this.flushServices.add(new Jin10FlushService(this));
    this.flushServices.add(new XuanGuBaoFlushService(this));
    this.isDestroy = false;
  }

  print(news: string, source?: { type: string; data: any; time: number }) {
    this.caches.unshift([news, source]);
    this.caches.slice(0, 30);
    this.depServers.forEach((dep) => {
      dep.print(news, source);
    });
  }

  tryDestroy() {
    if (this.depServers.size < 1) {
      this.destroy();
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.caches.length = 0
    this.flushServices.forEach((service) => {
      service.destroy();
    });
    this.isDestroy = true;
  }

  reload() {}
}
