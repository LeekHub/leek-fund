import Axios from 'axios';
import * as cheerio from 'cheerio';
import { ExtensionContext, TreeItem, TreeItemCollapsibleState } from 'vscode';

export interface BaseForexItemInfo {
  name: string // 货币名称
  spotBuyPrice?: number // 现汇买入价
  cashBuyPrice?: number // 现钞买入价
  spotSellPrice?: number // 现汇卖出价
  cashSellPrice?: number // 现钞卖出价
  conversionPrice?: number // 中行折算价
  publishDateTime?: string // 发布日期：年月日 时分秒
}

export interface ForexItemInfo extends BaseForexItemInfo {

}

export interface BocForexDataItem extends BaseForexItemInfo {
  publishTime: string // 发布时间：时分秒
}


export class ForexTreeItem extends TreeItem {
  forexItemInfo: ForexItemInfo;
  context?: ExtensionContext;

  constructor(forexItemInfo: ForexItemInfo, context: ExtensionContext | undefined) {
    super('', TreeItemCollapsibleState.None);
    this.forexItemInfo = forexItemInfo;
    this.context = context;
    const {
      name,
      spotBuyPrice,
      cashBuyPrice,
      spotSellPrice,
      cashSellPrice,
      conversionPrice,
      publishDateTime,
    } = forexItemInfo;
    let label = `「${name}」`;
    if (spotBuyPrice && spotSellPrice) { // 有的外汇币种没有现汇价格
      label += `  现汇：${spotBuyPrice.toString().padStart(6)} / ${spotSellPrice.toString().padStart(6)}`;
    } else if (cashBuyPrice && cashSellPrice) {
      label += `  现钞：${cashBuyPrice.toString().padStart(6)} / ${cashSellPrice.toString().padStart(6)}`;
    }
    this.label = label;
    this.tooltip = `现汇买入价：${spotBuyPrice}\n现钞买入价：${cashBuyPrice}\n现汇卖出价：${spotSellPrice}\n现钞卖出价：${cashSellPrice}\n中行折算价：${conversionPrice}\n发布日期：${publishDateTime}`;
  }
}

// export default class ForexService extends LeekService {
export default class ForexService {
  private context: ExtensionContext;
  private priorityList = [
    '美元',
    '欧元',
    '英镑',
    '卢布',
    '港币',
    '澳门元',
    '新台币',
    '日元',
    '韩国元',
  ];

  constructor(context: ExtensionContext) {
    this.context = context;
    this.priorityList.reverse();
  }

  async getData(): Promise<Array<ForexTreeItem>> {
    try {
      const bocForexDataList = await ForexService.getDataFromBoc();

      bocForexDataList.sort((a, b) => {
        return this.priorityList.indexOf(b.name) - this.priorityList.indexOf(a.name);
      });

      return bocForexDataList.map((item: BocForexDataItem) => {
        return new ForexTreeItem(item, this.context);
      });
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  static async getDataFromBoc(): Promise<BocForexDataItem[]> {
    // 从中国银行外汇牌价页面获取数据，如果找到更好的数据源可以酌情更换
    const html = await ForexService.getHtmlFormBoc();
    if (!html) {
      return [];
    }
    const $ = cheerio.load(html);
    const bocForexDataList: BocForexDataItem[] = [];
    const keyList = [
      'name', 'spotBuyPrice', 'cashBuyPrice', 'spotSellPrice',
      'cashSellPrice', 'conversionPrice', 'publishDateTime', 'publishTime',
    ];
    $('table').eq(1).find('tr').each(function (i, trElement) {
      let rowData: BocForexDataItem | any = {};
      $(trElement).find('td').each(function (j, tdElement) {
        let v = $(tdElement).text();
        let k = keyList[j];
        rowData[k] = v;
      });
      if (Object.keys(rowData).length !== 0) {
        bocForexDataList.push(rowData);
      }
    });

    return bocForexDataList;
  }

  static getHtmlFormBoc(): Promise<any> {
    return new Promise((resolve) => {
      Axios.get('https://www.boc.cn/sourcedb/whpj/index.html')
        .then((resp) => {
          resolve(resp.data);
        }).catch((err) => {
        console.error(err);
        resolve('');
      });
    });
  }
}
