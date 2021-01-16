import { makeAutoObservable } from 'mobx';

class NewsStore {
  newsList: any[] = [];

  constructor() {
    makeAutoObservable(this, undefined, { deep: false });
  }

  appendNews(news: any) {
    console.log('[news, ...this.newsList]: ', [news, ...this.newsList]);
    this.newsList = [news, ...this.newsList];
  }
}

export default new NewsStore();
