/*--------------------------------------------------------------
 *  Copyright (c) Nicky<giscafer@outlook.com>. All rights reserved.
 *  Licensed under the MIT License.
 *  Github: https://github.com/giscafer
 *-------------------------------------------------------------*/

import { window, workspace } from 'vscode';
import globalState from '../globalState';
import { clean, uniq, events } from './utils';
import { compact, flattenDeep } from 'lodash';

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

  static async updateConfig(cfgKey: string, codes: Array<string>) {
    const config = workspace.getConfiguration();
    const origin: string[] = config.get(cfgKey, []);
    let newCodes = uniq(compact(origin.concat(codes)));
    console.log(`🚀 ~ BaseConfig ~ updateConfig ~ ${cfgKey}:`, newCodes);
    await config.update(cfgKey, newCodes, true);
    return newCodes;
  }

  static removeConfig(cfgKey: string, code: string) {
    const config = workspace.getConfiguration();
    const sourceCfg = config.get(cfgKey, []);
    const newCfg = sourceCfg.filter((item) => item !== code);
    if (sourceCfg.length === newCfg.length) {
      window.showInformationMessage(`删除期货不成功。请 [点击此处](https://github.com/LeekHub/leek-fund/issues/281) 查看期货相关问题`);
    }
    return config.update(cfgKey, newCfg, true);
  }
}

