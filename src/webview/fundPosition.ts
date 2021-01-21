import Axios from 'axios';
import { ViewColumn } from 'vscode';
import { LeekTreeItem } from '../shared/leekTreeItem';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { randHeader } from '../shared/utils';

const fundPositionUrl = (code: string): string => {
  return ` http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&year=&month=&rt=0.${Date.now()}`;
};

async function getFundPositionByCode(code: string) {
  try {
    const response = await Axios.get(fundPositionUrl(code), {
      headers: randHeader(),
    });

    let data = response.data.slice(12, -1);
    data = data
      .replace('content', '"content"')
      .replace('arryear', '"arryear"')
      .replace('curyear', '"curyear"')
      .replace(/href='\/\//g, "href='http://")
      .replace(/href='ccbdxq/g, "href='http://fundf10.eastmoney.com/ccbdxq")
      .replace(
        "onclick='LoadMore(this,6,LoadStockPos)'",
        `href='http://fundf10.eastmoney.com/ccmx_${code}.html'`
      )
      .replace(
        "onclick='LoadMore(this,3,LoadStockPos)'",
        `href='http://fundf10.eastmoney.com/ccmx_${code}.html'`
      );
    return JSON.parse(data).content;
  } catch (err) {
    console.log(err);
    return '历史净值获取失败';
  }
}

async function fundPosition(item: LeekTreeItem) {
  const { code, name } = item.info;
  const content = await getFundPositionByCode(code);
  const panel = ReusedWebviewPanel.create(
    'fundPositionWebview',
    `基金持仓(${code})`,
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  panel.webview.html = `<html>
  <style>
  .box {
    border-top: 1px solid #bababa;
    padding: 5px;
    margin-top:20px;
    margin-bottom:20px;
  }
  .w790 {
    width: 790px;
    margin: 0 auto;
}
.hide{
  display:none;
}
.boxitem h4.t {
  position: relative;
  height: 42px;
  background-position: -1px -46px;
  width: 790px
}

.boxitem h4 label {
  position: absolute;
  top: 15px;
  left: 30px;
  font-size: 14px;
  font-weight: 700;
  display: inline-block;
  word-wrap: normal;
  white-space: nowrap
}

.boxitem h4 label.lab2,.boxitem h4 ul.lab2 {
  position: absolute;
  left: 405px;
  top: 10px;
  z-index: 10;
  font-size: 12px;
  font-weight: 400
}

.boxitem h4 label.xq405,.boxitem h4 ul.xq405 {
  left: 380px;
  width: 400px
}

.boxitem h4 label.xq505,.boxitem h4 ul.xq505 {
  left: 550px
}

.boxitem h4 ul.xq405 th {
  font-size: 12px
}

.boxitem h4 label.xq656,.boxitem h4 ul.xq656 {
  left: 656px;
  top: 10px
}

.boxitem h4 label.xq730,.boxitem h4 ul.xq730 {
  left: 730px;
  padding-top: 5px
}

.boxitem h4.t label img {
  vertical-align: middle;
  border: 0
}

.boxitem h4.t .FLTip {
  width: 450px;
  position: absolute;
  z-index: 9999;
  text-align: left;
  display: none;
  margin: 33px 0 0 40px
}

.boxitem .tabul li,.jl_intro .text,.jl_intro img {
  display: inline;
  float: left
}

.boxitem h4.t .tipbox {
  font: 16px "宋体";
  margin-left: 25%;
  position: absolute
}

.jdzfnew ul li.pmbd font,.jz_tab h4 .jzr span,table.jdmx td font {
  font-family: "宋体"
}

.boxitem h4.t .tipbox em,.boxitem h4.t .tipbox span {
  font-style: normal;
  width: 15px;
  line-height: 21px;
  height: 10px;
  overflow: hidden;
  position: absolute;
  color: #f2c87e
}

.boxitem h4.t .tipbox span {
  color: #fff;
  top: 1px;
  margin: 0
}

.boxitem h4.t .FLTip .box {
  width: auto;
  background: #fffbed;
  border: 1px solid #f2c87e;
  padding: 10px;
  margin-top: 10px;
  box-shadow: 2px 3px 2px #DDD;
  border-radius: 6px;
  line-height: 1.8;
  font-weight: 400;
  font-size: 12px
}

.boxitem h4.t input,.boxitem h4.t span,.boxitem h4.t strong {
  display: inline;
  float: left;
  vertical-align: middle;
  border: none
}

.boxitem h4.t span,.boxitem h4.t strong {
  margin: 3px 0;
  font-weight: 400
}

.boxitem h4.t span.cal {
  margin: 2px 5px 0 2px;
  width: 14px;
  height: 16px;
  background-position: -245px -177px;
  cursor: pointer
}

.boxitem h4.t input.text {
  width: 80px;
  height: 18px;
  overflow: hidden;
  border: 1px solid #68a3cb
}

.boxitem .tabul {
  margin-top: 1px;
  height: 30px
}

.boxitem .tabul li {
  width: 106px;
  padding-top: 2px;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  text-align: center;
  overflow: hidden;
  background-position: -596px -88px;
  font-weight: 400;
  cursor: pointer
}

.boxitem .tabul li.at {
  background-position: -489px -88px;
  color: #fff
}

.boxitem p {
  font-size: 12px;
  padding: 0;
  line-height: 1.6
}
table.comm {
  border: none;
  font-size: 14px;
  width: 100%;
}

table.comm thead {
  border: none;
  background-position: 0 -128px
}

table.comm th {
  width: auto;
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
}
.comm tbody tr{
  text-align:center;
}
table.jjcc,table.jndxq,table.tzxq {
  margin: 10px auto 5px
}
.txt_in table,.txt_in td,.txt_in th {
  text-align: center;
  font-size: 14px
}

.txt_in th {
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  font-weight: 400
}

.txt_in td {
  height: 28px;
  line-height: 28px;
  vertical-align: middle
}

.txt_in td.cz,.txt_in th.cz {
  width: 60px
}

table.jlchg {
  margin: 10px auto 5px
}

table.jlchg th {
  width: 20%
}

table.jlchg .tor {
  text-align: right;
  padding-right: 50px
}
.xglj .red{
  color:#bababa;
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

.die {
  color: #097C25
}

.zhang {
  color: #DC0000
}

.ping {
  color: #eee
}
.tfoot{
  text-align: center;
    margin-top: 10px;
}
#container{
  width:800px;
  margin:0 auto;
}
  </style>
  <body>
    <br/>
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」持仓📊</p>
    <div class="trend"><img
      class="fund-sstrend"
      src="http://j6.dfcfw.com/charts/StockPos/${code}.png?rt=${new Date().getTime()}"
      alt="「${name}」- ${code}"
    />
    </div>
    <div id="container"></div>
    <div class="history">
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」持仓明细</p>
    ${content}
    </div>
    <script src="https://cdn.staticfile.org/jquery/2.0.0/jquery.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/lib/antv/g2/4.1.0-beta.1/dist/g2.min.js"></script>
    <script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.data-set-0.11.1/dist/data-set.js"></script>
    <script>
    var stockPercentMap = {};

      function getStockPercent() {
        var table = document.querySelector('.comm');
        var tbody = table.querySelector('tbody');
        var trList = tbody.children;
        stockPercentMap = {};
        for (var i = 0; i < trList.length; i++) {
          var tds = trList[i].children;
          stockPercentMap[
            tds[1].firstChild.innerText
          ] = +tds[6].innerText.replace('%', '');
        }
      }
    // 好垃圾的代码，从天天基金拔下来的
    $(function(){
      var d=document.getElementById("gpdmList").innerHTML
      LoadGpzd(d);
     setInterval(function(){
      LoadGpzd(d);
     },20000)

     getStockPercent();
    })
    function LoadGpzd(e) {
      if ("" != e) {
          for (var a = e.split(","), t = Math.ceil(a.length / 120), n = [], l = 0, r = "", i = 0; i < t; i++)
              l = 120 * i,
              endIndex = l + 120,
              r = a.slice(l, endIndex).join(","),
              n.push(r);
          0 < n.length && GpzdData(n, 0)
      }
  }
    function GpzdData(e, a) {
      var t = "https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f12,f14,f9&cb=?&ut=267f9ad526dbe6b0262ab19316f5a25b&secids=" + e[a];
      // console.log(t)
      jQuery.getJSON(t, function(e) {
        // console.log(e)
          var a, t = new Array, n = new Array, l = new Array, r = new Array;
          if (null != e && null != e.data && null != e.data.diff) {
              a = e.data.diff;
              rectChart(a);
              for (var i = 0; i < a.length; i++) {
                  if (null != a[i]) {
                      var s = a[i]
                        , c = $("#dq" + s.f12)[0]
                        , d = $("#zd" + s.f12)[0];
                      c.innerHTML = "-" == s.f2 ? "-" : s.f2.toFixed(2),
                      d.innerHTML = "-" == s.f3 ? "-" : s.f3.toFixed(2) + "%",
                      n.push(d),
                      l.push(c);
                      var o = d.innerHTML.replace("%", "");
                      if (0 != o.indexOf("-"))
                          try {
                              0 == (o = parseFloat(o)) || 0 == o || isNaN(o) ? (t.push("ping"),
                              c.className = "ping") : (t.push("zhang"),
                              c.className = "zhang")
                          } catch (p) {
                            // console.log(p)
                              t.push("ping"),
                              c.className = "zhang"
                          }
                      else
                          t.push("die"),
                          c.className = "die"
                  }
                  r.push(c.className)
              }
              setFlash2(n, "", t),
              setFlash2(l, "ping", r)
          }
      }),
      a++,
      e.length > a && setTimeout(function() {
        // console.log(a)
          GpzdData(e, a)
      }, 240)
  }
  function setClass2(e, a) {
    if ("object" == typeof e)
        for (var t = 0; t < e.length; t++)
            "" != a && 0 < a.length ? e[t].className = "zf " + a[t] : e[t].className = "zf ping"
  }
  function setFlash2(e, a, t) {
      setTimeout(function() {
          setClass2(e, a)
      }, 600),
      setTimeout(function() {
          setClass2(e, t)
      }, 900)
  }

  var chart;
  function rectChart(arr) {
    if(chart && !chart.destroyed){
      chart.destroy();
    }
    let valueArr = [];
    if(arr.length===0) return;
    const { DataView } = DataSet;
    const relationMap = arr.map((item) => {
      const { f2, f3, f9, f12, f14 } = item;
      return {
        name: f14 + '  ' + f3 + '%',
        code: f12,
        price: f2,
        percent: f3,
        value: stockPercentMap[f12] || Math.ceil(f2 * f9),
      };
    });
    const data = {
      name: 'root',
      children: relationMap,
    };
    const dv = new DataView();
    dv.source(data, {
      type: 'hierarchy',
    }).transform({
      field: 'value',
      type: 'hierarchy.treemap',
      tile: 'treemapResquarify',
      as: ['x', 'y'],
    });

    // 将 DataSet 处理后的结果转换为 G2 接受的数据
    const nodes = [];
    for (const node of dv.getAllNodes()) {
      if (node.data.name === 'root') {
        continue;
      }
      valueArr.push(node.data.value);
      const eachNode = {
        name: node.data.name,
        x: node.x,
        y: node.y,
        code: node.data.code,
        value: node.data.value,
        price: node.data.price,
        percent: node.data.percent,
      };

      nodes.push(eachNode);
    }
    valueArr = valueArr.sort((a, b) => a - b);
    const middleIndex = Math.ceil(valueArr.length / 2);
     chart = new G2.Chart({
      container: 'container',
      autoFit: false,
      width: 800,
      height: 400,
    });
    chart.data(nodes);
    chart.scale({
      x: {
        nice: true,
      },
      y: {
        nice: true,
      },
    });

    chart.axis(false);
    chart.legend(false);
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl:
        '<ul style="padding-bottom: 10px;margin-left:-30px"><li style="list-style: none;">' +
        '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
        '{name}' +
        '</li>' +
        '<li style="list-style: none;">' +
        '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
        '<span style="margin-top:4px">股票代码：{code}</span><br/>' +
        '</li>' +
        '<li style="list-style: none;">' +
        '<span style="background-color:{color};" class="g2-tooltip-marker"></span>' +
        '<span style="margin-top:4px">最新价格：{price}</span><br/>' +
        '</li></ul>',
    });
    chart
      .polygon()
      .position('x*y')
      .color('value*percent', (value, percent) => {
        if (percent > 0) {
          return '#F44336';
        }
        return 'green';
      })
      .tooltip('name*price*code', (name, price, code) => {
        return {
          name,
          price,
          code,
        };
      })
      .style({
        lineWidth: 2,
        stroke: '#fff',
      })
      .label('name*value', (name, value) => {
        let labelStyle = {
          offset: 0,
          style: {
            textBaseline: 'middle',
            fontSize: 12,
          },
          content: (obj) => {
            if (obj.name !== 'root') {
              return obj.name;
            }
          },
        };
        // console.log(value, valueArr[middleIndex]);
        if (value > valueArr[middleIndex]) {
          labelStyle.style.fontSize = 20;
          return labelStyle;
        }
        return labelStyle;
      });

    chart.interaction('element-active');

    chart.render();
  }
    </script>
  </body></html>`;
}

export default fundPosition;
