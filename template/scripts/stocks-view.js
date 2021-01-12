const undef = void 0;
const vscode = acquireVsCodeApi();
const deviceId =
  Math.random().toString(16).substr(2) + Math.random().toString(32).substr(2);

function checkInputValue(v) {
  return /^[0-9]+(.[0-9]{1,3})?%?$/.test(v);
}

function vscode_alert(msg) {
  vscode.postMessage({
    command: 'alert',
    message: msg,
  });
}

const Talker = {
  options: {},
  _threadId: 0,
  _createIssueLockMap: {},
  _currentTask: null,
  _nextTask: null,
  _initGitalk() {
    if (!this.ready || !this.options.id) return;
    $('#gitalk-container').html('');
    let _gitalk = new Gitalk({
      clientID: '',
      clientSecret: '',
      // repo: 'gittalk-demo', // The repository of store comments,
      repo: 'leek-discussions', // The repository of store comments,
      // owner: 'zqjimlove',
      owner: 'LeekHub',
      admin: ['zqjimlove'],
      id: this.options.id || 'SH000001', // Ensure uniqueness and length less than 50
      distractionFreeMode: false, // Facebook-like distraction free mode
      accessToken: this.accessToken,
      title: this.options.title,
      body: this.options.body,
      checkAdmin: false,
      createIssueManually: false,
      labels: this.options.labels || ['discussions', 'stock'],
      handleLogin: () => {
        vscode.postMessage({
          command: 'loginGithub',
        });
      },
    });
    this.gitalk = _gitalk.render('gitalk-container');
  },
  _bind() {
    $('#treeList').on('click', '.stock-item', (e) => {
      const dataset = e.currentTarget.dataset;
      const id = dataset.id;
      const info = JSON.parse(dataset.info);
      const type = dataset.type;
      this._changeGitalkOption(info, type);
    });
  },
  _changeGitalkOption(stockInfo, type = 'stock') {
    this.options = {
      id: stockInfo.code,
      title: `「${stockInfo.name}」讨论主题`,
      body: '和气生财，友善发言',
      labels: ['discussions', type],
    };
    if (!this.gitalk) return this._initGitalk();
    if (!this.gitalk.state.user) return;

    /**
     * ! 用于网络延迟的问题，在异步请求过程中，用户快速点击切换个股
     * ! 很有可能会导致发起多次请求issue，多次创建同一issue的问题
     * ! 现在利用两个 Promise 变量 _currentTask 和 _nextTask 作为节流限制，避免发起多次并行请求
     * ! _currentTask 处于 pending 时，用户再次切换个股的操作会被赋值（覆盖）到 _nextTask，
     * ! 当 _currentTask 执行完后，会判断非空并执行 _nextTask。否则 _currentTask 赋值null，等待下一次切换。
     * !
     * ! 以上方法，实现了 _currentTask 未执行完，即使用户快速多次切换，_nextTask 也只会是 _currentTask 执行期间最后的一个。
     * ! 并且避免的网络延迟导致的并行请求引发的问题。
     */
    const exec = () => {
      return new Promise((resolve) => {
        this.gitalk.options = Object.assign(
          {},
          this.gitalk.options,
          this.options
        );
        this.gitalk.reset(() => {
          this.gitalk
            .getIssue()
            .then((issue) => {
              const lockKey = `${type}:${this.gitalk.options.id}`;
              if (!issue) {
                if (!this._createIssueLockMap[lockKey]) {
                  this._createIssueLockMap[lockKey] = true;
                  return this.createIssue().then(() => {
                    return this.getIssue();
                  });
                } else {
                  return this.getIssue();
                }
              }
              return issue;
            })
            .then((issue) => {
              this.gitalk.getComments(issue);
            })
            .then(() => {
              this.gitalk.setState({
                isIniting: false,
              });
              resolve();
            })
            .catch((err) => {
              console.error(err);
              resolve();
            });
        });
      }).then(() => {
        if (this._nextTask) {
          this._currentTask = this._nextTask();
          this._nextTask = null;
        } else {
          this._currentTask = null;
        }
      });
    };

    if (!this._currentTask) {
      this._currentTask = exec();
    } else {
      this._nextTask = exec;
    }
  },
  init() {
    this._bind();
    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.command) {
        case 'setGithubAccessToken':
          this.accessToken = msg.data;
          break;
        case 'talkerReady':
          this.ready = true;
          this._initGitalk();
          break;
        case 'githubLoginSuccess':
          this._initGitalk();
      }
    });
  },
};

