// TODO: webview 实现setting内容展示

// https://github.com/microsoft/vscode-extension-samples/blob/master/webview-view-sample/src/extension.ts

import {
  window,
  CancellationToken,
  WebviewView,
  WebviewViewProvider,
  WebviewViewResolveContext,
  Uri,
  Webview,
} from 'vscode';

export default class SettingsViewProvider implements WebviewViewProvider {
  public static readonly viewType = 'leekFundView.settings';

  private _view?: WebviewView;
  constructor(private readonly _extensionUri: Uri) {}
  resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext<unknown>,
    token: CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      console.log(data);
    });
  }

  private _getHtmlForWebview(webview: Webview) {
    return `
    \n [🌈个性化设置](command:leek-fund.customSetting)\n[🛠打开配置页](command:leek-fund.openConfigPage)\n[💰打赏作者@giscafer](command:leek-fund.donate)\n 欢迎使用韭菜盒子^_^，[使用手册](https://github.com/giscafer/leek-fund/issues/23)；评分[给个5星✨](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund&ssr=false#review-details)，源码[Github](https://github.com/giscafer/leek-fund)，加群交流[微信群](https://github.com/giscafer/leek-fund/issues/19)
    `;
  }
}
