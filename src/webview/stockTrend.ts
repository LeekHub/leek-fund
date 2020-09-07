import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';

function stockTrend(code: string, name: string, text: string, stockCode: string) {
  const panel = ReusedWebviewPanel.create(
    'stockTrendWebview',
    `股票实时走势(${code})`,
    ViewColumn.One,
    {
      enableScripts: true,
    }
  );

  const timestamp = new Date().getTime();
  const codeByImgPath = {
    normal: 'https://image.sinajs.cn/newchart',
    usstock: 'https://image.sinajs.cn/newchart/v5/usstock',
    hk_stock: 'http://image.sinajs.cn/newchart/hk_stock',
  };
  let sszsImg = code;
  let imageName = stockCode.toLowerCase();
  let timeK = `${codeByImgPath.normal}/min/n/${imageName}.gif`;
  let dailyK = `${codeByImgPath.normal}/daily/n/${imageName}.gif`;
  let weeklyK = `${codeByImgPath.normal}/weekly/n/${imageName}.gif`;
  let monthlyK = `${codeByImgPath.normal}/monthly/n/${imageName}.gif`;
  // console.log(dailyK);
  if (stockCode.indexOf('hk') === 0) {
    imageName = stockCode.replace('hk', '');
    sszsImg = imageName;
    timeK = `${codeByImgPath.hk_stock}/min/${sszsImg}.gif?${timestamp}`;
    dailyK = `${codeByImgPath.hk_stock}/daily/${sszsImg}.gif?${timestamp}`;
    weeklyK = `${codeByImgPath.hk_stock}/weekly/${sszsImg}.gif?${timestamp}`;
    monthlyK = `${codeByImgPath.hk_stock}/monthly/${sszsImg}.gif?${timestamp}`;
  } else if (stockCode.indexOf('gb_') === 0) {
    imageName = stockCode.replace('gb_', '.');
    sszsImg = imageName;
    timeK = `${codeByImgPath.usstock}/min/${sszsImg}.gif?${timestamp}`;
    dailyK = `${codeByImgPath.usstock}/daily/${sszsImg}.gif?${timestamp}`;
    weeklyK = `${codeByImgPath.usstock}/weekly/${sszsImg}.gif?${timestamp}`;
    monthlyK = `${codeByImgPath.usstock}/monthly/${sszsImg}.gif?${timestamp}`;
  } else if (stockCode.indexOf('usr_') === 0) {
    imageName = stockCode.replace('usr_', '');
    sszsImg = imageName;
    timeK = `${codeByImgPath.usstock}/min/${sszsImg}.gif?${timestamp}`;
    dailyK = `${codeByImgPath.usstock}/daily/${sszsImg}.gif?${timestamp}`;
    weeklyK = `${codeByImgPath.usstock}/weekly/${sszsImg}.gif?${timestamp}`;
    monthlyK = `${codeByImgPath.usstock}/monthly/${sszsImg}.gif?${timestamp}`;
    // console.log(dailyK);
  }

  panel.webview.html = panel.webview.html = `<html><body style="background:#000;color:#fff">
  <br/>
  <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」趋势图、K线图</p>
  <hr />
  <h3>实时走势图</3> <br/>
  <div style="width: 710px;margin:0 auto"><img class="sstrend" src="${timeK}" width="700"/></div>
  <br/>
  <h3>日K线图</3> <br/>
  <div style="width: 710px;margin:0 auto"><img src="${dailyK}" width="700"/></div>
  <h3>周K线图</3> <br/>
  <div style="width: 710px;margin:0 auto"><img src="${weeklyK}" width="700"/></div>
  <h3>月K线图</3> <br/>
  <div style="width: 710px;margin:0 auto"><img src="${monthlyK}" width="700"/></div>
</body>
<script>
var sstrendImgEl = document.querySelector('.sstrend');
var timer=null;
var timeK="${timeK}";
var index=timeK.indexOf('?')
var code="${code}";
if (timer) {
  clearInterval(timer);
  timer = null;
}
timer = setInterval(function () {
  sstrendImgEl.src =timeK.substr(0,index) +'?v=' +
    new Date().getTime();
  console.log('刷新数据' + code);
}, 20000);
</script>
</html>`;
}

export default stockTrend;
