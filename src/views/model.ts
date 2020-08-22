import { window, workspace } from 'vscode';
import { clean, uniq } from '../utils';

export class BaseModel {
  constructor() {}

  getCfg(key: string): any {
    const config = workspace.getConfiguration();
    return config.get(key);
  }

  setConfig(cfgKey: string, cfgValue: Array<any> | string | number) {
    const config = workspace.getConfiguration();
    return config.update(cfgKey, cfgValue, true);
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

export class LeekFundModel extends BaseModel {
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

  updateStatusBarStockCfg(codes: Array<string>, cb?: Function) {
    this.setConfig('leek-fund.statusBarStock', codes).then(() => {
      window.showInformationMessage(`Status Bar Stock Successfully update.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }
}
