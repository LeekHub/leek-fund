import { ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';
import { getEastmoneyHost } from './proxyService/proxyConfig';
function stockTrendPic(code: string, name: string, stockCode: string) {
  const panel = ReusedWebviewPanel.create(
    'stockTrendPicWebview',
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
    cn_future: 'http://image.sinajs.cn/newchart/v5/futures/china'
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
  } else if (stockCode.indexOf('nf') === 0) {
    // sina 数据源问题，无法规避。周线以上行情存在开盘价错乱问题
    imageName = stockCode.replace('nf_', '');
    sszsImg = imageName;
    timeK = `${codeByImgPath.cn_future}/min/${sszsImg}.gif?${timestamp}`;
    dailyK = `${codeByImgPath.cn_future}/daily/${sszsImg}.gif?${timestamp}`;
    weeklyK = `${codeByImgPath.cn_future}/weekly/${sszsImg}.gif?${timestamp}`;
    monthlyK = `${codeByImgPath.cn_future}/monthly/${sszsImg}.gif?${timestamp}`;
  }

  panel.webview.html = panel.webview.html = `<html><body style="background:#eee;color:#333">
  <br/>
  <p style="text-align: center; font-size:18px; width: 400px;margin: 0 auto;">「${name}」趋势图、K线图</p>
  <a style="position: absolute;right: 22px;top: 22px;font-size: 12px;" href="${getEastmoneyHost()}/${imageName}.html#fullScreenChart">网页全屏查看>></a>
  <hr />
  <h3 style="display:inline-block">实时走势图</h3><span style="margin-left:10px;color:#888;font-size:12px;" id="refreshtime">&nbsp;</span>
  <br/><br/>
  <div style="width: 710px;margin:0 auto"><img class="sstrend" src="${timeK}" width="700"/></div>
  <br/>
  <h3>日K线图</h3> <br/>
  <div style="width: 710px;margin:0 auto"><img src="${dailyK}" width="700"/></div>
  <h3>周K线图</h3> <br/>
  <div style="width: 710px;margin:0 auto"><img src="${weeklyK}" width="700"/></div>
  <h3>月K线图</h3> <br/>
  <div style="width: 710px;margin:0 auto;margin-bottom:20px"><img src="${monthlyK}" width="700"/></div>
</body>
<script>
var sstrendImgEl = document.querySelector('.sstrend');
var timer=null;
var timeK="${timeK}";
var index=timeK.indexOf('?')
index=index===-1?timeK.length:index;

var code="${code}";
if (timer) {
  clearInterval(timer);
  timer = null;
}
var timeElement=document.querySelector('#refreshtime');
timeElement.innerText='刷新时间：'+formatDateTime(new Date());

timer = setInterval(function () {
  var refreshTime = new Date();
  sstrendImgEl.src =timeK.substr(0,index) +'?v=' + refreshTime.getTime();
  document.querySelector('#refreshtime').innerText='刷新时间：'+formatDateTime(refreshTime);
  console.log('刷新数据' + code);
}, 20000);

function formatDateTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  return (
    [year, month, day]
      .map((n) => {
        var m = n.toString();
        return m[1] ? m : '0' + m;
      })
      .join('-') +
    ' ' +
    [hour, minute, second]
      .map((n) => {
        var m = n.toString();
        return m[1] ? m : '0' + m;
      })
      .join(':')
  );
}
</script>
</html>`;
}

export default stockTrendPic;
