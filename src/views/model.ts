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
    config.update(cfgKey, newCodes, true);
  }

  removeConfig(cfgKey: string, code: string) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get(cfgKey, []);
    const newCfg = sourceCfg.filter((item) => item != code);
    config.update(cfgKey, newCfg, true);
  }
}

export class FundModel extends BaseModel {
  constructor() {
    super();
  }
  updateFundCfg(codes: string) {
    this.updateConfig('leek-fund.funds', codes.split(','));
    window.showInformationMessage(`Successfully add.`);
  }

  removeFundCfg(code: string) {
    this.removeConfig('leek-fund.funds', code);
    window.showInformationMessage(`Successfully delete.`);
  }

  updateStockCfg(codes: string) {
    this.updateConfig('leek-fund.stocks', codes.split(','));
    window.showInformationMessage(`Successfully add.`);
  }

  removeStockCfg(code: string) {
    this.removeConfig('leek-fund.stocks', code);
    window.showInformationMessage(`Successfully delete.`);
  }
}
