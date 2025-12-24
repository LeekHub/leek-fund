import { Webview, workspace, window } from 'vscode';
import OpenAI from 'openai';
import axios from 'axios';
import { fetchJYGNewsByCode } from '../jiuyangongshe-news';
import { FlashNewsService } from './flash-news-service';

export class AiService {
  private aiStockAnalysisInProgress = false;

  constructor(private webview: Webview, private flashNewsService: FlashNewsService) {}

  async handleMessage(message: any) {
    switch (message.command) {
      case 'getAiConfig':
        this.getAiConfig();
        break;
      case 'updateAiConfig':
        this.updateAiConfig(message.data);
        break;
      case 'sendAIMessage':
        this.handleChat(message.data);
        break;
      case 'analyzeStock':
        this.handleStockAnalysis(message.data);
        break;
    }
  }

  private getAiConfig() {
    const config = workspace.getConfiguration();
    const aiConfig = config.get('leek-fund.aiConfig') || {
      apiKey: '',
      baseUrl: '',
      model: '',
    };
    this.webview.postMessage({
      command: 'aiConfig',
      data: aiConfig
    });
  }

  private updateAiConfig(data: any) {
    const config = workspace.getConfiguration();
    config.update('leek-fund.aiConfig', data, true).then(() => {
      this.webview.postMessage({
        command: 'saveSuccess'
      });
    });
  }

  private async handleChat(userMessage: string) {
    try {
      const result = await this.send_ai(userMessage);
      this.webview.postMessage({
        command: 'aiResponse',
        data: result
      });
    } catch (error) {
      this.webview.postMessage({
        command: 'aiResponse',
        data: "抱歉，AI服务暂时不可用，请稍后再试"
      });
    }
  }

  private async handleStockAnalysis(target: any) {
    try {
      const result = await this.send_ai_stock_analysis(target);
      if (result) {
        this.webview.postMessage({
          command: 'aiResponse',
          data: result
        });
      }
    } catch (error) {
      console.error(error);
      this.webview.postMessage({
        command: 'aiResponse',
        data: "股票分析失败，请稍后再试"
      });
    }
  }

  // --- Core AI Methods ---

  async send_ai(userMessage: string): Promise<string> {
    try {
      const config = workspace.getConfiguration();
      const aiConfig: any = config.get('leek-fund.aiConfig');
      
      if(!aiConfig?.apiKey || !aiConfig?.baseUrl || !aiConfig?.model) {
        return "AI配置不完整,请检查配置";
      }

      const openai = new OpenAI({
        apiKey: aiConfig.apiKey, 
        baseURL: aiConfig.baseUrl,
      });

      const completion = await openai.chat.completions.create({
        model: aiConfig.model,
        messages: [
          { 
            role: "system", 
            content: "你是一个拥有多年投资经验的投资专家，擅长分析股票市场、解读财经新闻、提供投资建议。请用中文回答，保持专业且友好的态度。" 
          },
          { role: "user", content: userMessage }
        ],
        max_tokens: 4000,
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
    const rangeLabel: Record<string, string> = {
      '1y': '近1年',
      '6m': '近6个月',
      '3m': '近3个月',
      '1m': '近1个月',
      '1w': '近1周',
    };
    const label = rangeLabel[range] || '近3个月';

    window.showWarningMessage(`开始分析：${target.info.name} 股票 ${label}的前复权日线数据，股票代码：${target.info.code}`);
    const baseMessage = `请根据历史数据和今日热点快讯分析以下股票：${target.info.name}，股票代码：${target.info.code}`;
    
    // 获取历史复权数据并拼接
    let tradeDataAppendix = '';
    let newsAppendix = '';
    try {
      const tradeCsv = await this.fetchRecentQfqData(target.id);
      if (tradeCsv) {
        tradeDataAppendix = `\n\n以下为${label}的前复权日线数据（来自搜狐财经）：\n${tradeCsv}`;
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

    this.aiStockAnalysisInProgress = true;
    try {
      const result = await this.send_ai(message);
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

  // --- Helpers ---

  private async fetchTodayAllNewsText(): Promise<string> {
    try {
      const data = await this.flashNewsService.fetchNewsData();
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

  private formatDateYYYYMMDD(d: Date): string {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private toSohuCode(stockId: string): string | null {
    if (!stockId || stockId.length < 3) return null;
    const lower = stockId.toLowerCase();
    if (lower.startsWith('sh') || lower.startsWith('sz')) {
      return `cn_${lower.slice(2)}`;
    }
    return null;
  }
}
