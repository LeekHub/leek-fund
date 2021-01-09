import { Event, Webview } from 'vscode';
import * as WebSocket from 'ws';
import globalState from '../globalState';

/**
 * Webview 开发时，通过 WS 传递消息
 * @param entity 
 * @param options 
 * @returns
 */
export function transceiverFactory(
  entity: Webview,
  options = {
    port: 3500,
  }
): Pick<Webview, 'onDidReceiveMessage' | 'postMessage'> {
  // 开发环境
  if (globalState.isDevelopment) {
    const wss = new WebSocket.Server({
      port: options.port,
    });

    const cws = new Set<WebSocket>();
    const postMessage = (message: any) => {
      cws.forEach((ws) => {
        ws.send(message);
      });
      return Promise.resolve(true);
    };
    let listener: undefined | ((e: any) => any);
    const onDidReceiveMessage: Event<any> = function (_listener) {
      listener = _listener;
      return {
        dispose: () => {
          listener = void 0;
        },
      };
    };
    wss.on('connection', (ws) => {
      cws.add(ws);
      ws.on('message', function incoming(message) {
        if (listener) {
          listener(message);
        }
      });
      ws.on('close', () => {
        cws.delete(ws);
      });
    });

    return {
      postMessage,
      onDidReceiveMessage,
    };
  } else {
    return {
      onDidReceiveMessage: entity.onDidReceiveMessage.bind(entity),
      postMessage: entity.postMessage.bind(entity),
    };
  }
}
