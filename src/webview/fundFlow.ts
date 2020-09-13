import { ViewColumn, ExtensionContext } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { getWebViewContent } from '../utils';

function fundFlow(context: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('leek-fund.fundFlow', '资金流向', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getWebViewContent(context, 'src/webview/html/fundFlow.html');
}

export default fundFlow;
