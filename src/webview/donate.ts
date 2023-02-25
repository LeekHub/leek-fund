import { ExtensionContext, ViewColumn } from 'vscode';
import { getTemplateFileContent } from '../shared/utils';
import ReusedWebviewPanel from './ReusedWebviewPanel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function donateView(context: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('donateWebview', '赞助插件', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getTemplateFileContent('donate.html', panel.webview);
}

export default donateView;
