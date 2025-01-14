import Axios from 'axios';
import { load } from 'cheerio';
import { ExtensionContext } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { ForexData, FundInfo, TreeItemType } from '../shared/typed';
import { LeekService } from './leekService';
import globalState from '../globalState';

export class ForexService extends LeekService {
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

  private forexMap: Record<string, RegExp | ((code: string) => boolean)> = {
    '美元': /^usr_/,
    '港币': /^hk/
  };


  constructor(context: ExtensionContext) {
    super();
    this.context = context;
    this.priorityList.reverse();
  }

  async getData(): Promise<Array<LeekTreeItem>> {
    try {
      // 从中国银行外汇牌价页面获取数据，如果找到更好的数据源可以酌情更换
      const html = await ForexService.getHtmlFormBoc();
      if (!html) {
        return [];
      }

      const $ = load(html);
      const bocForexDataList: LeekTreeItem[] = [];

      const forexList: Array<ForexData> = [];
      $('table').eq(1).find('tr').each((i, trElement) => {
        const rowData: FundInfo = {
          percent: '',
          name: '',
          code: '',
          _itemType: TreeItemType.FOREX,
          showLabel: this.showLabel,
          type: 'nodata'
        };
        $(trElement).find('td').each((j, tdElement) => {
          const value = $(tdElement).text();
          switch (j) {
            case 0:
              rowData.name = value;
              break;

            case 1:
              rowData.spotBuyPrice = Number(value);
              break;

            case 2:
              rowData.cashBuyPrice = Number(value);
              break;

            case 3:
              rowData.spotSellPrice = Number(value);
              break;

            case 4:
              rowData.cashSellPrice = Number(value);
              break;

            case 5:
              rowData.conversionPrice = Number(value);
              break;

            case 6:
              rowData.publishDateTime = value;
              break;

            case 7:
              rowData.publishTime = value;
              break;

            default:
              break;
          }
        });
        if (rowData.name.length) {
          const treeItem = new LeekTreeItem(rowData, this.context);
          bocForexDataList.push(treeItem);

          const filter = this.forexMap[rowData.name];
          if (filter) {
            forexList.push({
              filter,
              ...rowData,
            });
          }
        }
      });

      if (forexList.length > 0) {
        globalState.forexList = forexList;
      }

      bocForexDataList.sort((a, b) => {
        return this.priorityList.indexOf(b.info.name) - this.priorityList.indexOf(a.info.name);
      });

      return bocForexDataList;
    } catch (err) {
      console.log(err);
      return [];
    }
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