export class LeekFundConfig extends BaseConfig {
  constructor() {
    super();
  }
  // Fund Begin
  static addFundGroupCfg(name: string, cb?: Function) {
    globalState.fundGroups.push(name);
    globalState.fundLists.push([]);
    this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Group Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(name);
    }
  }

  static renameFundGroupCfg(groupId: string, name: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    globalState.fundGroups[index] = name;
    this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
    window.showInformationMessage(`Fund Group Successfully rename.`);
    if (cb && typeof cb === 'function') {
      cb(groupId);
    }
  }

  static removeFundGroupCfg(groupId: string, cb?: Function) {
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    const removedFundList: Array<string> = globalState.fundLists[index];
    const removeFundGroup = () => {
      globalState.fundGroups.splice(index, 1);
      globalState.fundLists.splice(index, 1);
      this.setConfig('leek-fund.fundGroups', globalState.fundGroups);
      this.setConfig('leek-fund.funds', globalState.fundLists);
      window.showInformationMessage(`Fund Group Successfully delete.`);
      if (cb && typeof cb === 'function') {
        cb(groupId);
      }
    };

    if (removedFundList.length) {
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
    const index: number = parseInt(groupId.replace('fundGroup_', ''));
    const funds = globalState.fundLists[index] as Array<string | number>;
    let updatedFunds = [...funds, code];
    updatedFunds = clean(updatedFunds);
    updatedFunds = uniq(updatedFunds);
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully add.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }

  static removeFundCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const fundCode: string = codeComponents[2];
    const funds = globalState.fundLists[index] as Array<string | number>;
    let updatedFunds = funds;
    updatedFunds.splice(updatedFunds.indexOf(fundCode), 1);
    updatedFunds = clean(updatedFunds);
    updatedFunds = uniq(updatedFunds);
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully delete.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }

  static setFundTopCfg(code: string, cb?: Function) {
    const codeComponents = code.split('_');
    if (codeComponents.length < 3) {
      window.showInformationMessage(`Fund Id error.`);
      return;
    }
    const index: number = parseInt(codeComponents[1]);
    const fundCode: string = codeComponents[2];
    const funds = globalState.fundLists[index] as Array<string>;
    const updatedFunds = [fundCode, ...funds.filter((item) => item !== fundCode)];
    globalState.fundLists[index] = updatedFunds as never;
    this.setConfig('leek-fund.funds', globalState.fundLists);
    window.showInformationMessage(`Fund Successfully set to top.`);
    if (cb && typeof cb === 'function') {
      cb(code);
    }
  }
  // Fund End

  // Stock Begin
  static updateStockCfg(list: string, cb?: Function) {
    const cfgKey = 'leek-fund.stocks';
    const config = workspace.getConfiguration();
    const origin: string[] = config.get(cfgKey, []);
    let codes = typeof list === 'string' ? list.split(',') : list;
    let newCodes = uniq(compact(flattenDeep(origin).concat(codes)));
    config.update(cfgKey, newCodes, true).then(() => {
      window.showInformationMessage(`Stock Successfully add.`);
      if (cb && typeof cb === 'function') {
        cb(codes, newCodes);
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

  static addStockToBarCfg(code: string, cb?: Function) {
    const addStockToBar = () => {
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
    };

    if (this.getConfig('leek-fund.hideStatusBarStock')) {
      this.setConfig('leek-fund.hideStatusBarStock', false).then(() => {
        addStockToBar();
      });
    } else {
      addStockToBar();
    }
  }

  static setStockTopCfg(code: string, cb?: Function) {
    let arr: string[] = this.getConfig('leek-fund.stocks');
    // 临时解决3.10.1~3.10.3 pr产生的分组bug
    const stockList = flattenDeep(arr).filter?.((item) => item !== code);
    stockList.unshift(code);

    this.setConfig('leek-fund.stocks', stockList).then(() => {
      window.showInformationMessage(`Stock successfully set to top.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    });
  }

  static setStockUpCfg(code: string, cb?: Function) {
    const callback = () => {
      window.showInformationMessage(`Stock successfully move up.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    };

    let configArr: string[] = this.getConfig('leek-fund.stocks');
    const currentIndex = configArr.indexOf(code);
    let previousIndex = currentIndex - 1;
    // 找到前一个同市场的股票
    for (let index = currentIndex - 1; index >= 0; index--) {
      const previousCode = configArr[index];
      if (/^(sh|sz|bj)/.test(code) && /^(sh|sz|bj)/.test(previousCode)) {
        previousIndex = index;
        break;
      }
      if (/^(hk)/.test(code) && /^(hk)/.test(previousCode)) {
        previousIndex = index;
        break;
      }
      if (/^(usr_)/.test(code) && /^(usr_)/.test(previousCode)) {
        previousIndex = index;
        break;
      }
      if (/^(nf_)/.test(code) && /^(nf_)/.test(previousCode)) {
        previousIndex = index;
        break;
      }
      if (/^(hf_)/.test(code) && /^(hf_)/.test(previousCode)) {
        previousIndex = index;
        break;
      }
    }
    if (previousIndex < 0) {
      callback();
    } else {
      // 交换位置
      configArr[currentIndex] = configArr.splice(previousIndex, 1, configArr[currentIndex])[0];
      this.setConfig('leek-fund.stocks', configArr).then(() => {
        callback();
      });
    }
  }

  static setStockDownCfg(code: string, cb?: Function) {
    const callback = () => {
      window.showInformationMessage(`Stock successfully move down.`);
      if (cb && typeof cb === 'function') {
        cb(code);
      }
    };

    let configArr: string[] = this.getConfig('leek-fund.stocks');
    const currentIndex = configArr.indexOf(code);
    let nextIndex = currentIndex + 1;
    //找到后一个同市场的股票
    for (let index = currentIndex + 1; index < configArr.length; index++) {
      const nextCode = configArr[index];
      if (/^(sh|sz|bj)/.test(code) && /^(sh|sz|bj)/.test(nextCode)) {
        nextIndex = index;
        break;
      }
      if (/^(hk)/.test(code) && /^(hk)/.test(nextCode)) {
        nextIndex = index;
        break;
      }
      if (/^(usr_)/.test(code) && /^(usr_)/.test(nextCode)) {
        nextIndex = index;
        break;
      }
      if (/^(nf_)/.test(code) && /^(nf_)/.test(nextCode)) {
        nextIndex = index;
        break;
      }
      if (/^(hf_)/.test(code) && /^(hf_)/.test(nextCode)) {
        nextIndex = index;
        break;
      }
    }
    if (nextIndex >= configArr.length) {
      callback();
    } else {
      // 交换位置
      configArr[currentIndex] = configArr.splice(nextIndex, 1, configArr[currentIndex])[0];
      this.setConfig('leek-fund.stocks', configArr).then(() => {
        callback();
      });
    }
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
    const updateStatusBarStock = () => {
      this.setConfig('leek-fund.statusBarStock', codes).then(() => {
        window.showInformationMessage(`Status Bar Stock Successfully update.`);
        if (cb && typeof cb === 'function') {
          cb(codes);
        }
      });
    };

    if (codes.length) {
      if (this.getConfig('leek-fund.hideStatusBarStock')) {
        this.setConfig('leek-fund.hideStatusBarStock', false).then(() => {
          updateStatusBarStock();
        });
      } else {
        updateStatusBarStock();
      }
    } else {
      if (!this.getConfig('leek-fund.hideStatusBarStock')) {
        this.setConfig('leek-fund.hideStatusBarStock', true).then(() => {
          updateStatusBarStock();
        });
      } else {
        updateStatusBarStock();
      }
    }
  }
  // StatusBar End
}
