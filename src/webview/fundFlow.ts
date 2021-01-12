import { ExtensionContext, ViewColumn, WebviewPanel } from 'vscode';
import { getTemplateFileContent } from '../shared/utils';
import globalState from '../globalState';
import ReusedWebviewPanel from './ReusedWebviewPanel';

function fundFlow(context?: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('leek-fund.fundFlow', '沪深通资金流向', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getTemplateFileContent('hsgt.html', panel.webview);
}

export function mainFundFlow() {
  const panel = ReusedWebviewPanel.create(
    'leek-fund.mainFundFlow',
    '主力资金流向',
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.webview.html = getTemplateFileContent('main-flow.html', panel.webview);
}

export default fundFlow;
