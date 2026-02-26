import { ViewColumn, WebviewPanel, workspace, window } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { getTemplateFileContent } from '../shared/utils';

type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  aiStockHistoryRange: string;
};

export class AiConfigView {
  private static instance: AiConfigView;
  private panel: WebviewPanel | null = null;

  private constructor() {}

  public static getInstance(): AiConfigView {
    if (!AiConfigView.instance) {
      AiConfigView.instance = new AiConfigView();
    }
    return AiConfigView.instance;
  }

  private getAiConfig(): AiConfig {
    const config = workspace.getConfiguration();
    const aiConfig = config.get('leek-fund.aiConfig', {
      apiKey: '',
      baseUrl: '',
      model: '',
    });
    const aiStockHistoryRange = config.get('leek-fund.aiStockHistoryRange', '3m');
    
    return {
      ...aiConfig,
      aiStockHistoryRange,
    };
  }

  private updateAiConfig(aiConfig: AiConfig) {
    const config = workspace.getConfiguration();
    const { aiStockHistoryRange, ...restConfig } = aiConfig;
    
    Promise.all([
      config.update('leek-fund.aiConfig', restConfig, true),
      config.update('leek-fund.aiStockHistoryRange', aiStockHistoryRange, true),
    ]).then(
      () => {
        window.showInformationMessage('AI 配置已更新');
        if (this.panel) {
          this.panel.webview.postMessage({ command: 'saveSuccess' });
        }
      },
      (err) => {
        console.error('AI配置更新失败:', err);
        window.showErrorMessage('AI 配置更新失败');
      }
    );
  }

  public show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = ReusedWebviewPanel.create(
      'aiConfigWebview',
      'AI 配置管理',
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    this.panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'getAiConfig':
          if (this.panel) {
            this.panel.webview.postMessage({ command: 'aiConfig', data: this.getAiConfig() });
          }
          return;
        case 'updateAiConfig':
          this.updateAiConfig(message.data);
          return;
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = null;
    });

    this.refresh();
  }

  private refresh() {
    if (!this.panel) return;
    
    const initialRoute = '/data-center/ai-config';
    const html = getTemplateFileContent(['leek-center', 'build', 'index.html'], this.panel.webview);
    this.panel.webview.html = html.replace(
      '<head>',
      `<head><script>window.initialRoute = '${initialRoute}';</script>`
    );

    setTimeout(() => {
      if (!this.panel) return;
      this.panel.webview.postMessage({ command: 'aiConfig', data: this.getAiConfig() });
    }, 300);
  }
}


