import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { FundService } from '../service';
import { fundRankHtmlTemp } from '../utils';

async function fundRank(service: FundService) {
  const list = await service.getRankFund();
  const content = fundRankHtmlTemp(list);
  const panel = ReusedWebviewPanel.create('fundRankWebview', '基金排行榜', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = `<html>
  <style>
  /*压缩了，需要改格式化再修改*/
  .bg{background-color:#fff;color:#333}.red{color:Red}table{width:100%;min-width:700px;border-collapse:collapse}.name{display:block;width:140px;height:30px;overflow:hidden}.fblue:visited,.fblue a:visited{color:#800080;text-decoration:none}a{outline:0;text-decoration:none}.table{padding:32px 24px}.table thead th{font-size:15px}.table tbody td,.table tbody th{height:30px;line-height:30px;border-bottom:1px dashed #afafaf;text-align:center}tbody .colorize{color:#333}tbody .sort_up,tbody .sort_down{background-color:#eaf1ff}
  </style>
  <body class="bg">
    <br/>
    <p style="text-align: center; font-size:18px; width: 200px;margin: 0 auto;">基金回报排行榜前40</p>
    <p style="text-align: center; font-size:14px; width: 200px;margin: 0 auto;margin-top:4px"><a href="http://vip.stock.finance.sina.com.cn/fund_center/index.html#hbphall" target="_blank">查看更多</a></p>
    <div class="table">
      ${content}
    </div>
  </body></html>`;
}

export default fundRank;
