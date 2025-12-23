import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Tabs, Button, List, message } from 'antd';
import { ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import { postMessage } from '@/utils/common';
import { AIContext } from '../context';
import './style.less';

const { TabPane } = Tabs;

interface NewsItem {
  title: string;
  summary: string;
  created_at: number;
  [key: string]: any;
}

interface NewsData {
  messages: NewsItem[];
  allDayMessages: NewsItem[];
}

const XuangubaoNews: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [newsData, setNewsData] = useState<NewsData>({ messages: [], allDayMessages: [] });
  const [activeTab, setActiveTab] = useState('latest');
  
  const aiContext = useContext(AIContext);


  const fetchNews = useCallback(() => {
    setLoading(true);
    postMessage('getNewsData');
    // Fallback timeout to clear loading if no response
    setTimeout(() => setLoading(false), 5000);
  }, []);

  useEffect(() => {
    fetchNews();

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.command === 'newsData') {
        setNewsData(msg.data);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchNews]);

  const handleRefresh = () => {
    fetchNews();
    postMessage('refreshNews'); // Trigger backend refresh if needed
  };

  const handleAnalyze = () => {
    const list = activeTab === 'latest' ? newsData.messages : newsData.allDayMessages;
    if (!list || list.length === 0) {
      message.warning('当前没有新闻数据可供分析');
      return;
    }

    const LIMIT = activeTab === 'latest' ? 10 : 30;
    const items = list.slice(0, LIMIT).map(item => ({
      title: item.title,
      summary: item.summary,
      time: new Date(item.created_at * 1000).toLocaleString()
    }));

    const prompt = `请分析以下投资快讯信息，提供专业的投资建议和市场分析：\n\n${items.map((news, index) => 
      `快讯 ${index + 1}:\n标题: ${news.title}\n内容: ${news.summary}\n时间: ${news.time}\n`
    ).join('\n')}\n\n请从以下角度进行分析：\n1. 市场整体趋势判断\n2. 重要行业/板块影响\n3. 潜在投资机会\n4. 风险提示\n5. 具体操作建议`;

    aiContext?.analyze(prompt);
  };

  const renderNewsList = (list: NewsItem[]) => (
    <List
      className="news-list"
      loading={loading && list.length === 0}
      dataSource={list}
      renderItem={item => (
        <div className="news-item">
          <div className="news-title">{item.title || '无标题'}</div>
          <div className="news-summary">{item.summary || '无内容'}</div>
          <div className="news-meta">
            <span>{new Date(item.created_at * 1000).toLocaleString()}</span>
          </div>
        </div>
      )}
      locale={{ emptyText: '暂无快讯数据' }}
    />
  );

  return (
    <div className="xuangubao-news-page">
      <div className="header">
        <h1>选股宝快讯</h1>
        <div>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh} 
            loading={loading}
            style={{ marginRight: 8 }}
          >
            刷新数据
          </Button>
          <Button 
            type="primary" 
            icon={<RobotOutlined />} 
            onClick={handleAnalyze}
          >
            AI 分析
          </Button>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="最新快讯" key="latest">
          {renderNewsList(newsData.messages)}
        </TabPane>
        <TabPane tab="当日全部" key="allDay">
          {renderNewsList(newsData.allDayMessages)}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default XuangubaoNews;
