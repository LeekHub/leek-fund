import { ViewColumn, window } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { getEastMoneyHost } from './proxyService/proxyConfig';

export default function stockWindVane() {
  const panel = ReusedWebviewPanel.create(
    'stockWindVaneWebview',
    '选股风向标',
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const url = `${getEastMoneyHost()}/zhuti/#ggfxb`;

  panel.webview.html = `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>选股风向标</title>
    <style>
      html, body { height: 100%; width: 100%; }
      body { margin: 0; padding: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); overflow: hidden; }
      .wrap { height: 100%; width: 100%; display: flex; flex-direction: column; background: var(--vscode-editor-background); }
      .toolbar { padding: 8px 10px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--vscode-editorWidget-border); background: var(--vscode-editor-background); }
      .btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
      .btn:hover { background: var(--vscode-button-hoverBackground); }
      .url { margin-left: auto; font-size: 12px; color: var(--vscode-descriptionForeground); }
      .content { flex: 1; min-height: 0; background: var(--vscode-editor-background); }
      iframe { width: 100%; height: 100%; border: 0; background: transparent; }
      .hint { padding: 12px; color: var(--vscode-descriptionForeground); font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="toolbar">
        <button class="btn" id="back">后退</button>
        <button class="btn" id="forward">前进</button>
        <button class="btn" id="reload">刷新</button>
        <button class="btn" id="openExt">外部打开</button>
        <div class="url" id="curUrl"></div>
      </div>
      <div class="content">
        <iframe id="frame" src="${url}" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
      </div>
      <div class="hint">若页面为空白，请确认本地代理已启动并可访问：${url}</div>
    </div>
    <script>
      const frame = document.getElementById('frame');
      const backBtn = document.getElementById('back');
      const fwdBtn = document.getElementById('forward');
      const urlBox = document.getElementById('curUrl');

      const historyStack = ['${url}'];
      let historyIndex = 0;
      function updateButtons(){
        backBtn.disabled = historyIndex <= 0;
        fwdBtn.disabled = historyIndex >= historyStack.length - 1;
        // urlBox.textContent = historyStack[historyIndex] || '';
      }
      function navigateTo(u){
        if (typeof u !== 'string' || !u) return;
        if (historyStack[historyIndex] !== u) {
          historyStack.splice(historyIndex + 1);
          historyStack.push(u);
          historyIndex = historyStack.length - 1;
        }
        try { frame.src = u; } catch (e) { frame.setAttribute('src', u); }
        updateButtons();
      }
      updateButtons();

      backBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
          historyIndex -= 1;
          const u = historyStack[historyIndex];
          try { frame.src = u; } catch (e) { frame.setAttribute('src', u); }
          updateButtons();
        }
      });
      fwdBtn.addEventListener('click', () => {
        if (historyIndex < historyStack.length - 1) {
          historyIndex += 1;
          const u = historyStack[historyIndex];
          try { frame.src = u; } catch (e) { frame.setAttribute('src', u); }
          updateButtons();
        }
      });
      document.getElementById('reload').addEventListener('click', () => {
        try { frame.contentWindow && frame.contentWindow.location.reload(); } catch (e) { 
          const u = historyStack[historyIndex] || frame.src;
          try { frame.src = u; } catch(err) { frame.setAttribute('src', u); }
        }
      });
      document.getElementById('openExt').addEventListener('click', () => {
        if (typeof acquireVsCodeApi !== 'undefined') {
          const vscode = acquireVsCodeApi();
          vscode.postMessage({ command: 'openExternal', data: '${url}' });
        } else {
          window.open('${url}', '_blank');
        }
      });

      // 接收 iframe 发送的当前位置，维护历史
      window.addEventListener('message', (event) => {
        try {
          const data = event && event.data;
          if (data && data.__leekWindVane === 'location' && typeof data.href === 'string') {
            if (historyStack[historyIndex] !== data.href) {
              historyStack.splice(historyIndex + 1);
              historyStack.push(data.href);
              historyIndex = historyStack.length - 1;
              updateButtons();
            }
          }
        } catch (e) {}
      });
    </script>
  </body>
  </html>`;

  panel.webview.onDidReceiveMessage(async (msg) => {
    if (msg?.command === 'openExternal' && msg?.data) {
      try {
        await (await import('vscode')).env.openExternal((await import('vscode')).Uri.parse(String(msg.data)));
      } catch (e) {
        window.showErrorMessage('无法在外部打开链接');
      }
    }
  });
}


