import { events } from '../../shared/utils';
import FlashNewsDaemon from './FlashNewsDaemon';

/**
 * 获取新闻刷新服务的抽象类
 */
export default abstract class NewsFlushServiceAbstractClass {
  constructor(readonly daemon: FlashNewsDaemon) {}
  abstract destory(): void;
  pause() {}
  print(content: string, source: { type: string; data: any; time: number }) {
    this.daemon.print(`${content}`, source);
  }
}

/**
 * 具体服务的接口方法
 */
export interface FlashNewsServerInterface {
  print: (content: string, source?: any) => void;
  destory: () => void;
}
