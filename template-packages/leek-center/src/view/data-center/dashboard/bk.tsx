import { Spin } from 'antd';
import { useEffect, useState } from 'react';
import './index.less';

const srcUrl = `https://view.le5le.com/v/?id=019749ca-8bc5-786f-aa04-913e3c62bea8`;

const IframeWithLoading = () => {
  const [loading, setLoading] = useState(true);
  
  const handleLoad = () => {
   setTimeout(() => {
      setLoading(false);
    }, 1000); // 延时1秒后隐藏加载动画
  };

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '95vh' }}>
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
           minHeight: '95vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1 
        }}>
          <Spin size="large" tip="正在加载..." />
        </div>
      )}
      <iframe
        src={srcUrl}
        style={{  minHeight: '95vh',width: '100%', height: '100%', border: 'none' }}
        onLoad={handleLoad}
        title="地域板块资金流向大屏"
      />
    </div>
  );
};


export default IframeWithLoading;
