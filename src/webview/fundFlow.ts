import { ExtensionContext, ViewColumn } from 'vscode';
import { getTemplateFileContent } from '../shared/utils';
import ReusedWebviewPanel from './ReusedWebviewPanel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
