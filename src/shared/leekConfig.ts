/*--------------------------------------------------------------
 *  Copyright (c) Nickbing Lao<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { window, workspace } from 'vscode';
import { clean, uniq, events } from './utils';

export class BaseConfig {
  static getConfig(key: string, defaultValue?: any): any {
    const config = workspace.getConfiguration();
    const value = config.get(key);
    return value === undefined ? defaultValue : value;
  }

  static setConfig(cfgKey: string, cfgValue: Array<any> | string | number | Object) {
    events.emit('updateConfig:' + cfgKey, cfgValue);
    const config = workspace.getConfiguration();
    return config.update(cfgKey, cfgValue, true);
  }

  static updateConfig(cfgKey: string, codes: Array<any>) {
    const config = workspace.getConfiguration();
    const updatedCfg = [...config.get(cfgKey, []), ...codes];
    let newCodes = clean(updatedCfg);
    newCodes = uniq(newCodes);
    return config.update(cfgKey, newCodes, true);
  }

  static removeConfig(cfgKey: string, code: string) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get(cfgKey, []);
    const newCfg = sourceCfg.filter((item) => item !== code);
    return config.update(cfgKey, newCfg, true);
  }
}

export class LeekFundConfig extends BaseConfig {
  constructor() {
    super();
  }
  // Fund Begin
  static addFundGroupCfg(name: string, cb?: Function) {
    const config = workspace.getConfiguration();
    const updatedFundGroupCfg = [...config.get('leek-fund.fundGroups', []), name];
    config.update('leek-fund.fundGroups', updatedFundGroupCfg, true).then(() => {
      const updatedCfg = [...config.get('leek-fund.funds', []), []];
      config.update('leek-fund.funds', updatedCfg, true).then(() => {
        window.showInformationMessage(`Fund Group Successfully add.`);
        if (cb && typeof cb === 'function') {
          cb();
        }
      });
    });
  }

  static renameFundGroupCfg(groupId: string, cb?: Function) {
    window.showInputBox({ placeHolder: '请输入基金分组名称' }).then((name) => {
      if (!name) {
        return;
      }
      const config = workspace.getConfiguration();
      const sourceCfg: any = config.get('leek-fund.fundGroups', []);
      let index: string = groupId.replace('fundGroup_', '');
      sourceCfg[index] = name;
      config.update('leek-fund.fundGroups', sourceCfg, true).then(() => {
        window.showInformationMessage(`Fund Group Successfully rename.`);
        if (cb && typeof cb === 'function') {
          cb(groupId);
        }
      });
    });
  }

  static removeFundGroupCfg(groupId: string, cb?: Function) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get('leek-fund.funds', []);
    let removedFundGroup: Array<string> = [];
    let removedFundGroupIndex = -1;
    const updatedCfg = sourceCfg.filter((item, index) => {
      const id: string = `fundGroup_${index}`;
      if (id !== groupId) {
        return true;
      } else {
        removedFundGroup = item;
        removedFundGroupIndex = index;
        return false;
      }
    });

    const removeFundGroup = () => {
      if (removedFundGroupIndex !== -1) {
        config.update('leek-fund.funds', updatedCfg, true).then(() => {
          const updatedFundGroupCfg = config.get('leek-fund.fundGroups', []);
          updatedFundGroupCfg.splice(removedFundGroupIndex, 1);
          config.update('leek-fund.fundGroups', updatedFundGroupCfg, true).then(() => {
            window.showInformationMessage(`Fund Group Successfully delete.`);
            if (cb && typeof cb === 'function') {
              cb(groupId);
            }
          });
        });
      } else {
        window.showInformationMessage(`Fund Group Unsuccessfully delete.`);
      }
    };

    if (removedFundGroup.length) {
      window.showInformationMessage('删除分组会清空基金数据无法恢复，请确认！！', '好的', '取消').then((res) => {
        if (res === '好的') {
          removeFundGroup();
        }
      });
    } else {
      removeFundGroup();
    }
  }

  static addFundCfg(groupId: string, code: string, cb?: Function) {
    const config = workspace.getConfiguration();
    let sourceCfg = config.get('leek-fund.funds', []);
    let updatedFunds = undefined;
    let start = 0;
    sourceCfg.forEach((value, index) => {
      const id: string = `fundGroup_${index}`;
      if (id === groupId) {
        const funds = value as Array<string>;
        updatedFunds = [...funds, code];
        updatedFunds = clean(updatedFunds);
        updatedFunds = uniq(updatedFunds);
        start = index;
        return;
      }
    });

    if (updatedFunds) {
      sourceCfg.splice(start, 1, updatedFunds as never);
    }

    config.update('leek-fund.funds', sourceCfg, true).then(() => {
      window.showInformationMessage(`Fund Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  static removeFundCfg(code: string, cb?: Function) {
    const config = workspace.getConfiguration();
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const groupId: string = `${codeComponents[0]}_${codeComponents[1]}`;
    const fundCode: string = `${codeComponents[2]}`;
    let sourceCfg = config.get('leek-fund.funds', []);
    let updatedFunds = undefined;
    let start = 0;
    sourceCfg.forEach((value, index) => {
      const id: string = `fundGroup_${index}`;
      if (id === groupId) {
        const funds = value as Array<string>;
        updatedFunds = funds;
        updatedFunds.splice(updatedFunds.indexOf(fundCode), 1);
        updatedFunds = clean(updatedFunds);
        updatedFunds = uniq(updatedFunds);
        start = index;
        return;
      }
    });

    if (updatedFunds) {
      sourceCfg.splice(start, 1, updatedFunds as never);
    }

    config.update('leek-fund.funds', sourceCfg, true).then(() => {
      window.showInformationMessage(`Fund Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  static setFundTopCfg(code: string, cb?: Function) {
    const config = workspace.getConfiguration();
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const groupId: string = `${codeComponents[0]}_${codeComponents[1]}`;
    const fundCode: string = `${codeComponents[2]}`;
    let sourceCfg = config.get('leek-fund.funds', []);
    let updatedFunds = undefined;
    let start = 0;
    sourceCfg.forEach((value, index) => {
      const id: string = `fundGroup_${index}`;
      if (id === groupId) {
        const funds = value as Array<string>;
        updatedFunds = [fundCode, ...funds.filter((item) => item !== fundCode)];
        start = index;
        return;
      }
    });

    if (updatedFunds) {
      sourceCfg.splice(start, 1, updatedFunds as never);
    }

    config.update('leek-fund.funds', sourceCfg, true).then(() => {
      window.showInformationMessage(`Fund Successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  // Fund End

  // Stock Begin
  static updateStockCfg(codes: string, cb?: Function) {
    this.updateConfig('leek-fund.stocks', codes.split(',')).then(() => {
      window.showInformationMessage(`Stock Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }

  static removeStockCfg(code: string, cb?: Function) {
    this.removeConfig('leek-fund.stocks', code).then(() => {
      window.showInformationMessage(`Stock Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  //addStockToBarCfg
  static addStockToBarCfg(code: string, cb?: Function) {
    let configArr: string[] = this.getConfig('leek-fund.statusBarStock');
    if (configArr.length >= 4) {
      window.showInformationMessage(`StatusBar Exceeding Length.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    } else if (configArr.includes(code)) {
      window.showInformationMessage(`StatusBar Already Have.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    } else {
      configArr.push(code);
      this.setConfig('leek-fund.statusBarStock', configArr).then(() => {
        window.showInformationMessage(`Stock Successfully add to statusBar.`);
        if (cb && typeof cb === 'function') {
          cb(code);
        }
      });
    }

  }
  static setStockTopCfg(code: string, cb?: Function) {
    let configArr: string[] = this.getConfig('leek-fund.stocks');

    configArr = [code, ...configArr.filter((item) => item !== code)];

    this.setConfig('leek-fund.stocks', configArr).then(() => {
      window.showInformationMessage(`Stock successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  // Stock End

  // Binance Begin
  static updateBinanceCfg(codes: string, cb?: Function) {
    this.updateConfig('leek-fund.binance', codes.split(',')).then(() => {
      window.showInformationMessage(`Pair Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }
  static removeBinanceCfg(code: string, cb?: Function) {
    this.removeConfig('leek-fund.binance', code).then(() => {
      window.showInformationMessage(`Pair Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  static setBinanceTopCfg(code: string, cb?: Function) {
    let configArr: string[] = this.getConfig('leek-fund.binance');
    configArr = [code, ...configArr.filter((item) => item !== code)];
    this.setConfig('leek-fund.binance', configArr).then(() => {
      window.showInformationMessage(`Pair successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }
  // Binance end

  // StatusBar Begin
  static updateStatusBarStockCfg(codes: Array<string>, cb?: Function) {
    this.setConfig('leek-fund.statusBarStock', codes).then(() => {
      window.showInformationMessage(`Status Bar Stock Successfully update.`);
      if (cb && typeof cb === 'function') {
        cb(codes);
      }
    });
  }
  // StatusBar End
}
