import { ExtensionContext, ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { getWebViewContent } from '../utils';

async function donate(context: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('donateWebview', '打赏作者@giscafer', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getWebViewContent(context, 'src/webview/html/donate.html');
}

export default donate;
