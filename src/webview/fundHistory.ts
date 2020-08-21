import { ViewColumn } from 'vscode';
import { LeekTreeItem } from '../leekTreeItem';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { FundService } from '../service';

async function fundHistory(service: FundService, item: LeekTreeItem) {
  const { code, name } = item.info;
  const res = await service.getFundHistoryByCode(code);
  const panel = ReusedWebviewPanel.create(
    'fundRankWebview',
    `基金持仓&历史净值(${code})`,
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
  </style>
  <body>
    <br/>
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」持仓信息</p>
    <div class="trend"><img
      class="fund-sstrend"
      src="http://j6.dfcfw.com/charts/StockPos/${code}.png?rt=${new Date().getTime()}"
      alt="「${name}」- ${code}"
    />
    </div>
    <div class="history">
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」历史净值</p>
    <hr />
    ${res.content}
    </div>
  </body></html>`;
}

export default fundHistory;