// Talker.init();

/** 提醒 */
const Viewer = {
  treeListCompiler: template.compile($('#stockItemTpl').html()),
  remindFieldsCompiler: template.compile($('#remindFieldTpl').html()),
  stockRemind: {},
  stockList: [],
  fundList: [],
  currentStockId: undef,
  /**
   * 绑定事件
   */
  _bind() {
    let currentStockId = this.currentStockId;
    $('#newRemindForm').on('submit', (e) => {
      e.preventDefault();
      var ro = (this.stockRemind[currentStockId] = this.stockRemind[
        currentStockId
      ] || {
        price: [],
        percent: [],
      });
      var newCfg = {
        price: [],
        percent: [],
      };
      $('#newRemindForm')
        .serializeArray()
        .forEach(({ name, value }) => {
          if (value) {
            if (!checkInputValue(value)) {
              vscode_alert(`输入的「${value}」格式不正确`);
              $(`input[name=${name}]`).focus();
              console.log('stockRemind: ', this.stockRemind);
              throw new Error(`输入的「${value}」格式不正确`);
            }

            const type = name.substring(0, name.length - 1);
            const remindType = name.substring(name.length - 1);
            value = (remindType === '1' ? '+' : '-') + value;
            if (this.stockRemind[currentStockId][type].indexOf(value) > -1) {
              vscode_alert(`输入的设置已经存在`);
              $(`input[name=${name}]`).focus();
              console.log('stockRemind: ', this.stockRemind);
              throw new Error(`输入的设置已经存在`);
            }
            newCfg[type].push(value);
          }
        });
      $('#newRemindForm')[0].reset();
      $('.reminds-box').removeClass('reminds-box_add');
      // stockRemind[currentStockId] = newCfg;
      ro.price.push.apply(ro.price, newCfg.price);
      ro.percent.push.apply(ro.percent, newCfg.percent);
      this.updateTreeList();
      this.renderRemindFields(currentStockId);
      this.saveStockRemind();
    });

    $('#appendRemindBtn').click(() => {
      $('.reminds-box').addClass('reminds-box_add');
    });

    $('#cancelAppendRemindBtn').click(() => {
      $('.reminds-box').removeClass('reminds-box_add');
      $('#newRemindForm')[0].reset();
    });

    $('#treeList').on('click', '.stock-item', (e) => {
      const dataset = e.currentTarget.dataset;
      const id = dataset.id;
      const info = JSON.parse(dataset.info);
      currentStockId = this.currentStockId = id;
      this.renderRemindFields(id);
      $('#currentStockName').text(info.name);
      $('#currentStockNum').text(info.code.toUpperCase());
      $('#cancelAppendRemindBtn').click();
    });

    $('#remindFields')
      .on('click', '.remove', (e) => {
        const dataset = e.currentTarget.dataset;
        const type = dataset.type;
        const index = dataset.index;
        $('#field_' + type + '_' + index).remove();
        this.stockRemind[currentStockId][type].splice(index, 1);
        this.renderRemindFields(currentStockId);
        console.log('stockRemind: ', this.stockRemind);
        this.saveStockRemind();
      })
      .on('change', 'input', (e) => {
        console.log('e: ', e);
        const dataset = e.currentTarget.dataset;
        const type = dataset.type;
        const index = dataset.index;
        const remindType = dataset.remindType;
        let value = e.currentTarget.value;
        if (!checkInputValue(value)) {
          vscode_alert(`输入的「${value}」格式不正确`);
          return;
        }
        value = (remindType === '1' ? '+' : '-') + value;
        if (this.stockRemind[currentStockId][type].indexOf(value) > -1) {
          vscode_alert(`输入的设置已经存在`);
          return;
        }
        this.stockRemind[currentStockId][type][index] = value;
        console.log('stockRemind: ', this.stockRemind);
        this.saveStockRemind();
      });
  },
  /**
   * 定义模板的方法
   */
  _defindeTemplateImports() {
    template.defaults.imports.formatRemindValue = function (value) {
      const symbol = String(value)[0];
      if (/[+-]/.test(symbol)) {
        return String(value).substr(1);
      } else {
        return value;
      }
    };
    template.defaults.imports.remindType = function (value) {
      const symbol = String(value)[0];
      return symbol === '-' ? 0 : 1;
    };
    template.defaults.imports.remindLabel = function (type, value) {
      const symbol = String(value)[0];
      switch (type) {
        case 'price':
          return '股价' + (symbol === '-' ? '下跌' : '上涨') + '到';
        case 'percent':
          return '日' + (symbol === '-' ? '跌幅' : '涨幅') + '达';
          break;
      }
    };
  },
  /**
   * 保存提醒配置
   */
  saveStockRemind: _.debounce(function () {
    vscode.postMessage({
      command: 'saveRemind',
      data: JSON.stringify(this.stockRemind),
    });
  }, 300),
  /**
   * 渲染提醒设置
   * @param {*} stockId
   */
  renderRemindFields(stockId) {
    const ro = this.stockRemind[stockId];
    if (!ro || (!ro.price.length && !ro.percent.length)) {
      $('#remindFields').html('请先添加提醒');
      return;
    }
    $('#remindFields').html(
      this.remindFieldsCompiler({
        data: ro.price,
        type: 'price',
        unit: '元',
      }) +
        this.remindFieldsCompiler({
          data: ro.percent,
          type: 'percent',
          unit: '%',
        })
    );
    $('#remindFields').width();
  },
  /**
   * 渲染个股列表
   * @param {} stockList
   */
  updateTreeList(
    stockList = this.stockList || [],
    fundList = this.fundList || []
  ) {
    const fillRemindCount = (info) => {
      var ro;
      if ((ro = this.stockRemind[info.id])) {
        info.remindCount = ro.price.length + ro.percent.length;
      } else {
        info.remindCount = 0;
      }
    };
    stockList.forEach(fillRemindCount);
    fundList.forEach(fillRemindCount);
    // stockList.sort((a, b) => b.remindCount - a.remindCount);
    $('#treeList').html(
      this.treeListCompiler({ stockList: stockList, fundList: fundList })
    );
    if (!this.currentStockId) {
      $('#treeList .stock-item:eq(1)').click();
    }
  },
  init() {
    this._defindeTemplateImports();
    this._bind();
    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.command) {
        case 'updateStockList':
          this.updateTreeList((this.stockList = msg.data));
          break;
        case 'updateFundList':
          this.updateTreeList(undef, (this.fundList = msg.data));
          break;
        case 'updateStockRemind':
          this.stockRemind = msg.data;
          this.currentStockId && this.renderRemindFields(this.currentStockId);
          break;
      }
    });
  },
};
Viewer.init();

vscode.postMessage({
  command: 'pageReady',
});

// 资金流向跳转
const hstflowBtn = document.querySelector('#hstflowBtn');
const mainflowBtn = document.querySelector('#mainflowBtn');
hstflowBtn.onclick = function () {
  vscode.postMessage({
    command: 'hsgtFundFlow',
  });
};
mainflowBtn.onclick = function () {
  vscode.postMessage({
    command: 'mainFundFlow',
  });
};
// 社区
document.querySelector('#tucaoBtn').onclick = function () {
  vscode.postMessage({
    command: 'tucaoForum',
  });
};
