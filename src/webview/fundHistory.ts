import Axios from 'axios';
import { ViewColumn } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { randHeader } from '../shared/utils';

const fundHistoryUrl = (code: string): string => {
  return `http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=${code}&page=1&per=49`;
};

async function getFundHistoryByCode(code: string) {
  try {
    const response = await Axios.get(fundHistoryUrl(code), {
      headers: randHeader(),
    });

    const idxs = response.data.indexOf('"<table');
    const lastIdx = response.data.indexOf('</table>"');
    const content = response.data.slice(idxs + 1, lastIdx);
    // console.log(idxs, lastIdx, content);
    return { code, content };
  } catch (err) {
    console.log(err);
    return { code, content: '历史净值获取失败' };
  }
}

async function fundHistory(item: LeekTreeItem) {
  const { code, name } = item.info;
  const res = await getFundHistoryByCode(code);
  const panel = ReusedWebviewPanel.create(
    'fundHistoryWebview',
    `基金历史净值(${code})`,
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.webview.html = `<html>
  <style>
  .lsjz{
    width: 100%;
    min-width:600px;
    text-align: center;
  }
  .red{
    color:red;
  }
  .grn{
    color:green;
  }
  .history{padding: 32px 24px;}
  .trend{
    width: 700px;
    margin: 10px auto;
    text-align: center;
  }
  .fund-sstrend{
    width:700px;
  }
  .box {
    border-top: 1px solid #bababa;
    padding: 10px;
    margin-top:20px;
  }
  </style>
  <body>

    <div class="history">
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」历史净值</p>
    <div class="box">
    ${res.content}
    <p style="text-align: center;">
    <a href="http://fundf10.eastmoney.com/jjjz_${code}.html" target="_blank">查看全部历史净值明细>></a>
    </p>
    </div>

    </div>
  </body></html>`;
}

export default fundHistory;
