import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import { postMessage } from '@/utils/common';
import './style.less';

const StockWindVane: React.FC = () => {
  const [url, setUrl] = useState('');
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [loadingUrl, setLoadingUrl] = useState(true); // 加载URL的状态
  const [loadingIframe, setLoadingIframe] = useState(false); // 正在加载iframe
  const [iframeLoaded, setIframeLoaded] = useState(false); // iframe是否已加载完成
  const [error, setError] = useState<string | null>(null);
  const [hasReceivedUrl, setHasReceivedUrl] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // 重试次数
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let mounted = true;
    
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      console.log('StockWindVane: 收到消息', msg);
      
      if (msg.command === 'stockWindVaneUrl' && msg.data) {
        const initialUrl = msg.data.url;
        console.log('StockWindVane: 获取到URL', initialUrl);
        if (mounted) {
          setUrl(initialUrl);
          setHistoryStack([initialUrl]);
          setHistoryIndex(0);
          setLoadingUrl(false);
          setHasReceivedUrl(true);
          setError(null); // 清除任何之前的错误
          // 自动开始加载 iframe
          setLoadingIframe(true);
          setIframeLoaded(false);
        }
      }
      if (msg.command === 'openExternalSuccess') {
        message.success('已在外部浏览器打开');
      }
      if (msg.command === 'openExternalError') {
        message.error('无法在外部打开链接');
      }
      // 处理iframe发送的位置信息
      let href = null;
      if (msg.command === 'iframeLocation' && msg.data) {
        href = msg.data.href;
      } else if (msg.__leekWindVane === 'location' && msg.href) {
        // 兼容代理服务注入脚本的消息格式
        href = msg.href;
      }
      
      if (href) {
        setHistoryStack(prevStack => {
          const prevIndex = historyIndex;
          if (prevStack[prevIndex] !== href) {
            const newStack = [...prevStack.slice(0, prevIndex + 1), href];
            setHistoryIndex(newStack.length - 1);
            return newStack;
          }
          return prevStack;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    
    // 发送获取URL的请求
    const sendGetUrlRequest = () => {
      if (mounted && !hasReceivedUrl) {
        console.log('StockWindVane: 发送getStockWindVaneUrl消息，重试次数:', retryCount);
        setLoadingUrl(true);
        setError(null);
        postMessage('getStockWindVaneUrl');
      }
    };
    
    // 等待页面完全加载后再发送消息
    const timeoutId = setTimeout(sendGetUrlRequest, 100);
    
    // 设置超时，防止一直等待
    const errorTimeoutId = setTimeout(() => {
      if (mounted && !hasReceivedUrl) {
        console.log('StockWindVane: 获取URL超时，未收到URL消息');
        setError('获取URL超时，代理服务可能未启动。请检查：\n1. 插件是否完全重启\n2. 浏览器访问 http://localhost:16104/zhuti/#ggfxb 是否正常\n3. 查看VS Code输出面板中的LeekFund日志');
        setLoadingUrl(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
      clearTimeout(errorTimeoutId);
    };
  }, [historyIndex, hasReceivedUrl, retryCount]); // 添加retryCount依赖

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const newUrl = historyStack[newIndex];
      if (iframeRef.current) {
        iframeRef.current.src = newUrl;
      }
    }
  };

  const handleForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const newUrl = historyStack[newIndex];
      if (iframeRef.current) {
        iframeRef.current.src = newUrl;
      }
    }
  };

  const handleReload = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.location.reload();
      } catch (e) {
        const currentUrl = historyStack[historyIndex] || iframeRef.current.src;
        iframeRef.current.src = currentUrl;
      }
    }
  };

  const handleOpenExternal = () => {
    const currentUrl = historyStack[historyIndex] || url;
    postMessage('openExternal', { url: currentUrl });
  };

  const handleRetry = () => {
    console.log('StockWindVane: 重试获取URL');
    setHasReceivedUrl(false);
    setIframeLoaded(false);
    setLoadingIframe(false);
    setRetryCount(prev => prev + 1);
    setError(null);
  };

  const handleIframeLoad = () => {
    console.log('StockWindVane: iframe加载完成');
    setLoadingIframe(false);
    setIframeLoaded(true);
    
    // 向iframe注入脚本以监听位置变化
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const script = `
          (function() {
            // 发送当前URL到父窗口
            function sendLocation() {
              try {
                window.parent.postMessage({
                  __leekWindVane: 'location',
                  href: window.location.href
                }, '*');
              } catch(e) {}
            }
            
            // 初始发送
            sendLocation();
            
            // 监听hash变化
            window.addEventListener('hashchange', sendLocation);
            
            // 监听popstate
            window.addEventListener('popstate', sendLocation);
            
            // 重写pushState和replaceState
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function() {
              const result = originalPushState.apply(this, arguments);
              setTimeout(sendLocation, 0);
              return result;
            };
            
            history.replaceState = function() {
              const result = originalReplaceState.apply(this, arguments);
              setTimeout(sendLocation, 0);
              return result;
            };
          })();
        `;
        
        const scriptElement = iframeRef.current.contentWindow.document.createElement('script');
        scriptElement.textContent = script;
        iframeRef.current.contentWindow.document.head.appendChild(scriptElement);
      } catch (e) {
        console.log('StockWindVane: 无法向iframe注入脚本（跨域限制）');
      }
    }
  };

  const handleIframeError = () => {
    console.error('StockWindVane: iframe加载失败');
    setLoadingIframe(false);
    setIframeLoaded(false);
    setError('iframe加载失败。可能原因:\n1. 代理服务未正常运行\n2. 网络连接问题\n3. 跨域限制\n\n建议:\n1. 在浏览器中测试代理URL是否可访问\n2. 重启VS Code插件\n3. 检查防火墙设置');
  };

  // 添加iframe加载超时检查
  useEffect(() => {
    if (!loadingIframe || !url) return;
    
    const timeoutId = setTimeout(() => {
      console.log('StockWindVane: iframe加载超时');
      setLoadingIframe(false);
      setError('iframe加载超时，请检查代理服务是否正常运行');
    }, 10000); // 10秒超时
    
    return () => clearTimeout(timeoutId);
  }, [loadingIframe, url]);

  return (
    <div className="stock-wind-vane-page">
      <div className="wrap">
        <div className="toolbar">
          <button 
            onClick={handleBack} 
            disabled={historyIndex <= 0}
            className="btn"
          >
            后退
          </button>
          <button 
            onClick={handleForward} 
            disabled={historyIndex >= historyStack.length - 1}
            className="btn"
          >
            前进
          </button>
          <button 
            onClick={handleReload}
            className="btn"
          >
            刷新
          </button>
          <button 
            onClick={handleOpenExternal}
            className="btn"
          >
            外部打开
          </button>
          {/* 隐藏URL地址显示 */}
        </div>

        <div className="content">
          {loadingUrl && (
            <div className="loading">
              <div>正在获取代理URL...</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
                如果长时间无响应，请确认插件已完全重启
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-container">
              <div className="error-title">加载失败</div>
              <div className="error-message">{error}</div>
              <div className="error-actions">
                <button onClick={handleRetry} className="btn btn-primary">
                  重试获取URL
                </button>
              </div>
            </div>
          )}
          
          {/* 已移除 URL 确认弹窗，自动加载 */}
          
          {/* 加载中提示 */}
          {loadingIframe && (
            <div className="loading">
              <div>正在加载选股风向标...</div>
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#999' }}>
                {url}
              </div>
            </div>
          )}
          
          {/* iframe 容器 - 一旦开始加载就渲染,加载完成后继续显示 */}
          {(loadingIframe || iframeLoaded) && (
            <iframe
              ref={iframeRef}
              src={url}
              sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox allow-modals"
              title="选股风向标"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              id="frame"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          )}
        </div>

        <div className="hint">
          {loadingUrl && '正在获取代理URL...'}
          {error && '代理服务异常，请参考上方错误信息'}
          {loadingIframe && '正在加载选股风向标...'}
          {iframeLoaded && !loadingIframe && '选股风向标已加载'}
        </div>
      </div>
    </div>
  );
};

export default StockWindVane;