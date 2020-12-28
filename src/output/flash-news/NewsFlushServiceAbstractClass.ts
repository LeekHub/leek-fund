import { events } from '../../shared/utils';
import FlashNewsDaemon from './FlashNewsDaemon';

export default abstract class NewsFlushServiceAbstractClass {
  constructor(readonly daemon: FlashNewsDaemon) {
    try {
      events.once('FlashNewsServices#destory', () => {
        this.destory();
      });
    } catch (err) {
      console.error(err);
    }
  }
  abstract destory(): void;
  pause() {}
  print(content: string) {
    this.daemon.print(`${content}`);
  }
}
