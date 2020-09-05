import { ViewColumn, window } from 'vscode';
import ReusedWebviewPanel from '../ReusedWebviewPanel';

async function setAmount(list: any[] = [], cb: Function) {
  const panel = ReusedWebviewPanel.create('setAmountWebview', `基金持仓金额设置`, ViewColumn.One, {
    enableScripts: true,
    retainContextWhenHidden: true,
  });
  // Handle messages from the webview
  panel.webview.onDidReceiveMessage((message) => {
    switch (message.command) {
      case 'success':
        cb(JSON.parse(message.text));
        window.showInformationMessage('保存成功！');
        return;
      case 'alert':
        window.showErrorMessage('保存失败！');
        return;
    }
  }, undefined);
  panel.webview.html = getWebviewContent(list);
}

function getWebviewContent(list: any[] = []) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>韭菜盒子</title>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1, user-scalable=no"
  />
  <link
    href="https://cdn.bootcdn.net/ajax/libs/element-ui/2.9.2/theme-chalk/index.css"
    rel="stylesheet"
  />
  <style>
    body,
    html {
      height: 100%;
      -webkit-tap-highlight-color: transparent;
    }

    div {
      margin-left: 20px;
      line-height: 28px;
    }
    .list .name,
    .amount {
      display: inline-block;
    }
    .unit,
    .amount {
      float: right;
    }
    .item {
      margin-top: 10px;
    }
    .el-input {
      width: 160px;
      height: 28px;
    }
    .el-input__inner {
      height: 28px;
      width: 90%;
      background-color: #eee;
    }
    .main {
      margin: 30px auto;
      width: 520px;
    }
    .footer {
      width: 520px;
      margin: 30px auto;
      text-align: center;
    }
  </style>
</head>

<body ontouchstart>
  <div class="main">
  <h3 style="text-align: center">持仓金额</h3>
    <div class="list">
      <div class="item">
        <div class="name">诺安基金</div>
        <div class="amount el-input">
          <input type="number" class="el-input__inner" id="320007" />
        </div>
      </div>
    </div>
    <div class="footer">
      <button
        class="el-button el-button--primary el-button--medium"
        id="save"
      >
        保存
      </button>
    </div>
  </div>
  <script src="https://cdn.bootcss.com/jquery/1.11.0/jquery.min.js"></script>

  <script>
    $(function () {
      const vscode = acquireVsCodeApi();
      const fundList = ${JSON.stringify(list)};
      const list = $('.list');

      $('#save').click(() => {
        fundList.forEach((item) => {
          const amount = $('#' + item.code).val();
          item.amount = isNaN(Number(amount)) ? 0 : Number(amount);
        });
        console.log(fundList);
        vscode.postMessage({
          command: 'success',
          text: JSON.stringify(fundList)
      })
      });
      let listStr = '';
      fundList.forEach((item) => {
        const str =
          '<div class="item"><div class="name">' +
          item.name +
          '</div>' +
          '<div class="amount el-input">' +
          '<input type="number" min="0"  max="9999999" class="amountInput el-input__inner" id="' +
          item.code +
          '" value="' +
          item.amount +
          '"  /><span class="unit">元</span> </div>' +
          '</div>';

        listStr += str;
      });
      list.html(listStr);
      $('.amountInput').on('input', function (e) {
        const value = e.target.value;
        if (value.length > 7) {
          e.target.value = value.slice(0, 7);
        }
      });
    });
  </script>
</body>
</html>

`;
}

export default setAmount;
