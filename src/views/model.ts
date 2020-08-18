import { workspace, window } from 'vscode';
import { clean, uniq } from '../utils';

export class BaseModel {
  constructor() {}

  getCfg(key: string): any {
    const config = workspace.getConfiguration();
    return config.get(key);
  }

  updateConfig(cfgKey: string, codes: Array<any>) {
    const config = workspace.getConfiguration();
    const updatedCfg = [...config.get(cfgKey, []), ...codes];
    let newCodes = clean(updatedCfg);
    newCodes = uniq(newCodes);
    return config.update(cfgKey, newCodes, true);
  }

  removeConfig(cfgKey: string, code: string) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get(cfgKey, []);
    const newCfg = sourceCfg.filter((item) => item !== code);
    return config.update(cfgKey, newCfg, true);
  }
}

export class FundModel extends BaseModel {
  constructor() {
    super();
  }
  updateFundCfg(codes: string, cb?: Function) {
    this.updateConfig('leek-fund.funds', codes.split(',')).then(() => {
      window.showInformationMessage(`Fund Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }

  removeFundCfg(code: string, cb?: Function) {
    this.removeConfig('leek-fund.funds', code).then(() => {
      window.showInformationMessage(`Fund Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  updateStockCfg(codes: string, cb?: Function) {
    this.updateConfig('leek-fund.stocks', codes.split(',')).then(() => {
      window.showInformationMessage(`Stock Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }

  removeStockCfg(code: string, cb?: Function) {
    this.removeConfig('leek-fund.stocks', code).then(() => {
      window.showInformationMessage(`Stock Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
}
