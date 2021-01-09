
import { LeekTreeItem } from '@/../types/shim-background';
import { makeAutoObservable } from 'mobx';

class FundStore {
  funds: LeekTreeItem[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setFunds(funds: LeekTreeItem[]) {
    this.funds = funds;
  }
}

export default new FundStore();
