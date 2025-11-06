import { commands, ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import globalState from '../globalState';

function fundTrend(
  code: string,
  name: string,
  immersiveBackground: boolean = globalState.immersiveBackground
) {
  const panel = ReusedWebviewPanel.create(
    'fundTrendWebview',
    `基金实时走势(${code})`,
    ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.name) {
      case 'immersiveBackground':
        commands.executeCommand('leek-fund.immersiveBackground', message.value);
    }
  });
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
    background: #f1f0f0;
  }
  .title{
    text-align:center;
    font-size:18px;
  }
  .chart{
    margin-bottom:30px;
    width:100%;
  }
  body.require-immersive.vscode-dark img.fund-sstrend,
  body.require-immersive.vscode-high-contrast img.fund-sstrend {
    filter: invert(1);
  }
  body.require-immersive.vscode-dark .highcharts-background,
  body.require-immersive.vscode-high-contrast .highcharts-background {
    fill: var(--vscode-editor-background);
  }
  body.require-immersive.vscode-dark .highcharts-title,
  body.require-immersive.vscode-dark .highcharts-axis-labels text,
  body.require-immersive.vscode-dark .highcharts-button text,
  body.require-immersive.vscode-dark .highcharts-range-selector-buttons .highcharts-button text,
  body.require-immersive.vscode-high-contrast .highcharts-title,
  body.require-immersive.vscode-high-contrast .highcharts-axis-labels text,
  body.require-immersive.vscode-high-contrast .highcharts-button text,
  body.require-immersive.vscode-high-contrast .highcharts-range-selector-buttons .highcharts-button text {
    fill: var(--vscode-editor-foreground) !important;
  }
  body.require-immersive.vscode-dark .highcharts-range-selector-buttons .highcharts-button rect,
  body.require-immersive.vscode-high-contrast .highcharts-range-selector-buttons .highcharts-button rect {
    fill: var(--vscode-editor-selectionHighlightBackground);
  }
  body.require-immersive.vscode-dark #grandTotalCharsWrap .highcharts-range-selector,
  body.require-immersive.vscode-high-contrast #grandTotalCharsWrap .highcharts-range-selector {
    background: #333;
    color: var(--vscode-editor-foreground);
  }
  </style>
  <script src="http://j5.dfcfw.com/libs/jquery/1.8.3/jquery.min.js?v=${new Date().getTime()}"></script>
  <script src="http://j5.dfcfw.com/js/pinzhong/highstock201602_20161116195237.js?v=${new Date().getTime()}"></script>
  <script src="http://fund.eastmoney.com/pingzhongdata/${code}.js?v=${new Date().getTime()}"></script>
  <body>
    <br/>
    <div style="text-align: right;">
      <label for="immersive">沉浸式背景（仅适配暗色主题）<input id="immersive" type="checkbox"/></label>
    </div>
    <!-- <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」实时走势图</p>
    <div class="trend"><img
      class="fund-sstrend"
      src="http://j4.dfcfw.com/charts/pic6/${code}.png?v=${new Date().getTime()}"
      alt=""
    /> -->
   <!-- <p class="title" style="text-align: center; font-size:18px; width: 400px;margin: 20px auto;">历史趋势图</p>
    <img
    class="fund-sstrend"
      src="http://j3.dfcfw.com/images/JJJZ1/${code}.png"
      alt=""
    /> -->
    </div>
    <div
      id="netWorthTrend"
      class="netWorthTrend chart"
      style="height: 420px;margin-top:30px;"
    ></div>
    <div
      id="grandTotalCharsWrap"
      class="grandTotalCharsWrap chart"
      style=" height: 420px;"
    ></div>
    <script>
    // var sstrendImgEl = document.querySelector('.fund-sstrend');
    // var timer=null;
    // var code="${code}";
    // if (timer) {
    //   clearInterval(timer);
    //   timer = null;
    // }
    // timer = setInterval(function () {
    //   sstrendImgEl.src =
    //     'http://j4.dfcfw.com/charts/pic6/' +
    //    code+
    //     '.png?v=' +
    //     new Date().getTime();
    //   console.log('刷新数据' + code);
    // }, 20000);
  </script>
  <script>
      var highcharsConfig = {
        global: {
          useUTC: true,
          timezoneOffset: -8 * 60,
        },
        lang: {
          months: [
            '一月',
            '二月',
            '三月',
            '四月',
            '五月',
            '六月',
            '七月',
            '八月',
            '九月',
            '十月',
            '十一月',
            '十二月',
          ],
          weekdays: [
            '星期日',
            '星期一',
            '星期二',
            '星期三',
            '星期四',
            '星期五',
            '星期六',
          ],
          rangeSelectorFrom: '从',
          rangeSelectorTo: '到',
          rangeSelectorZoom: '选择时间',
          noData: '暂无数据',
          resetZoom: '',
        },
      };
      Highcharts.setOptions(highcharsConfig);
      var defineNetWorthTrend = function (json) {};
      defineNetWorthTrend.prototype = {
        init: function (dataList) {
          $('#netWorthTrend').highcharts('StockChart', {
            chart: {
              marginRight: 20,
              styledMode: true
            },
            title: {
              text: '「${name}」单位净值走势'
           },
            tooltip: {
              xDateFormat: '%Y-%m-%d',
              pointFormat: '<p>单位净值：{point.y:.4f}元</p>',
            },
            credits: {
              text:
                '<span style="font-size:16px;color:#999999;font-family: Microsoft YaHei;">韭菜盒子</span>',
              href: 'javascript:;',
              position: {
                align: 'center',
                y: -120,
                x: 162,
              },
              style: {
                cursor: 'default',
                color: '#999999',
                fontSize: '10px',
                'font-family': 'Microsoft YaHei',
              },
            },
            exporting: {
              enabled: false,
            },
            scrollbar: {
              enabled: false,
            },
            legend: {
              enabled: false,
            },
            rangeSelector: {
              inputEnabled: false,
              buttonTheme: {
                fill: 'none',
                stroke: 'none',
                'stroke-width': 0,
                r: 0,
                width: 31,
                style: {
                  color: '#333',
                  fontWeight: 'normal',
                },
                states: {
                  hover: {
                    fill: '#4c74b1',
                    style: {
                      color: '#fff',
                      fontWeight: 'bold',
                    },
                  },
                  select: {
                    fill: '#4c74b1',
                    style: {
                      color: '#fff',
                      fontWeight: 'bold',
                    },
                  },
                },
              },
              labelStyle: {
                color: '#333',
                fontWeight: 'bold',
              },
              buttons: [
                {
                  type: 'month',
                  count: 1,
                  text: '1月',
                },
                {
                  type: 'month',
                  count: 3,
                  text: '3月',
                },
                {
                  type: 'month',
                  count: 6,
                  text: '6月',
                },
                {
                  type: 'year',
                  count: 1,
                  text: '1年',
                },
                {
                  type: 'year',
                  count: 3,
                  text: '3年',
                },
                {
                  type: 'year',
                  count: 5,
                  text: '5年',
                },
                {
                  type: 'ytd',
                  text: '今年来',
                },
                {
                  type: 'all',
                  text: '最大',
                },
              ],
              selected: 1,
            },
            yAxis: {
              title: {
                text: '',
              },
              labels: {
                formatter: function () {
                  return this.value.toFixed(2);
                },
              },
              tickPixelInterval: 50,
              opposite: false,
              reversed: false,
            },
            xAxis: {
              endOnTick: true,
              maxPadding: 0.05,
              type: 'datetime',
              dateTimeLabelFormats: {
                day: '%m-%d',
                week: '%m-%d',
                month: '%Y-%m',
                year: '%Y',
              },
            },
            plotOptions: {
              area: {
                fillColor: {
                  linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1,
                  },
                  stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [
                      1,
                      Highcharts.Color(Highcharts.getOptions().colors[0])
                        .setOpacity(0)
                        .get('rgba'),
                    ],
                  ],
                },
                marker: {
                  radius: 2,
                },
                lineWidth: 2,
                states: {
                  hover: {
                    lineWidth: 1,
                  },
                },
                threshold: null,
                dataGrouping: {
                  enabled: false,
                  approximation: 'open',
                  units: [['day', [1]]],
                  dateTimeLabelFormats: {
                    day: ['%Y-%m-%d', '%Y-%m-%d'],
                  },
                },
              },
            },
            navigator: {
              xAxis: {
                dateTimeLabelFormats: {
                  day: '%Y-%m-%d',
                  week: '%Y',
                  month: '%Y-%m',
                  year: '%Y-%m',
                },
                labels: {
                  align: 'center',
                },
              },
            },
            noData: {
              style: {
                fontSize: '12px',
                color: '#808080',
                fontWeight: '100',
              },
            },
            series: [
              {
                type: 'area',
                data: dataList,
                turboThreshold: Number.MAX_VALUE,
                tooltip: {
                  valueDecimals: 2,
                },
              },
            ],
          });
        },
      };
      function addGrandTotalMap(dataList, dataType) {
        var s = this;
        var xAxisMonth = '%Y-%m';
        if (dataType === 'y') xAxisMonth = '%y-%m';
        $('#grandTotalCharsWrap').highcharts('StockChart', {
          chart: {
            marginRight: 20,
            styledMode: true
          },
          title: {
            text: '「${name}」累计收益率走势'
         },
          noData: {
            style: {
              fontSize: '14px',
              color: '#808080',
            },
          },
          //   colors: ['#4c74b1', '#a44949', '#666'],
          credits: {
            text:
              '<span style="font-size:16px;color:#999999;font-family: Microsoft YaHei;">韭菜盒子</span>',
            href: 'javascript:;',
            position: {
              align: 'center',
              y: -117,
              x: 302,
            },
            style: {
              cursor: 'default',
              color: '#999999',
              fontSize: '10px',
              'font-family': 'Microsoft YaHei',
            },
          },
          exporting: {
            enabled: false,
          },
          scrollbar: {
            enabled: false,
          },
          legend: {
            enabled: true,
            useHTML: true,
            labelFormatter: function () {
              return this.name;
            },
            margin: 30,
            align: 'left',
          },
          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
              day: '%m-%d',
              week: '%m-%d',
              month: xAxisMonth,
              year: '%Y',
            },
          },
          yAxis: {
            labels: {
              formatter: function () {
                return (
                  (this.value > 0 ? ' + ' : '') + this.value.toFixed(2) + '%'
                );
              },
            },
            plotLines: [
              {
                value: 0,
                width: 2,
                color: 'silver',
              },
            ],
          },
          plotOptions: {
            line: {
              dataGrouping: {
                approximation: 'open',
                smoothed: true,
                dateTimeLabelFormats: {
                  millisecond: [''],
                  second: [''],
                  minute: [''],
                  hour: [''],
                  day: ['%Y-%m-%d'],
                  month: ['%Y-%m-%d'],
                  year: ['%Y-%m-%d'],
                  all: ['%Y-%m-%d'],
                },
              },
            },
          },
          tooltip: {
            xDateFormat: '%Y-%m-%d',
            pointFormat:
              '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}%</b><br/>',
            valueDecimals: 2,
          },
          navigator: {
            enabled: false,
          },
          rangeSelector: {
            enabled: true,
            buttons: [
              {
                type: 'month',
                count: 1,
                text: '1月',
              },
              {
                type: 'month',
                count: 3,
                text: '3月',
              },
              {
                type: 'month',
                count: 6,
                text: '6月',
              },
              {
                type: 'year',
                count: 1,
                text: '1年',
              },
              {
                type: 'all',
                text: '最大',
              },
            ],
          },
          series: dataList,
        });
      }
      defineNetWorthTrend.prototype.init(Data_netWorthTrend);
      addGrandTotalMap(Data_grandTotal, 'y');
    </script>
    <script>
    {
      const vscode = acquireVsCodeApi();
      let isChecked = ${immersiveBackground};
      $('body').toggleClass('require-immersive', isChecked);
      $('#immersive').prop('checked', isChecked);
      $('#immersive').on('click', function() {
        isChecked = $(this).prop('checked');
        $('body').toggleClass('require-immersive', isChecked);
        vscode.postMessage({ name: 'immersiveBackground', value: isChecked });
      });
    };
    </script>
  </body></html>`;
}

export default fundTrend;
