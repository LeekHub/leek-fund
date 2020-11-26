import { ExtensionContext, ViewColumn } from 'vscode';
import ReusedWebviewPanel from './ReusedWebviewPanel';

async function donate(context: ExtensionContext) {
  const panel = ReusedWebviewPanel.create('donateWebview', '打赏作者@giscafer', ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  panel.webview.html = getWebViewContent();
}

function getWebViewContent() {
  return `
  <html xmlns="https://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <script src="https://libs.baidu.com/jquery/2.0.0/jquery.min.js"></script>
    <title>打赏</title>
    <style type="text/css">
      .content {
        width: 540px;
        margin: 100px auto;
      }
      .hide_box {
        z-index: 999;
        filter: alpha(opacity=50);
        background: #666;
        opacity: 0.5;
        -moz-opacity: 0.5;
        left: 0;
        top: 0;
        height: 99%;
        width: 100%;
        position: fixed;
        display: none;
      }
      .shang_box {
        width: 540px;
        height: 540px;
        padding: 10px;
        background-color: #fff;
        border-radius: 10px;
        border-radius: 10px;
        position: relative;
        z-index: 1000;
        margin: 0 auto;
        border: 1px dotted #dedede;
      }
      .shang_box img {
        border: none;
        border-width: 0;
      }
      .dashang {
        display: block;
        width: 100px;
        margin: 5px auto;
        height: 25px;
        line-height: 25px;
        padding: 10px;
        background-color: #e74851;
        color: #fff;
        text-align: center;
        text-decoration: none;
        border-radius: 10px;
        font-weight: bold;
        font-size: 16px;
        transition: all 0.3s;
      }
      .dashang:hover {
        opacity: 0.8;
        padding: 15px;
        font-size: 18px;
      }
      .shang_close {
        float: right;
        display: inline-block;
      }
      .shang_logo {
        display: block;
        text-align: center;
        margin: 20px auto;
      }
      .shang_tit {
        width: 100%;
        height: 75px;
        text-align: center;
        line-height: 66px;
        color: #a3a3a3;
        font-size: 16px;
        background: url('https://ww1.sinaimg.cn/large/940e68eegy1ghyyd5jtocj20f8023dfn.jpg');
        font-family: 'Microsoft YaHei';
        margin-top: 7px;
        margin-right: 2px;
        margin-bottom: 22px;
      }
      .shang_tit p {
        color: #696666;
        text-align: center;
        font-size: 16px;
      }
      .shang_payimg {
        width: 140px;
        padding: 10px;
        border: 6px solid #ea5f00;
        margin: 0 auto;
        border-radius: 3px;
        height: 140px;
      }
      .shang_payimg img {
        display: block;
        text-align: center;
        width: 140px;
        height: 140px;
      }
      .pay_explain {
        text-align: center;
        margin: 10px auto;
        font-size: 12px;
        color: #545454;
      }
      .radiobox {
        width: 16px;
        height: 16px;
        background: url('https://ww1.sinaimg.cn/large/940e68eegy1ghyyf0i5x2j200g00gdfl.jpg');
        display: block;
        float: left;
        margin-top: 5px;
        margin-right: 14px;
      }
      .checked > .radiobox {
        background: url('https://ww1.sinaimg.cn/large/940e68eegy1ghyygj4gwej200g00gdfl.jpg');
      }
      .shang_payselect {
        text-align: center;
        margin: 0 auto;
        margin-top: 40px;
        cursor: pointer;
        height: 60px;
        width: 280px;
      }
      .shang_payselect > .pay_item {
        display: inline-block;
        float: left;
        margin-right: 10px;
      }
      .shang_info {
        clear: both;
      }
      .shang_info p,
      .shang_info a {
        color: #696666;
        text-align: center;
        font-size: 12px;
        text-decoration: none;
        line-height: 2em;
      }
      .like-author-list {
        color: #696666;
        text-align: center;
      }
      .like-author-list .list {
        list-style: none;
        font-size: 14px;
      }
      .description {
        font-size: 14px;
      }
      .update-time {
        font-size: 11px;
      }
    </style>
  </head>

  <body>
    <div style="display: none">
      <img
        src="https://ww1.sinaimg.cn/large/940e68eegy1ghyyag1d02j20dc0d077j.jpg"
        alt="alipay"
      />
      <img
        src="https://ww1.sinaimg.cn/large/940e68eegy1gi599sueg7j20fo0fcgrw.jpgg"
        alt="wechat"
      />
    </div>
    <div class="content">
      <div class="shang_box" style="display: block">
        <div class="shang_tit">
          <p>谢谢老板，祝老板吃鸡腿!</p>
        </div>
        <div class="shang_payimg">
          <img
            src="https://ww1.sinaimg.cn/large/940e68eegy1gi599sueg7j20fo0fcgrw.jpg"
            alt="扫码支持"
            title="扫一扫"
          />
        </div>
        <div class="pay_explain">扫码打赏，你说多少就多少</div>
        <div class="shang_payselect">
          <div class="pay_item checked" data-id="wechatpay">
            <span class="radiobox"></span>
            <span class="pay_logo"
              ><img
                src="data:image/jpeg;base64,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"
                alt="微信"
            /></span>
          </div>
          <div class="pay_item" data-id="alipay">
            <span class="radiobox"></span>
            <span class="pay_logo"
              ><img
                src="data:image/jpeg;base64,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"
                alt="支付宝"
            /></span>
          </div>
        </div>
        <div class="shang_info">
          <p>
            打开<span id="shang_pay_txt">微信</span>扫一扫，即可进行扫码打赏哦
          </p>
        </div>
      </div>
      <div class="like-author-list">
        <p class="description">加载中……</p>
        <span class="update-time"></span>
        <ul class="list"></ul>
      </div>
    </div>
    <script type="text/javascript">
      var alipayImageData =
        'https://ww1.sinaimg.cn/large/940e68eegy1ghyyag1d02j20dc0d077j.jpg';
      var wechatPayImageData =
        'https://ww1.sinaimg.cn/large/940e68eegy1gi599sueg7j20fo0fcgrw.jpg';
      $(function () {
        $('.pay_item').click(function () {
          $(this)
            .addClass('checked')
            .siblings('.pay_item')
            .removeClass('checked');
          var dataid = $(this).attr('data-id');
          if (dataid === 'wechatpay') {
            $('.shang_payimg img').attr('src', wechatPayImageData);
          } else {
            $('.shang_payimg img').attr('src', alipayImageData);
          }
          $('#shang_pay_txt').text(dataid == 'alipay' ? '支付宝' : '微信');
        });
        var likeParent = $('.like-author-list');
        var timestramp = new Date().getTime();
        $.get(
          'https://raw.githubusercontent.com/giscafer/leek-fund/master/resources/donate.json?v=' +
            timestramp,
          function (res) {
            res = JSON.parse(res);
            var list = res.likeTheAuthors || [];
            likeParent.find('.description').text(res.description);
            likeParent.find('.update-time').text(res.updatedTime);
            var liStr = '';
            list.forEach(function (item) {
              liStr +=
                '<li class="user">' + item.name + '（' + item.from + '）</li>';
            });
            console.log(liStr);
            likeParent.find('.list').html(liStr);
          }
        );
      });
    </script>
  </body>
</html>

  `;
}
export default donate;
