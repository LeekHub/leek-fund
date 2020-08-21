import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';
import { FundService } from '../service';

async function allFundTrend(service: FundService) {
  const fundList = service.fundList;
  const panel = ReusedWebviewPanel.create('allFundTrendWebview', '基金走势一览', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>基金走势图</title>
        <style>
           body{background:#fff;color:#333}
          .header {
            margin-left: 40px;
            padding: 4px;
            height: 30px;
            line-height: 30px;
            border-bottom: 1px solid #e8e8e8;
            font-size: 18px;
            font-weight: fold;
          }
          .list-items {
            list-style: none;
            padding:0;
          }
          .list-item {
            cursor: pointer;
            height: 30px;
            padding: 4px 8px;
            line-height: 30px;
            border-bottom: 1px solid #e8e8e8;
          }
          .flex {
            display: flex;
          }
          .list {
            display: inline-block;
            max-height:800px;
            min-width:320px;
            overflow-y:auto;
          }
          .content {
            display: inline-block;
            padding-left:10px;
            padding-right:10px;
          }
          img {
            width: 700px;
          }
          .percent {
            font-size: 24px;
            font-weight: fond;
          }
          .title{
            font-size:18px;
            margin:6px 0;
            color:#1890ff;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="flex">
          <div class="list">
            <div class="header">
              基金走势图
            </div>
            <ul class="list-items"></ul>
          </div>
          <div class="content">
            <p>净值：<span class="percent">0.00%</span></p>
            <p class="title">实时趋势图</p>
            <img
              class="fund-sstrend"
              src="https://avatars0.githubusercontent.com/u/8676711?s=460&u=b88b7ee37574da3b6aef32da9a5986eb82bc4d11&v=4"
              alt=""
            />
            <br />
            <p class="title" style="margin-top:6px">历史趋势图</p>
            <img
              class="fund-trend"
              src="https://giscafer.gallerycdn.vsassets.io/extensions/giscafer/leek-fund/1.1.5/1597052433264/Microsoft.VisualStudio.Services.Icons.Default"
              alt=""
            />
          </div>
        </div>
        <script>
          var fundList=${JSON.stringify(fundList)};
          var listEl = document.querySelector('.list');
          var listItemUlEl = document.querySelector('.list-items');
          var headerEl = document.querySelector('.header');
          var childs = listEl.childNodes;
          listEl.removeChild(listItemUlEl);
          var listStr = '';
          var timer=null

          var firstFund = fundList[0].info;
          for (var j = 0; j < fundList.length; j++) {
            var info = fundList[j].info;
            listStr +=
              '<li class="list-item" data-code="' +
              info.code +
              '"  data-percent="' +
              info.percent +
              '">' +
              info.name +
              '（' +
              info.code +
              '）' +
              '</li>';
          }
          headerEl.insertAdjacentHTML(
            'afterend',
            ' <ul class="list-items">' + listStr + '</ul>'
          );
          var trendImgEl = document.querySelector('.fund-trend');
          var sstrendImgEl = document.querySelector('.fund-sstrend');
          var percentEl = document.querySelector('.percent');
          document.querySelector('.list-items').onclick = function (event) {
            var code = event.target.getAttribute('data-code');
            var percent = event.target.getAttribute('data-percent');
            handleClick(code, percent, event.target);
          };
          document.querySelector('.list-items').firstChild.click();
          function handleClick(code, percent, target) {
            document.querySelector('.list-items').childNodes.forEach((c) => {
              c.style.background = '#fff';
              c.style.color = '#333';
            });
            target.style.background = '#1890ff';
            target.style.color = '#fff';
            sstrendImgEl.src='http://j4.dfcfw.com/charts/pic6/' +
            code +
            '.png?v=' +
            new Date().getTime();
            trendImgEl.src =
              'https://image.sinajs.cn/newchart/v5/fund/nav/ss/' +
              code +
              '.gif?v=' +
              new Date().getTime();
            percentEl.innerHTML = percent + '%';
            if (percent < 0) {
              percentEl.style.color = 'green';
            } else {
              percentEl.style.color = 'red';
            }

            if (timer) {
              clearInterval(timer);
              timer = null;
            }
            timer = setInterval(function () {
              sstrendImgEl.src =
                'http://j4.dfcfw.com/charts/pic6/' +
                code +
                '.png?v=' +
                new Date().getTime();
              console.log('刷新数据' + code);
            }, 20000);
          }
        </script>
      </body>
    </html>
    `;
}

export default allFundTrend;
