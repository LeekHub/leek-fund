import { ViewColumn, WebviewPanel, ExtensionContext } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import globalState from '../globalState';
import { getTemplateFileContent } from '../shared/utils';
import axios from 'axios';
import OpenAI from 'openai';
import { window, workspace } from 'vscode';
import { error } from 'console';
import { fetchJYGNewsByCode } from './jiuyangongshe-news';

type XuanGuBaoMessage = {
  title: string;
  summary: string;
  impact: number;
  bkj_infos?: any[];
  created_at: number;
  id: number;
};

type XuanGuBaoNewsData = {
  messages: XuanGuBaoMessage[];
  next_cursor: string;
  lastUpdate: number;
  allDayMessages: XuanGuBaoMessage[];
};

type AiConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

const NEWS_FLASH_URL = 'https://baoer-api.xuangubao.cn/api/v6/message/newsflash';

export class XuanGuBaoNewsView {
  private static instance: XuanGuBaoNewsView;
  private panel: WebviewPanel | null = null;

  private aiStockAnalysisInProgress = false;

  private constructor() {}

  public static getInstance(): XuanGuBaoNewsView {
    if (!XuanGuBaoNewsView.instance) {
      XuanGuBaoNewsView.instance = new XuanGuBaoNewsView();
    }
    return XuanGuBaoNewsView.instance;
  }
  

