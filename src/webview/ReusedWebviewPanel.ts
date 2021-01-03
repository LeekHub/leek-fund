import { window, ViewColumn, WebviewPanel, WebviewPanelOptions, WebviewOptions } from 'vscode';
import globalState from '../globalState';

module ReusedWebviewPanel {
  const webviewPanelsPool: Map<string, WebviewPanel> = new Map(); // webviewPanel池

  /**
   * 创建webviewPanel
   * @param viewType 唯一标识
   * @param title 标题
   * @param showOptions 显示位置
   * @param options 可选选项
   */
  export function create(
    viewType: string,
    title: string,
    showOptions = ViewColumn.Active,
    options?: WebviewPanelOptions & WebviewOptions
  ) {
    const oldPanel = webviewPanelsPool.get(viewType);

    if (oldPanel) {
      oldPanel.title = title;
      oldPanel.reveal();
      return oldPanel;
    }

    const newPanel = window.createWebviewPanel(viewType, title, showOptions, options);

    newPanel.onDidDispose(() => webviewPanelsPool.delete(viewType));
    webviewPanelsPool.set(viewType, newPanel);

    console.log('webviewPanelsPool.size:', webviewPanelsPool.size);

    try {
      globalState.telemetry.sendEvent(viewType, { title });
    } catch (err) {
      console.error(err);
    }

    return newPanel;
  }

  /**
   * 销毁webviewPanel
   * @param viewType 唯一标识
   */
  export function destroy(viewType: string) {
    const target = webviewPanelsPool.get(viewType);

    if (target) {
      webviewPanelsPool.delete(viewType);
      // createWebviewPanel是异步的，setTimeout避免创建未完成时调用dispose报错
      setTimeout(() => target.dispose(), 0);
    }
  }
}

export default ReusedWebviewPanel;
