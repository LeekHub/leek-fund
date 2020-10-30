import { commands, ViewColumn, window } from 'vscode';
import FundService from '../explorer/fundService';
import globalState from '../globalState';
import { LeekFundConfig } from '../shared/leekConfig';
import { LeekTreeItem } from '../shared/leekTreeItem';
import { IAmount } from '../shared/typed';
import { formatDate, toFixed } from '../shared/utils';
import ReusedWebviewPanel from './ReusedWebviewPanel';

async function setAmount(fundList: LeekTreeItem[] = []) {
  const amountObj: any = globalState.fundAmount || {};
  const list = fundList.map((item: LeekTreeItem) => {
    return {
      name: item.info?.name,
      code: item.id,
      percent: item.info?.percent,
      amount: amountObj[item.info?.code]?.amount || 0,
      earningPercent: item.info?.earningPercent,
      unitPrice: item.info?.unitPrice,
      earnings: item.info?.earnings || 0,
      yestEarnings: amountObj[item.info.code]?.earnings || 0,
    };
  });
  // console.log(JSON.stringify(list, null, 2));
  const panel = ReusedWebviewPanel.create('setAmountWebview', `基金持仓金额设置`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case 'success':
        console.log(JSON.parse(message.text));
        setAmountCfgCb(JSON.parse(message.text));
        return;
      case 'alert':
        window.showErrorMessage('保存失败！');
        return;
      case 'donate':
        commands.executeCommand('leek-fund.donate');
        return;
    }
  }, undefined);
  panel.webview.html = getWebviewContent(list);
}

function getWebviewContent(list: any[] = []) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>韭菜盒子</title>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, user-scalable=no"
      />
      <link
        href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.9.2/theme-chalk/index.css"
        rel="stylesheet"
      />
      <style>
        body,
        html {
          height: 100%;
          -webkit-tap-highlight-color: transparent;
        }

        div {
          margin-left: 20px;
          line-height: 28px;
        }
        .list .name,
        .amount {
          display: inline-block;
        }
        .unit{float: right;}
        .amount {
          float: right;
          width: 220px !important;
        }
        .name {
          font-size: 14px;
        }
        .item {
          margin-top: 10px;
        }
        .el-input {
          width: 160px;
          height: 28px;
        }
        .el-input__inner {
          height: 28px;
          width: 120px;
          background-color: #eee;
        }
        .main {
          margin: 30px auto;
          width: 820px;
        }
        .footer {
          width: 520px;
          margin: 30px auto;
          text-align: center;
        }
        .footer .info {
          font-size: 12px;
          margin-top: 20px;
          color: #696666;
        }
        .unitDiv{
          width:224px;
          float:right;
        }
        .unitPriceInput{
          width:100px;
        }
        .red{
          color:#F56C6C;
        }
        .green{
          color:green;
        }
      </style>
    </head>

    <body ontouchstart>
      <div class="main">
        <h2 style="text-align: center;color:#409EFF;">持仓金额 <span id="totalMoney"></span></h2>
        <p style="font-size: 12px; color: #696666;text-align:center">现在填写金额按昨日净值计算，所以今日加仓的建议明日更新持仓金额</p>
        <div class="list">

        </div>
        <div class="footer">
          <button
            class="el-button el-button--primary el-button--medium"
            id="save"
          >
            保存
          </button>
          <div class="info"></div>
        </div>
      </div>
      <script src="http://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>

      <script>
        const vscode = acquireVsCodeApi();
        const deviceId =
          Math.random().toString(16).substr(2) +
          Math.random().toString(32).substr(2);
        $(function () {
          const fundList = ${JSON.stringify(list)};
          const list = $('.list');

          let totalEarnings = 0;
          let totalMoney = 0;
          let listStr = '';
          fundList.forEach((item) => {
            const amount = item.amount || 0;
            const unitPrice = item.unitPrice || 0;
            const earningPercent = item.earningPercent || 0;
            const str =
              '<div class="item"><div class="name">' +
              item.name + '（<i class="'+(earningPercent>0?'red':'green')+'">'+earningPercent+'%</i>）'+
              '</div>' +
              '<div class="amount el-input">' +
              '持仓金额：<input type="number" class="amountInput el-input__inner" id="' +
              item.code +
              '" value="' +
              amount +
              '" /> <span class="unit">元</span> </div>' +
              '<div class="unitDiv el-input">' +
              '持仓成本价：<input type="number" class="unitPriceInput el-input__inner" id="' +
              item.code +
              '_unit" value="' +
              unitPrice +
              '" /> <span class="unit">元、</span> </div>' +
              '</div>';

            listStr += str;
            const earnings = item.earnings || 0;

            totalMoney += amount;
            totalEarnings += earnings;
          });
          list.html(listStr);
          $('#totalMoney').html(totalMoney.toFixed(2));

          $('.amountInput,.unitPriceInput').on('input', function (e) {
            const value = e.target.value;
            if (value.length > 12) {
              e.target.value = value.slice(0, 12);
            }
          });

          $('#save').click(() => {
            const ammountObj = {};
            fundList.forEach((item) => {
              let amount = $('#' + item.code).val();
              let unitPrice = $('#' + item.code + '_unit').val();
              amount = isNaN(Number(amount)) ? 0 : Number(amount);
              unitPrice = isNaN(Number(unitPrice)) ? 0 : Number(unitPrice);

              if (typeof ammountObj[item.code] !== 'object') {
                ammountObj[item.code] = {};
              }
              ammountObj[item.code].amount = amount;
              ammountObj[item.code].unitPrice = unitPrice;
              const earnings = item.earnings || 0;
              ammountObj[item.code].earnings = earnings;
            });

            fetchInfo(fundList, ({ Expansion, Datas }) => {
              const dates = [
                Expansion.FSRQ.substr(5, 5),
                Expansion.GZTIME.substr(5, 5),
              ];
              const result = [];
              totalMoney = 0;
              Datas.forEach((item) => {
                const amount = ammountObj[item.FCODE].amount;
                const unitPrice = ammountObj[item.FCODE].unitPrice;
                const obj = {
                  code: item.FCODE,
                  name: item.SHORTNAME,
                  unitPrice: unitPrice, // 成本价
                  amount: amount, // 持仓金额
                  earnings: ammountObj[item.FCODE].earnings,
                  price: item.NAV, // 净值
                  priceDate: item.PDATE, // 净值时间
                  isUpdated: item.PDATE.substr(5, 5) === item.GZTIME.substr(5, 5),
                };
                totalMoney += amount;
                result.push(obj);
              });
              $('#totalMoney').html(totalMoney.toFixed(2));
              // 和 vscode webview 通信
              vscode.postMessage({
                command: 'success',
                text: JSON.stringify(result),
              });
            });

          });

          if (totalEarnings !== 0) {
            const color = totalEarnings > 0 ? '#f55151' : 'green';
            let str =
              '估算收益为： <span style="font-size:16px;color:' +
              color +
              '">' +
              totalEarnings.toFixed(2) +
              '</span> 元，'+(totalEarnings>0?'继续加油💪！':'在A股，守住才会有收益，加油💪');
            if (totalEarnings >= 666) {
              str +=
                '&nbsp;恭喜吃肉，老板 <span style="color:#409EFF;cursor:pointer" id="donate">打赏</span> 一下！';
            }
            $('.footer .info').html(str);

            $('#donate').click(function () {
              vscode.postMessage({
                command: 'donate',
                text: '打赏',
              });
            });
          }
        });

        function fetchInfo(fundList, cb) {
          const params = {
            pageIndex: 1,
            pageSize: fundList.length,
            plat: 'Android',
            appType: 'ttjj',
            product: 'EFund',
            Version: 1,
            deviceid: deviceId,
            Fcodes: fundList
              .reduce((arr, item) => [...arr, item.code], [])
              .join(','),
          };
          if (!params.deviceid || !params.Fcodes) return;

          const paramsArr = [];
          for (let key in params) {
            if (key && params[key]) {
              paramsArr.push(key + '=' + params[key]);
            }
          }

          window
            .fetch(
              'https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?' +
                paramsArr.join('&')
            )
            .then((res) => {
              if (res.status !== 200) {
                console.log('获取数据失败');
                vscode.postMessage({
                  command: 'alert',
                  text: '获取数据失败',
                });
                return;
              }
              res.json().then(function (d) {
                cb(d);
              });
            });
        }
      </script>
    </body>
  </html>
