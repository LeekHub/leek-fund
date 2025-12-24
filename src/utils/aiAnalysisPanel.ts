import { ExtensionContext, window, ViewColumn, Uri } from 'vscode';

/**
 * 显示 AI 分析结果面板
 * @param context 扩展上下文
 * @param stockName 股票名称
 * @param content AI 分析内容(Markdown 格式)
 */
export function showAiAnalysisPanel(
  context: ExtensionContext,
  stockName: string,
  content: string
): void {
  const panel = window.createWebviewPanel(
    'aiAnalysisResult',
    `AI 分析结果 - ${stockName}`,
    ViewColumn.Active,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [Uri.joinPath(context.extensionUri, 'template')],
    }
  );

  panel.webview.html = `<!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 分析结果</title>
    <style>
      html, body { height: 100%; width: 100%; }
      body { margin: 0; padding: 0; background: var(--vscode-editor-background); color: var(--vscode-foreground); overflow: hidden; }
      .wrap { height: 100%; width: 100%; margin: 0; padding: 8px 10px; box-sizing: border-box; display: flex; flex-direction: column; }
      .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .title { font-weight: 600; }
      .btn { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; }
      .btn:hover { background: var(--vscode-button-hoverBackground); }
      .content { flex: 1; min-height: 0; word-break: break-word; line-height: 1.7; border: 1px solid var(--vscode-editorWidget-border); border-radius: 6px; padding: 16px; overflow: auto; background: var(--vscode-editorWidget-background); }
      .content h1,.content h2,.content h3{ margin: 12px 0 8px; }
      .content p{ margin: 8px 0; }
      .content code{ background: rgba(127,127,127,.15); padding: 2px 6px; border-radius: 4px; }
      .content pre{ background: rgba(127,127,127,.15); padding: 12px; border-radius: 6px; overflow: auto; }
      .content table{ border-collapse: collapse; }
      .content th,.content td{ border: 1px solid var(--vscode-editorWidget-border); padding: 6px 8px; }
    </style>
    <!-- 使用本地引入marked和DOMPurify -->
    <script src="${panel.webview.asWebviewUri(
      Uri.joinPath(context.extensionUri, 'template', 'vendors', 'marked.min.js')
    )}"></script>
    <script src="${panel.webview.asWebviewUri(
      Uri.joinPath(context.extensionUri, 'template', 'vendors', 'purify.min.js')
    )}"></script>
  </head>
  <body>
    <div class="wrap">
      <div class="toolbar">
        <div class="title">AI 分析结果 - ${stockName}</div>
        <div>
          <button class="btn" id="copyBtn">复制Markdown</button>
        </div>
      </div>
      <div class="content" id="content"></div>
    </div>
    <script>
      const raw = ${JSON.stringify('' + (content ?? ''))};
      // 如果内容过长，添加提示
      const isLongContent = raw.length > 10000;
      const render = () => {
        try {
          // 改进的marked检查逻辑，支持更多版本的API
          let html;
          if (window.marked) {
            if (typeof window.marked === 'function') {
              // 旧版marked API
              html = window.marked(raw);
            } else if (window.marked.parse) {
              // 新版marked API
              html = window.marked.parse(raw);
            } else if (window.marked.marked) {
              // 可能的变体
              html = window.marked.marked(raw);
            } else {
              // 回退到原始文本
              html = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;');
            }
          } else {
            // 没有marked库时的回退处理
            html = raw.replace(/&/g,'&amp;').replace(/</g,'&lt;');
          }
          
          // DOMPurify净化
          const safe = (window.DOMPurify && window.DOMPurify.sanitize) ? window.DOMPurify.sanitize(html) : html;
          document.getElementById('content').innerHTML = safe;
        } catch (e) {
          console.error('渲染Markdown失败:', e);
          document.getElementById('content').textContent = raw;
        }
      };
      
      // 确保脚本加载完成后再渲染
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
      } else {
        // 如果是长内容，先显示加载提示
        if (isLongContent) {
          document.getElementById('content').innerHTML = '<div style="text-align: center; padding: 20px; color: var(--vscode-descriptionForeground);">内容较长，正在渲染...（共 ' + raw.length + ' 字符）</div>';
          setTimeout(render, 100);
        } else {
          render();
        }
      }
      
      document.getElementById('copyBtn').addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(raw); } catch (e) {}
      });
    </script>
  </body>
  </html>`;
}
