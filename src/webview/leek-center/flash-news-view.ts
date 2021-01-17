import { Webview } from 'vscode';
import FlashNewsDaemon from '../../output/flash-news/FlashNewsDaemon';
import { FlashNewsServerInterface } from '../../output/flash-news/NewsFlushServiceAbstractClass';

export default class LeekCenterFlashNewsViewServer implements FlashNewsServerInterface {
  unregisterServer: (() => void) | undefined;
  constructor(readonly webview: Webview) {
    this.unregisterServer = FlashNewsDaemon.registerServer(this);
  }
  print(content: string, source?: any) {
    this.webview.postMessage({
      command: 'postFlashNews',
      data: source,
    });
  }
  destory() {
    this.unregisterServer?.();
  }
}
