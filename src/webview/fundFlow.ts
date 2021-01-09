import { ExtensionContext, ViewColumn, WebviewPanel } from 'vscode';
import { getTemplateFileContent } from '../shared/utils';
import globalState from '../globalState';
import ReusedWebviewPanel from './ReusedWebviewPanel';

function fundFlow(context?: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('leek-fund.fundFlow', '资金流向', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  getWebViewContent(panel);
}

function getWebViewContent(panel: WebviewPanel) {
  panel.webview.html = getTemplateFileContent(
    'hsgt.html',
    panel.webview
  );
}

export default fundFlow;
