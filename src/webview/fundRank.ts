import { ViewColumn } from 'vscode';
import FundService from '../explorer/fundService';
import ReusedWebviewPanel from './ReusedWebviewPanel';

const fundRankHtmlTemp = (list: any[] = []) => {
  let tbody = '';
  const thead = `
  <thead><tr ><th class="colorize">序号</th><th class="colorize">基金代码</th><th class="colorize">基金名称</th><th class="r_20 colorize">单位净值</th><th class="r_20 colorize">累计净值</th><th class="r_20">近三个月(%)</th><th class="r_20">近六个月(%)</th><th class=" r_20">近一年(%)</th><th class="sort_down r_20">今年以来(%)</th><th class=" r_20">成立以来(%)</th></tr></thead>`;
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const {
      symbol,
      name,
      three_month,
      six_month,
      one_year,
      form_year,
      form_start,
      dwjz,
      ljjz,
    } = item;
    tbody += `<tr class="red">
    <td class="colorize">${i + 1}</td>
    <td class="colorize"><a href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=${symbol}&amp;country=fund" target="_blank">${symbol}</a></td>
    <td class="colorize"><a href="http://biz.finance.sina.com.cn/suggest/lookup_n.php?q=${symbol}&amp;country=fund" target="_blank" title="${name}" class="name">${name}</a></td>
    <td class="r_20 colorize">${dwjz}</td>
    <td class="r_20 colorize">${ljjz}</td>
    <td class="r_20">${three_month}</td>
    <td class="r_20">${six_month}</td>
    <td class="r_20">${one_year}</td>
    <td class="r_20 sort_down r_20">${form_year}</td>
    <td class="r_20">${form_start}</td>
    </tr>`;
  }

  return `<table boder="0">${thead}<tbody>${tbody} </tbody></table>`;
};

async function fundRank() {
  const list = await FundService.getRankFund();
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
