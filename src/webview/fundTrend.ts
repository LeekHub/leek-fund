import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';

function fundTrend(code: string, name: string) {
  const panel = ReusedWebviewPanel.create(
    'fundTrendWebview',
    `基金实时走势(${code})`,
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
    background: #f1f0f0;
  }
  </style>
  <body>
    <br/>
    <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」实时走势图</p>
    <div class="trend"><img
      class="fund-sstrend"
      src="http://j4.dfcfw.com/charts/pic6/${code}.png?v=${new Date().getTime()}"
      alt=""
    />
    <p class="title" style="text-align: center; font-size:18px; width: 400px;margin: 20px auto;">历史趋势图</p>
    <img
    class="fund-sstrend"
      src="https://image.sinajs.cn/newchart/v5/fund/nav/ss/${code}.gif"
      alt=""
    />
    </div>
    <script>
    var sstrendImgEl = document.querySelector('.fund-sstrend');
    var timer=null;
    var code="${code}";
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    timer = setInterval(function () {
      sstrendImgEl.src =
        'http://j4.dfcfw.com/charts/pic6/' +
       code+
        '.png?v=' +
        new Date().getTime();
      console.log('刷新数据' + code);
    }, 20000);
  </script>
  </body></html>`;
}

export default fundTrend;