`;
}

function setAmountCfgCb(data: IAmount[]) {
  const cfg: any = {};
  data.forEach((item: any) => {
    cfg[item.code] = {
      name: item.name,
      amount: item.amount || 0,
      price: item.price,
      unitPrice: item.unitPrice,
      earnings: item.earnings,
      priceDate: item.priceDate,
    };
  });
  LeekFundConfig.setConfig('leek-fund.fundAmount', cfg).then(() => {
    cacheFundAmountData(cfg);
    window.showInformationMessage('保存成功！（没开市的时候添加的持仓盈亏为0，开市时会自动计算）');
  });
}

/**
 * 更新持仓金额
 * @param leekModel
 */
export async function updateAmount() {
  const amountObj: any = globalState.fundAmount;
  const codes = Object.keys(amountObj);
  if (codes.length === 0) {
    return;
  }
  const filterCodes = [];
  for (const code of codes) {
    const amount = amountObj[code]?.amount;
    if (amount > 0) {
      filterCodes.push(code);
    }
  }
  try {
    const { Datas = [], Expansion } = await FundService.qryFundInfo(filterCodes);
    Datas.forEach((item: any) => {
      const { FCODE, NAV } = item;
      const time = item.GZTIME.substr(0, 10);
      const pdate = item.PDATE.substr(0, 10);
      const isUpdated = pdate === time; // 判断闭市的时候
      const money = amountObj[FCODE]?.amount || 0;
      const price = amountObj[FCODE]?.price || 0;
      const priceDate = amountObj[FCODE]?.priceDate || '';
      if (priceDate !== pdate) {
        const currentMoney = (money / price) * NAV;
        amountObj[FCODE].amount = toFixed(currentMoney);
        if (isUpdated) {
          // 闭市的时候保留上一次盈亏值
          amountObj[FCODE].earnings = toFixed(currentMoney - money);
        }
        amountObj[FCODE].priceDate = pdate;
        amountObj[FCODE].price = NAV;
      }
    });
    if (Datas.length > 0) {
      LeekFundConfig.setConfig('leek-fund.fundAmount', amountObj).then(() => {
        cacheFundAmountData(amountObj);
        console.log('🐥fundAmount has Updated ');
      });
    }
  } catch (e) {
    return [];
  }
}

export function cacheFundAmountData(amountObj: Object) {
  globalState.fundAmount = amountObj;
  globalState.fundAmountCacheDate = formatDate(new Date());
}

export default setAmount;
