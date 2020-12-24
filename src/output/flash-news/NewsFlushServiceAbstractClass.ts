import { events } from '../../shared/utils';

import { OutputChannel } from 'vscode';
import FlashNewsDaemon from './FlashNewsDaemon';
export default abstract class NewsFlushServiceAbstractClass {
  constructor(readonly daemon: FlashNewsDaemon) {
    try {
      events.on('FlashNewsServices#stop', () => {
        this.stop();
      });
    } catch (err) {
      console.error(err);
    }
  }
  abstract stop(): void;
  pause() {}
  print(content: string) {
    this.daemon.print(`${content}`);
  }
}
