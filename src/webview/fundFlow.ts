import { ViewColumn, ExtensionContext } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';

function fundFlow(context: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('leek-fund.fundFlow', '资金流向', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getWebViewContent();
}

function getWebViewContent() {
  return `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>资金流向</title>
    <style>
      .main-content {
        width: 1200px;
        padding: 24px;
        margin: 0 auto;
      }
      .maincont {
        width: 1200px;
        min-height: 350px;
      }
      ul,
      li {
        list-style: none;
        list-style-image: none;
      }
      .chart-data-cont {
        width: 500px;
        margin-top: 20px;
      }
      .chart-data-cont ul li {
        height: 25px;
        line-height: 25px;
      }
      .chart-data-cont .remark li {
        min-width: 420px;
        color: #666;
        padding-left: 15px;
      }
      .chart-data-cont .remark li a {
        text-decoration: underline;
      }
      .fLeft {
        float: left;
      }
      .w100 {
        min-width: 120px;
      }
      .w72 {
        min-width: 92px;
      }
      .btE4E4E4 {
        border-bottom: 1px solid #e4e4e4;
      }
      .red,
      a:link.red {
        padding-left: 4px;
        color: red !important;
      }
      .green,
      a:link.green {
        padding-left: 4px;
        color: green !important;
      }
      .blockColor {
        float: left;
        width: 15px;
        height: 15px;
        margin: 5px 10px;
      }
      .bgcFE3EE1 {
        background-color: #fe3ee1;
      }
      .bgc650000 {
        background-color: #650000;
      }
      .bgc94C4EE {
        background-color: #94c4ee;
      }

      .bgc94c4ee {
        background-color: #2383fc;
      }
      .bgcea5404 {
        background-color: #ff5bff;
      }
      .bgc4a3116 {
        background-color: #6b3906;
      }
      .shortbar {
        height: 36px;
        border-bottom: 2px solid #2f5795;
        margin-bottom: 10px;
      }
      .titbar {
        /* max-width: 1200px; */
        clear: both;
        height: 38px;
        background-color: #fff;
      }
      .titbar .tit {
        float: left;
        font-family: 微软雅黑;
        font-size: 18px;
        line-height: 30px;
        padding: 3px 0 0 10px;
        text-align: left;
        white-space: nowrap;
      }
      .titHgtsgt {
        float: left;
        font-family: 微软雅黑;
        font-size: 15px;
        line-height: 30px;
        padding: 3px 0 0 10px;
        text-align: left;
        white-space: nowrap;
        color: #666;
      }
      .titbar .right-tips {
        line-height: 34px;
        height: 34px;
        font-size: 12px;
        float: right;
        margin-right: 6px;
      }
      .sepe {
        height: 3px;
        overflow: hidden;
        margin-bottom: 10px;
        clear: both;
      }
      .sepe .left {
        background-color: #2f5795;
        float: left;
        height: 1px;
        margin-top: 2px;
      }
      .sepe .right {
        background-color: #2f5795;
        float: left;
        height: 3px;
        width: 100%;
      }
      .contentBox {
        display: block;
        float: left;
        /* width: 100%; */
        background-color: #fff;
      }
      table.t2 {
        width: 1200px;
        margin-bottom: 10px;
      }
      table.t2 tbody {
        background-color: #fff;
        width: 100%;
      }
      table.t2 tr {
        line-height: 30px;
        height: 30px;
        border-bottom: 1px solid #bbd4e8;
        text-align: center;
      }

      table.t2.hsgzjlx tr.bbLightBlue {
        border-bottom: 1px solid #bbd4e8 !important;
      }
      /*  table.t2.hsgzjlx tr {
              border: 0px;
            } */
      table.t2.ns2.hsgzjlx tbody td.bbLightBlue {
        border-bottom: 1px solid #bbd4e8 !important;
        font-size: 17px;
        font-family: 微软雅黑;
      }
      table.t2.hsgzjlx tr.bbLightBlue {
        border-bottom: 1px solid #bbd4e8 !important;
      }
      .contentBxzj,
      .contentNxzj {
        float: left;
        width: 500px;
        padding: 8px 32px;
      }
      .image img {
        width: 500px;
      }
      body {
        background: #fff;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="main-content">
      <div class="contentBox" style="border-top: 0; margin-top: -10px">
        <div class="titbar" style="overflow: visible">
          <b class="el"></b>
          <div class="tit">沪深港通资金流向</div>
          <i
            class="questionImg"
            title=" “沪港通”和“深港通”合称为“沪深港通”"
          ></i>
        </div>
        <div class="sepe">
          <div class="left" style="width: 174px"></div>
          <div class="right" style="width: 1026px"></div>
        </div>
        <div class="contentBox" style="border-top: 0; margin-top: -10px">
          <table
            cellpadding="0"
            cellspacing="0"
            class="t2 ns2 hsgzjlx"
            id="hgttable"
          >
            <thead>
              <tr class="bbDeepBlue">
                <th style="width: 8%">类型</th>
                <th style="width: 8%">
                  板块<i
                    class="question"
                    title="港股通(沪)代表沪港通的港股通部分，港股通(深)代表深港通的港股通部分。"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i
                  >
                </th>
                <th style="width: 8%">
                  资金方向<i
                    class="question"
                    title="香港投资者交易内地股票，称为北向资金，内地投资者交易香港股票，称为南向资金。"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i
                  >
                </th>
                <th style="width: 7%">交易状态</th>
                <th style="width: 12%">
                  资金净流入<i
                    class="question"
                    title="当日资金流入额=当日限额-当日余额。当日资金流入额包含两部分：当日成交净买额，当日申报但未成交的买单金额。"
                    >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</i
                  >
                </th>
                <th style="width: 12%">成交净买额</th>
                <th style="width: 12%">当日资金余额</th>
                <th style="width: 6%">上涨数</th>
                <th style="width: 6%">持平数</th>
                <th style="width: 6%">下跌数</th>
                <th style="width: 6%">相关指数</th>
                <th style="width: 10%">指数涨跌幅</th>
              </tr>
            </thead>
            <tbody>
              <tr id="zjlx_hgt">
                <td rowspan="2" class="bbLightBlue" style="line-height: 18px">
                  沪港通
                </td>
                <td>
                  <a
                    href="https://quote.eastmoney.com/center/list.html#28003707_12_2"
                    >沪股通</a
                  >
                </td>
                <td>北向</td>
                <td>收盘</td>
                <td><span class="red">46.09亿元</span></td>
                <td><span class="red">34.34亿元</span></td>
                <td>473.91亿元</td>
                <td><span class="red">443</span></td>
                <td><span>25</span></td>
                <td><span class="green">112</span></td>
                <td>
                  <a href="https://quote.eastmoney.com/zs000001.html"
                    >上证指数</a
                  >
                </td>
                <td><span class="red">1.19%</span></td>
              </tr>
              <tr id="zjlx_ggth" class="bbLightBlue">
                <td>
                  <a
                    href="https://quote.eastmoney.com/center/list.html#mk0144_12"
                    >港股通(沪)</a
                  >
                </td>
                <td>南向</td>
                <td>收盘</td>
                <td><span class="red">11.02亿元</span></td>
                <td><span class="red">6.15亿元</span></td>
                <td>408.98亿元</td>
                <td><span class="red">150</span></td>
                <td><span>34</span></td>
                <td><span class="green">133</span></td>
                <td>
                  <a href="https://quote.eastmoney.com/hk/zs110000.html"
                    >恒生指数</a
                  >
                </td>
                <td><span class="green">-0.19%</span></td>
              </tr>
              <tr id="zjlx_sgt">
                <td rowspan="2" class="bbLightBlue" style="line-height: 18px">
                  深港通
                </td>
                <td>
                  <a
                    href="https://quote.eastmoney.com/center/list.html#28013804_12_3"
                    >深股通</a
                  >
                </td>
                <td>北向</td>
                <td>收盘</td>
                <td><span class="red">42.30亿元</span></td>
                <td><span class="red">29.95亿元</span></td>
                <td>477.70亿元</td>
                <td><span class="red">629</span></td>
                <td><span>22</span></td>
                <td><span class="green">149</span></td>
                <td>
                  <a href="https://quote.eastmoney.com/zs399001.html"
                    >深证成指</a
                  >
                </td>
                <td><span class="red">1.49%</span></td>
              </tr>
              <tr id="zjlx_ggts" class="bbLightBlue">
                <td>
                  <a
                    href="https://quote.eastmoney.com/center/list.html#mk0146_12"
                    >港股通(深)</a
                  >
                </td>
                <td>南向</td>
                <td>收盘</td>
                <td><span class="red">24.45亿元</span></td>
                <td><span class="red">20.44亿元</span></td>
                <td>395.55亿元</td>
                <td><span class="red">236</span></td>
                <td><span>45</span></td>
                <td><span class="green">195</span></td>
                <td>
                  <a href="https://quote.eastmoney.com/hk/zs110000.html"
                    >恒生指数</a
                  >
                </td>
                <td><span class="green">-0.19%</span></td>
              </tr>
              <tr class="bbLightBlue">
                <td
                  colspan="12"
                  style="text-align: left; text-indent: 10px; color: #666"
                >
                  注：资金净流入=当日资金限额-当日资金余额。资金净流入包含<a
                    target="_self"
                    href="#lssj"
                    >当日成交净买额</a
                  >和当日买入申报未成交金额。
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- TODO 即可请求刷新 -->
      <div class="maincont">
        <div class="contentBxzj">
          <div class="chart-data-cont">
            <div class="titbar shortbar">
              <div class="tit">北向资金</div>
              <div class="titHgtsgt">沪股通、深股通</div>
              <i
                class="questionImg"
                title="北向资金包含沪股通和深股通两部分。"
              ></i>
              <div class="right-tips">
                数据日期：<span id="updateTime_bxzj">LeekFund</span>
                <a href="https://data.eastmoney.com/hsgtcg/gzcglist.html"
                  >更多</a
                >
              </div>
            </div>
            <div id="emchart-bxzj" class="image"></div>
            <ul id="north_zjl" class="bE4E4E4">
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgc94c4ee"></span><span>沪股通</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="north_1"
                    ><span class="red">46.09亿元</span></span
                  ></span
                ><span>当日余额</span
                ><span
                  ><span id="north_2"
                    ><span class="red">473.91亿元</span></span
                  ></span
                >
              </li>
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgcea5404"></span><span>深股通</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="north_3"
                    ><span class="red">42.30亿元</span></span
                  ></span
                ><span>当日余额</span
                ><span
                  ><span id="north_4"
                    ><span class="red">477.70亿元</span></span
                  ></span
                >
              </li>
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgc4a3116"></span
                  ><span>北向资金</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="north_5"
                    ><span class="red">88.39亿元</span></span
                  ></span
                >
              </li>
            </ul>
            <ul class="remark">
              <li>
                注：北向资金是沪股通与深股通的资金加总；资金数据仅供参考。<a
                  href="https://finance.eastmoney.com/news/1622,20161118685370149.html"
                  >了解详细</a
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="contentNxzj">
          <div class="chart-data-cont">
            <div class="titbar shortbar">
              <div class="tit">南向资金</div>
              <div class="titHgtsgt">港股通(沪)、港股通(深)</div>
              <i
                class="questionImg"
                title="南向资金包含港股通(沪)和港股通(深)两部分。"
              ></i>
              <div class="right-tips">
                数据日期：<span id="updateTime_nxzj">08-14</span>
                <a href="https://data.eastmoney.com/hsgtcg/lz.html">更多</a>
              </div>
            </div>
            <div id="emchart-nxzj" class="image"></div>
            <ul id="south_zjl" class="bE4E4E4">
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgc94c4ee"></span
                  ><span>港股通(沪)</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="south_1"
                    ><span class="red">11.02亿元</span></span
                  ></span
                ><span>当日余额</span
                ><span
                  ><span id="south_2"
                    ><span class="red">408.98亿元</span></span
                  ></span
                >
              </li>
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgcea5404"></span
                  ><span>港股通(深)</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="south_3"
                    ><span class="red">LeekFund</span></span
                  ></span
                ><span>当日余额</span
                ><span
                  ><span id="south_4"
                    ><span class="red">LeekFund</span></span
                  ></span
                >
              </li>
              <li class="btE4E4E4">
                <div class="w100 fLeft">
                  <span class="blockColor bgc4a3116"></span
                  ><span>南向资金</span>
                </div>
                <span class="fLeft">当日净流入</span
                ><span class="fLeft w72"
                  ><span id="south_5"
                    ><span class="red">35.47亿元</span></span
                  ></span
                >
              </li>
            </ul>
            <ul class="remark">
              <li>注：南向资金，是港股通(沪)资金与港股通(深)资金的加总。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <script src="https://emres.dfcfw.com/common/js/jquery.1.8.3.min.js"></script>
    <script>
      console.log($, jQuery);
      var newHqDomain = 'https://push2.eastmoney.com/';
      var v4Domain = 'https://dcfm.eastmoney.com/';
      var newHqut = 'b2884a393a59ad64002292a3e90d46a5';
      var url1 =
        newHqDomain +
        'api/qt/kamt/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f63&ut=' +
        newHqut;
      var url2 =
        newHqDomain +
        'api/qt/ulist.np/get?secids=90.BK0707,201.HK32,90.BK0804,201.HK31,1.000001,100.HSI,0.399001&fields=f12,f13,f3,f104,f105,f106&ut=' +
        newHqut;
      //获得随机数
      function getCode(num) {
        var str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var codes = str.split('');
        num = num || 6;
        var code = '';
        for (var i = 0; i < num; i++) {
          code += codes[Math.floor(Math.random() * 52)];
        }
        return code;
      }
      var tr1 = jQuery('#zjlx_hgt td');
      var tr2 = jQuery('#zjlx_ggth td');
      var tr3 = jQuery('#zjlx_sgt td');
      var tr4 = jQuery('#zjlx_ggts td');
      var trs = [tr1, tr2, tr3, tr4];

      function newUpdateZjlx() {
        jQuery.ajax({
          type: 'get',
          url: url1,
          dataType: 'jsonp',
          jsonp: 'cb',
          success: function (json1) {
            var data1 = json1.data;
            tr1.eq(3).html(SwitchTag(data1.hk2sh.status));
            tr1.eq(4).html(getcolorw(data1.hk2sh.dayNetAmtIn));
            tr1.eq(5).html(getcolorw(data1.hk2sh.netBuyAmt));
            tr1
              .eq(6)
              .html((data1.hk2sh.dayAmtRemain / 10000).toFixed(2) + '亿元');
            //tr1.eq(7).html((data1.hk2sh.dayAmtThreshold / 10000).toFixed(2) + '亿元');

            tr2.eq(2).html(SwitchTag(data1.sh2hk.status));
            tr2.eq(3).html(getcolorw(data1.sh2hk.dayNetAmtIn));
            tr2.eq(4).html(getcolorw(data1.sh2hk.netBuyAmt));
            tr2
              .eq(5)
              .html((data1.sh2hk.dayAmtRemain / 10000).toFixed(2) + '亿元');
            //tr2.eq(6).html((data1.sh2hk.dayAmtThreshold / 10000).toFixed(2) + '亿元');

            tr3.eq(3).html(SwitchTag(data1.hk2sz.status));
            tr3.eq(4).html(getcolorw(data1.hk2sz.dayNetAmtIn));
            tr3.eq(5).html(getcolorw(data1.hk2sz.netBuyAmt));
            tr3
              .eq(6)
              .html((data1.hk2sz.dayAmtRemain / 10000).toFixed(2) + '亿元');
            //tr3.eq(7).html((data1.hk2sz.dayAmtThreshold / 10000).toFixed(2) + '亿元');

            tr4.eq(2).html(SwitchTag(data1.sz2hk.status));
            tr4.eq(3).html(getcolorw(data1.sz2hk.dayNetAmtIn));
            tr4.eq(4).html(getcolorw(data1.sz2hk.netBuyAmt));
            tr4
              .eq(5)
              .html((data1.sz2hk.dayAmtRemain / 10000).toFixed(2) + '亿元');
            //tr4.eq(6).html((data1.sz2hk.dayAmtThreshold / 10000).toFixed(2) + '亿元');

            jQuery.ajax({
              url: url2,
              method: 'get',
              dataType: 'jsonp',
              jsonp: 'cb',
              success: function (json2) {
                var data2 = json2.data.diff;
                tr1.eq(7).html(getcolor(data2[0].f104, 1));
                tr1.eq(8).html(getcolor(data2[0].f106, 0));
                tr1.eq(9).html(getcolor(data2[0].f105, -1));
                tr1
                  .eq(11)
                  .html(
                    getcolor((data2[4].f3 / 100).toFixed(2) + '%', data2[4].f3)
                  );

                tr2.eq(6).html(getcolor(data2[1].f104, 1));
                tr2.eq(7).html(getcolor(data2[1].f106, 0));
                tr2.eq(8).html(getcolor(data2[1].f105, -1));
                tr2
                  .eq(10)
                  .html(
                    getcolor((data2[5].f3 / 100).toFixed(2) + '%', data2[5].f3)
                  );

                tr3.eq(7).html(getcolor(data2[2].f104, 1));
                tr3.eq(8).html(getcolor(data2[2].f106, 0));
                tr3.eq(9).html(getcolor(data2[2].f105, -1));
                tr3
                  .eq(11)
                  .html(
                    getcolor((data2[6].f3 / 100).toFixed(2) + '%', data2[6].f3)
                  );

                tr4.eq(6).html(getcolor(data2[3].f104, 1));
                tr4.eq(7).html(getcolor(data2[3].f106, 0));
                tr4.eq(8).html(getcolor(data2[3].f105, -1));
                tr4
                  .eq(10)
                  .html(
                    getcolor((data2[5].f3 / 100).toFixed(2) + '%', data2[5].f3)
                  );
                var nolines = [];
                if (data1.hk2sh.status == 4) nolines.push(0);
                if (data1.sh2hk.status == 4) nolines.push(1);
                if (data1.hk2sz.status == 4) nolines.push(2);
                if (data1.sz2hk.status == 4) nolines.push(3);
                setnodata(nolines);
              },
              error: function (err) {
                console && console.log(err);
              },
            });
          },
          error: function (err) {
            console && console.log(err);
          },
        });
      }

      function setnodata(lines) {
        for (var i = 0; i < lines.length; i++) {
          var index = lines[i];
          trs[index].eq(4).html('-');
          trs[index].eq(5).html('-');
          trs[index].eq(6).html('-');
          trs[index].eq(7).html('-');
          trs[index].eq(8).html('-');
          if (index == 0 || index == 2) trs[lines[i]].eq(9).html('-');
          else trs[index].eq(3).html('-');
        }
      }
      function getcolor(a, b) {
        try {
          if (b == undefined) b = a;
          if (b == 0) return '<span>' + a + '</span>';
          else if (b < 0) return '<span class="green">' + a + '</span>';
          else return '<span class="red">' + a + '</span>';
        } catch (e) {
          return '<span>-</span>';
        }
      }

      //万转亿
      function getcolorw(a) {
        try {
          a = parseFloat(a);
          var text = '-';
          if (a != 0) {
            if (Math.abs(a) >= 10000) {
              text = (a / 10000).toFixed(2) + '亿元';
            } else {
              text = a.toFixed(2) + '万元';
            }
          }

          if (a == 0) return '<span>' + text + '</span>';
          else if (a < 0) return '<span class="green">' + text + '</span>';
          else return '<span class="red">' + text + '</span>';
        } catch (e) {
          return '<span>-</span>';
        }
      }
      function SwitchTag(tag) {
        var res = '-';
        switch (tag) {
          case 1:
            res = '额度可用';
            break;
          case 2:
            res = '额度已满';
            break;
          case 3:
            res = '收盘';
            break;
          case 4:
            res = '休市';
            break;
          default:
            res = '-';
            break;
        }
        return res;
      }
      //获得实时资金流下面的列表
      function ImgIeLoad() {
        isChrome = false;
        var imgDom = jQuery("<img src='' id=''/>");

        //北向当日资金流向
        imgDom.attr('id', 'zljx_img_b');
        imgDom.attr(
          'src',
          'https://webquotepic.eastmoney.com/GetPic.aspx?id=NORTH&imageType=NSZJ2'
        );
        jQuery('#emchart-bxzj').html(imgDom.prop('outerHTML'));
        //南向当日资金流向
        imgDom.attr('id', 'zljx_img_n');
        imgDom.attr(
          'src',
          'https://webquotepic.eastmoney.com/GetPic.aspx?id=SOUTH&imageType=NSZJ2'
        );
        jQuery('#emchart-nxzj').html(imgDom.prop('outerHTML'));
        //北向当日资金余额
        imgDom.attr('id', 'zlye_img_b');
        imgDom.attr(
          'src',
          'https://webquotepic.eastmoney.com/GetPic.aspx?id=NORTHREMAIN&imageType=NSZJ2'
        );
        jQuery('#emchart-bxzj_drzjye').html(imgDom.prop('outerHTML'));
        //南向当日资金余额
        imgDom.attr('id', 'zlye_img_n');
        imgDom.attr(
          'src',
          'https://webquotepic.eastmoney.com/GetPic.aspx?id=SOUTHREMAIN&imageType=NSZJ2'
        );
        jQuery('#emchart-nxzj_drzjye').html(imgDom.prop('outerHTML'));
      }

      function makedata(data) {
        var datalength = data.length;
        var spaceNum = Math.floor(datalength / 4);
        var times = [],
          jlr_h = [],
          jlr_s = [],
          zjed_h = [],
          zjed_s = [],
          jlr_z = [],
          lastitem = [],
          b = true;

        for (var i = datalength - 1; i >= 0; i--) {
          var item = data[i].split(',');
          if (
            i == 0 ||
            i == spaceNum ||
            i == 2 * spaceNum ||
            i == 3 * spaceNum ||
            i == datalength - 1
          ) {
            times[i] = { value: item[0], showline: true, show: true };
          } else {
            times[i] = { value: item[0], showline: false, show: false };
          }
          jlr_h[i] = isEmptyOrOther(item[1])
            ? ''
            : parseFloat(item[1] / 10000).toFixed(2);
          jlr_s[i] = isEmptyOrOther(item[3])
            ? ''
            : parseFloat(item[3] / 10000).toFixed(2);
          zjed_h[i] = isEmptyOrOther(item[2])
            ? ''
            : parseFloat(item[2] / 10000).toFixed(2);
          zjed_s[i] = isEmptyOrOther(item[4])
            ? ''
            : parseFloat(item[4] / 10000).toFixed(2);
          jlr_z[i] = isEmptyOrOther(item[5])
            ? ''
            : parseFloat(item[5] / 10000).toFixed(2);
          if (
            b &&
            !isEmptyOrOther(item[1]) &&
            !isEmptyOrOther(item[2]) &&
            !isEmptyOrOther(item[3]) &&
            !isEmptyOrOther(item[4])
          ) {
            lastitem = item;
            b = false;
          }
        }
        return {
          times: times,
          jlr_h: jlr_h,
          jlr_s: jlr_s,
          zjed_h: zjed_h,
          zjed_s: zjed_s,
          jlr_z: jlr_z,
          lastitem: lastitem,
        };
      }
      function isEmpty(value) {
        if (value == '' || value == null || typeof value == 'undefined') {
          return true;
        }
        return false;
      }

      function isEmptyOrOther(value) {
        if (
          value == '' ||
          value == null ||
          typeof value == 'undefined' ||
          value == '-'
        ) {
          return true;
        }
        return false;
      }
      var drzjlxcharts = {};
      function loaddrzjlxchartdata() {
        var $ = jQuery;
        $.ajax({
          type: 'get',
          url:
            'https://push2.eastmoney.com/api/qt/kamt.rtmin/get?fields1=f1,f2,f3,f4&fields2=f51,f52,f53,f54,f55,f56&ut=b2884a393a59ad64002292a3e90d46a5',
          dataType: 'jsonp',
          jsonp: 'cb',
          success: function (json) {
            var data = json.data;
            var cahrtdatas_b = makedata(data.s2n); //北向数据
            var cahrtdatas_n = makedata(data.n2s); //北向数据
            var isIE = !!window.ActiveXObject;
            var isIE6 = isIE && !window.XMLHttpRequest;
            var isIE8 = !+'\v1';
            if (isIE && (isIE6 || isIE8)) {
            } else {
              var series1 = [
                {
                  name: '沪股通',
                  color: '#2383fc',
                  showpoint: false,
                  suffix: '亿元',
                  data: cahrtdatas_b.jlr_h,
                },
                {
                  name: '深股通',
                  color: '#ff5bff',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_b.jlr_s,
                },
                {
                  name: '北向资金',
                  color: '#6b3906',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_b.jlr_z,
                },
              ];
              var series2 = [
                {
                  name: '港股通(沪)',
                  color: '#2383fc',
                  showpoint: false,
                  suffix: '亿元',
                  data: cahrtdatas_n.jlr_h,
                },
                {
                  name: '港股通(深)',
                  color: '#ff5bff',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_n.jlr_s,
                },
                {
                  name: '南向资金',
                  color: '#6b3906',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_n.jlr_z,
                },
              ];
              var series3 = [
                {
                  name: '沪股通',
                  color: '#2383fc',
                  showpoint: false,
                  suffix: '亿元',
                  data: cahrtdatas_b.zjed_h,
                },
                {
                  name: '深股通',
                  color: '#ff5bff',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_b.zjed_s,
                },
              ];
              var series4 = [
                {
                  name: '港股通(沪)',
                  color: '#2383fc',
                  showpoint: false,
                  suffix: '亿元',
                  data: cahrtdatas_n.zjed_h,
                },
                {
                  name: '港股通(深)',
                  color: '#ff5bff',
                  suffix: '亿元',
                  showpoint: false,
                  data: cahrtdatas_n.zjed_s,
                },
              ];
              /*   drawdrzjlx('emchart-bxzj', cahrtdatas_b.times, series1); //北向资金流向
              drawdrzjlx('emchart-nxzj', cahrtdatas_n.times, series2); //南向资金流向
              drawdrzjlx('emchart-bxzj_drzjye', cahrtdatas_b.times, series3); //北向当日余额
              drawdrzjlx('emchart-nxzj_drzjye', cahrtdatas_n.times, series4); //南向当日余额 */
            }
            var north_item = cahrtdatas_b.lastitem;
            var south_item = cahrtdatas_n.lastitem;
            if (north_item && north_item.length > 4) {
              $('#north_1').html(getcolorw(north_item[1]));
              $('#north_2').html(getcolorw(north_item[2]));
              $('#north_3').html(getcolorw(north_item[3]));
              $('#north_4').html(getcolorw(north_item[4]));
              $('#north_5').html(getcolorw(north_item[5]));
            }

            if (south_item && south_item.length > 4) {
              $('#south_1').html(getcolorw(south_item[1]));
              $('#south_2').html(getcolorw(south_item[2]));
              $('#south_3').html(getcolorw(south_item[3]));
              $('#south_4').html(getcolorw(south_item[4]));
              $('#south_5').html(getcolorw(south_item[5]));
            }
            $('#updateTime_bxzj').text(data.s2nDate);
            $('#updateTime_nxzj').text(data.n2sDate);
          },
          error: function (err) {
            console && console.log(err);
          },
        });

        function getcolorrgb(b) {
          return b == 0 ? '' : b > 0 ? 'red' : 'green';
        }
      }
      //主程序入口--首页
      function setHsgtInterval(time) {
        newUpdateZjlx();
        ImgIeLoad();
        loaddrzjlxchartdata();
        setInterval(function () {
          newUpdateZjlx();
          ImgIeLoad();
          loaddrzjlxchartdata();
        }, time);
      }
      // 20秒轮询一次
      setHsgtInterval(20000);
    </script>
  </body>
</html>

  `;
}

export default fundFlow;
