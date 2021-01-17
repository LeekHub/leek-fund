import store from '@/stores/index';
import { fetchResponsePromiseMap } from '@/utils/fetch';

const CommandHandler: Record<string, (data: any) => any> = {
  setGithubAccessToken(data) {},
  updateStockList(data) {
    store.stock.setStocks(data);
  },
  updateFundList(data) {
    store.fund.setFunds(data);
  },
  updateStockRemind(data) {
    console.log('updateStockRemind: ', data);
    store.stock.setStockRemind(data);
  },
  fetchResponse(data) {
    const [resolve, reject] = fetchResponsePromiseMap[data.sessionId];
    if (data.success) {
      resolve(data.response);
    } else {
      reject(data.response);
    }
    delete fetchResponsePromiseMap[data.sessionId];
  },
  postFlashNews(data) {
    console.log('postFlashNews: ', data);
    store.news.appendNews(data);
  },
};

export function setupBackgroundManagement() {
  window.addEventListener('message', (event) => {
    const { command, data } = event.data;
    try {
      if (CommandHandler[command]) {
        CommandHandler[command](data);
      }
    } catch (err) {
    } finally {
    }
  });
}
