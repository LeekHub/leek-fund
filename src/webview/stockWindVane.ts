import { ViewColumn, env, Uri } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import globalState from '../globalState';
import { getTemplateFileContent } from '../shared/utils';
import { getEastMoneyHost } from './proxyService/proxyConfig';

export class StockWindVaneView {
  private static instance: StockWindVaneView;
  private panel: any = null;

  private constructor() {}

  public static getInstance(): StockWindVaneView {
    if (!StockWindVaneView.instance) {
      StockWindVaneView.instance = new StockWindVaneView();
    }
    return StockWindVaneView.instance;
  }

  public show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = ReusedWebviewPanel.create(
      'stockWindVaneWebview',
      '选股风向标',
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    const initialRoute = '/data-center/stock-wind-vane';
    try {
      console.log('StockWindVaneView: 开始加载模板文件');
      console.log('StockWindVaneView: globalState.context', globalState.context);
      
      const html = getTemplateFileContent(['leek-center', 'build', 'index.html'], this.panel.webview);
      
      if (!html) {
        throw new Error('获取模板文件内容失败');
      }
      
      console.log('StockWindVaneView: 模板文件加载成功，长度:', html.length);
      
      // 只注入初始路由，URL通过消息传递获取
      const injectedScript = `
        <script>
          window.initialRoute = '${initialRoute}';
        </script>
      `;
      
      // 确保html是字符串并且包含<head>
      if (typeof html === 'string' && html.includes('<head>')) {
        this.panel.webview.html = html.replace('<head>', `<head>${injectedScript}`);
      } else {
        console.error('StockWindVaneView: html不是有效字符串或不包含<head>标签', typeof html, html?.length);
        // 使用原始html（如果存在）或回退到错误页面
        this.panel.webview.html = html || `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"><title>选股风向标</title></head>
          <body>
            <h1>模板文件格式错误</h1>
            <p>无法加载页面模板</p>
          </body>
          </html>
        `;
      }
    } catch (error) {
      console.error('StockWindVaneView: 加载模板文件失败', error);
      this.panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>选股风向标</title>
          <style>
            body { 
              background: var(--vscode-editor-background); 
              color: var(--vscode-foreground); 
              padding: 20px; 
              font-family: var(--vscode-font-family);
            }
            .error { color: var(--vscode-errorForeground); margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>选股风向标</h1>
          <div class="error">加载页面失败: ${error instanceof Error ? error.message : String(error)}</div>
          <div>请检查模板文件是否存在: template/leek-center/build/index.html</div>
        </body>
        </html>
      `;
    }

    // 设置消息处理器
    this.panel.webview.onDidReceiveMessage(async (msg: any) => {
      console.log('StockWindVaneView: 收到消息', msg);
      
      if (msg?.command === 'getStockWindVaneUrl') {
        // 动态计算URL，使用代理地址
        const host = getEastMoneyHost();
        const url = `${host}/zhuti/#ggfxb`;
        console.log('StockWindVaneView: 响应getStockWindVaneUrl请求', { host, url });
        
        this.panel.webview.postMessage({
          command: 'stockWindVaneUrl',
          data: { url }
        });
      } else if (msg?.command === 'openExternal' && msg?.data?.url) {
        try {
          await env.openExternal(Uri.parse(String(msg.data.url)));
          this.panel.webview.postMessage({
            command: 'openExternalSuccess'
          });
        } catch (e) {
          console.error('StockWindVaneView: 外部打开失败', e);
          this.panel.webview.postMessage({
            command: 'openExternalError'
          });
        }
      } else if (msg?.command === 'iframeLocation' && msg?.data?.href) {
        // 转发iframe的位置信息到React组件
        this.panel.webview.postMessage({
          command: 'iframeLocation',
          data: { href: msg.data.href }
        });
      }
    });

    // 页面加载完成后主动发送URL
    const sendInitialUrl = () => {
      const host = getEastMoneyHost();
      const url = `${host}/zhuti/#ggfxb`;
      console.log('StockWindVaneView: 主动发送URL', { host, url });
      
      this.panel.webview.postMessage({
        command: 'stockWindVaneUrl',
        data: { url }
      });
    };
    
    // 延迟发送，确保React组件已准备好
    setTimeout(sendInitialUrl, 300);

    this.panel.onDidDispose(() => {
      this.panel = null;
    });
  }
}

export default function stockWindVane() {
  StockWindVaneView.getInstance().show();
}