  async send_ai(userMessage: string): Promise<string> {
    try {
      const config = workspace.getConfiguration();

      const aiConfig = this.getAiConfig();
      
      const openai = new OpenAI({
        apiKey: aiConfig.apiKey, 
        baseURL: aiConfig.baseUrl,
      });
      
      if(!aiConfig.apiKey || !aiConfig.baseUrl || !aiConfig.model) {
        return "AI配置不完整,请检查配置";
      }

      const completion = await openai.chat.completions.create({
        model: aiConfig.model,
        messages: [
          { 
            role: "system", 
            content: "你是一个拥有20年投资经验的投资专家，擅长分析股票市场、解读财经新闻、提供投资建议。请用中文回答，保持专业且友好的态度。" 
          },
          { role: "user", content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      return completion.choices[0]?.message?.content || "抱歉，我没有收到回复";
    } catch (error) {
      console.error('AI请求失败:', error);
      return "抱歉，AI服务暂时不可用，请稍后再试";
    }
  }

  async send_ai_stock_analysis(target: any): Promise<string> {

    console.log('aiStockAnalysis target:', target?.info);
    if (!target?.info) {
      window.showErrorMessage('未获取到股票信息');
      return '';
    }
    
    if (this.aiStockAnalysisInProgress) {
      window.showWarningMessage('AI 分析正在进行中，请稍候完成后再试');
      return '';
    }

    const cfg = workspace.getConfiguration();
    const range: string = cfg.get('leek-fund.aiStockHistoryRange', '3m');
    const rangeLabel = {
      '1y': '近1年',
      '6m': '近6个月',
      '3m': '近3个月',
      '1m': '近1个月',
      '1w': '近1周',
    }[range] || '近3个月';
    window.showWarningMessage(`开始分析：${target.info.name} 股票 ${rangeLabel}的前复权日线数据，股票代码：${target.info.code}`);
    const baseMessage = `请根据历史数据和今日热点快讯分析以下股票：${target.info.name}，股票代码：${target.info.code}`;
    // 获取历史复权数据并拼接
    let tradeDataAppendix = '';
    let newsAppendix = '';
    try {
      const tradeCsv = await this.fetchRecentQfqData(target.id);
      if (tradeCsv) {
        tradeDataAppendix = `\n\n以下为${rangeLabel}的前复权日线数据（来自搜狐财经）：\n${tradeCsv}`;
      }
      const todayNews = await this.fetchTodayAllNewsText();
      if (todayNews) {
        newsAppendix = `\n\n以下为今日全部快讯（来自选股宝）：\n${todayNews}`;
      }
      // 拼接韭研公社相关文章（按股票代码关键词）
      try {
        const stockName = (target?.info?.name || '').toString();
        if (stockName) {
          const jygItems = await fetchJYGNewsByCode(stockName, 10, 0);
          if (Array.isArray(jygItems) && jygItems.length) {
            const lines: string[] = [];
            for (const item of jygItems) {
              const title = item.title || '';
              const warns = item.warn_words ? `warn_words: ${item.warn_words}` : '';
              const snippet = item.content ? (item.content.length > 300 ? item.content.slice(0, 300) + '…' : item.content) : '';
              const ts = item.create_time ? `[${item.create_time}] ` : '';
              lines.push(`- ${ts}${title}`);
              if (warns) lines.push(`  - ${warns}`);
              if (snippet) lines.push(`  - content: ${snippet}`);
            }
            newsAppendix += `\n\n以下为韭研公社相关文章（关键词：${stockName}）：\n${lines.join('\n')}`;
          }
        }
      } catch (e) {
        console.error('拼接韭研公社新闻失败:', e);
      }
    } catch (e) {
      console.error('获取近三个月交易数据失败:', e);
    }
    const message = baseMessage + tradeDataAppendix + newsAppendix;
    
    console.log('request ai model message', message);
    const xuanGuBaoNewsView = XuanGuBaoNewsView.getInstance();

    this.aiStockAnalysisInProgress = true;
    try {
      const result = await xuanGuBaoNewsView.send_ai(message);
      console.log('aiStockAnalysis result:', result);

      // 结果判定
      const isConfigIssue = /AI配置不完整|配置不完整/i.test(result);
      const isServiceDown = /不可用|错误|失败|稍后再试|抱歉/i.test(result);

      if (isConfigIssue) {
        window.showWarningMessage('AI 配置不完整，请在设置中完善 API Key / Base URL / 模型');
        return '';
      }
      if (isServiceDown) {
        window.showErrorMessage('AI 服务暂不可用，请稍后再试');
        return '';
      }
      return result;
    } catch (err) {
      console.error('调用 AI 分析失败:', err);
      window.showErrorMessage('调用 AI 分析失败，请稍后再试');
      return '';
    } finally {
      this.aiStockAnalysisInProgress = false;
    }
  }

  private formatDateYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private async fetchRecentQfqData(stockId: string): Promise<string> {
    try {
      // 读取配置的历史区间长度，默认 3m
      const cfg = workspace.getConfiguration();
      const range: string = cfg.get('leek-fund.aiStockHistoryRange', '3m');
      const now = new Date();
      const startDate = this.calcStartDateByRange(now, range);
      const start = this.formatDateYYYYMMDD(startDate).replace(/-/g, '');
      const end = this.formatDateYYYYMMDD(now).replace(/-/g, '');

      const sohuCode = this.toSohuCode(stockId);
      if (!sohuCode) return '';

      const url = `http://q.stock.sohu.com/hisHq?code=${sohuCode}&start=${start}&end=${end}&stat=1&order=D&period=d&callback=historySearchHandler&rt=jsonp`;
      const response = await axios.get(url, { responseType: 'text' });
      return typeof response === 'string' ? response : (response.data ? String(response.data) : '');
    } catch (e) {
      console.error('fetchRecentQfqData error:', e);
      return '';
    }
  }

  private calcStartDateByRange(base: Date, range: string): Date {
    const y = base.getFullYear();
    const m = base.getMonth();
    const d = base.getDate();
    switch (range) {
      case '1y':
        return new Date(y - 1, m, d);
      case '6m':
        return new Date(y, m - 6, d);
      case '1m':
        return new Date(y, m - 1, d);
      case '1w':
        return new Date(base.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '3m':
      default:
        return new Date(y, m - 3, d);
    }
  }

  private toSohuCode(stockId: string): string | null {
    if (!stockId || stockId.length < 3) return null;
    const lower = stockId.toLowerCase();
    if (lower.startsWith('sh') || lower.startsWith('sz')) {
      return `cn_${lower.slice(2)}`;
    }
    return null;
  }
  

  getAiConfig(): AiConfig {
    const cfgKey = 'leek-fund.aiConfig';
    const config = workspace.getConfiguration();
    const result = config.get(cfgKey, {
      apiKey: '',
      baseUrl: '',
      model: '',
    });
    return result;
  }

  updateAiConfig(aiConfig: AiConfig, cb?: Function) {
    const cfgKey = 'leek-fund.aiConfig';
    const config = workspace.getConfiguration();
    config.update(cfgKey, aiConfig, true).then(() => {
      console.log('AI配置更新成功');
      window.showInformationMessage(`AI config Successfully update.`);
      if (cb && typeof cb === 'function') {
        cb(aiConfig);
      }
    }, (err) => {
      console.error('AI配置更新失败:', err);
    });
  }


  private async handleAIMessage(userMessage: string) {
    if (!this.panel) return;
    
    try {
      // 调用AI服务
      const aiResponse = await this.send_ai(userMessage);
      
      // 发送AI回复到前端
      this.panel.webview.postMessage({
        command: 'aiResponse',
        data: aiResponse
      });
    } catch (error) {
      console.error('处理AI消息失败:', error);
      
      // 发送错误信息到前端
      this.panel.webview.postMessage({
        command: 'aiResponse',
        data: "抱歉，处理您的请求时出现错误"
      });
    }
  }
  public show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = ReusedWebviewPanel.create(
      'xuangubaoNewsWebview',
      '选股宝快讯',
      ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    // Handle messages from the webview
    this.panel.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'refreshNews':
          this.refreshNews();
          return;
        case 'getNewsData':
          this.sendNewsData();
          return;
        case 'sendAIMessage':
          this.handleAIMessage(message.data);
          return;
        case 'openAiConfig':
          try {
            const { AiConfigView } = require('./ai-config');
            AiConfigView.getInstance().show();
          } catch (e) {
            console.error('打开 AI 配置页面失败:', e);
          }
          return;
        case 'getAiConfig':
          const config = this.getAiConfig();
          if (this.panel) {
            this.panel.webview.postMessage({
              command: 'aiConfig',
              data: config
            });
          } else {
            console.log('panel为空，无法发送配置到前端');
          }
          return;
        case 'updateAiConfig':
          console.log('收到前端更新AI配置请求:', message.data);
          this.updateAiConfig(message.data);
          return;
      }
    });

    this.panel.onDidDispose(() => {
      this.panel = null;
    });

    this.refreshNews();
  }

  private refreshNews() {
    if (!this.panel) return;

    // 在开发和生产环境下都直接使用HTML文件内容
    this.panel.webview.html = getTemplateFileContent('xuangubao-news.html', this.panel.webview);
    
    // 延迟发送数据，确保HTML加载完成
    setTimeout(() => {
      this.sendNewsData();
    }, 500);
  }

  private async sendNewsData() {
    if (!this.panel) return;

    try {
      const newsData = await this.fetchNewsData();
      this.panel.webview.postMessage({
        command: 'newsData',
        data: newsData
      });
    } catch (error) {
      console.error('获取选股宝快讯数据失败:', error);
      this.panel.webview.postMessage({
        command: 'newsData',
        data: {
          messages: [],
          next_cursor: '',
          lastUpdate: Date.now(),
          allDayMessages: []
        }
      });
    }
  }

  private async fetchNewsData(): Promise<XuanGuBaoNewsData> {
    const subjectIds = [9, 10, 723, 35, 469];
    
    // 获取最新20条消息用于实时更新
    const latestRes = await axios.get(NEWS_FLASH_URL, {
      params: {
        limit: 20,
        subj_ids: subjectIds.join(','),
        platform: 'pcweb',
      },
    });
    
    // 获取当天所有消息用于全量显示
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayStartTimestamp = Math.floor(todayStart.getTime() / 1000);
    
    const allDayRes = await axios.get(NEWS_FLASH_URL, {
      params: {
        limit: 100,
        subj_ids: subjectIds.join(','),
        start_time: todayStartTimestamp,
        platform: 'pcweb',
      },
    });
    
    if (latestRes.data.code === 20000 && allDayRes.data.code === 20000) {
      const { messages, next_cursor } = latestRes.data.data;
      const allDayMessages = allDayRes.data.data.messages || [];
      
      // 对当天全量新闻进行去重
      const uniqueAllDayMessages: XuanGuBaoMessage[] = [];
      const seenIds = new Set<number>();
      
      allDayMessages.forEach((msg: XuanGuBaoMessage) => {
        if (!seenIds.has(msg.id)) {
          seenIds.add(msg.id);
          uniqueAllDayMessages.push(msg);
        }
      });
      
      return {
        messages: messages,
        next_cursor: next_cursor,
        lastUpdate: Date.now(),
        allDayMessages: uniqueAllDayMessages
      };
    }
    
    return {
      messages: [],
      next_cursor: '',
      lastUpdate: Date.now(),
      allDayMessages: []
    };
  }

  private async fetchTodayAllNewsText(): Promise<string> {
    try {
      const data = await this.fetchNewsData();
      const items = data.allDayMessages || [];
      if (!items.length) return '';
      const lines: string[] = [];
      for (const n of items) {
        const ts = n.created_at ? new Date(n.created_at * 1000).toLocaleString('zh-CN') : '';
        const title = n.title || '';
        const summary = n.summary || '';
        lines.push(`- [${ts}] ${title} ${summary ? ' - ' + summary : ''}`);
      }
      return lines.join('\n');
    } catch (e) {
      console.error('fetchTodayAllNewsText error:', e);
      return '';
    }
  }
}