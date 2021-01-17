# ChangeLog

## [1.9.4]

- feat: 新版韭菜中心，功能&体验升级 🚀 :rocket:
- feat: 支持状态栏基金和股票分开控制显示与隐藏
- fix: 当前价为空时计算收益问题

## [1.9.2]

- fix: 基金收益日期显示问题

## [1.9.1]

- feat: 状态栏新增基金收益统计
- feat: 韭菜中心新增主力资金流向、北向资金流向、韭菜盒子社区入口
- refactor: 资金流向页面重构，增强功能和交互入口

## [1.9.0]

- fix: binance 请求失败会提示错误 data of undefined 问题
- chore: 优化图片分享加上日期

## [1.8.7]

- feat: 设置持仓金额页面新增收益率排序功能
- chore: 集成 Amplitude 统计

## [1.8.6]

- feat: 基金持仓金额页新增刷新按钮
- feat: 持仓分享图片生成

## [1.8.5]

- feat: 选股宝异动快讯，金十全量输出 @zqjimlove
- fix: 修复金十的消息显示 undefined @zqjimlove
- fix: statusbar 股价更新滞后问题 @zqjimlove

## [1.8.4]

- feat: OUTPUT 窗口新增金十快讯 @zqjimlove
- fix: 当设置股价下跌提醒时，在早上未开盘期间，股价为 0.00，这个时候会提示下跌到了 0.00 @wujunchuan

## [1.8.3]

- chore: 因 Github 限制，gitalk 实现的 issue 评论功能暂时关闭 @zqjimlove

## [1.8.2]

- fix: 修复评论 401 问题 @zqjimlove

## [1.8.1]

- fix: 修复 issue 无法创建 labels @zqjimlove

## [1.8.0]

- feat: 新增韭菜讨论中心，支持基金和股票评论 🚀 :rocket: @zqjimlove

## [1.7.7]

- feat: 基金详情图表支持黑色背景模式 @laampui
- fix: 基金涨跌排序切换失效的问题 @wujunchuan
- fix: 股票提醒设置不起作用 bug @zqjimlove
- chore: 配置 2021 年香港和美股放假时间 @iporer

## [1.7.6]

- feat: 新增对数字货币行情的简单支持 @wujunchuan

## [1.7.5]

- fix: 竞价阶段部分个股显示-100% @zqjimlove
- fix: 竞价阶段-100%问题、多次点击关闭提醒会被打开的问题 @zqjimlove

## [1.7.4]

- fix: 股票状态栏新选择的股票数量少于之前的数量时，不会删除未选择的股票的 bug @iporer

## [1.7.3]

- feat: 更新基金数据，比如`010160`

## [1.7.2]

- feat: 基金新增持仓金额升序降序
- chore: 控制只显示一次错误弹窗（临时处理）
- chore: 项目工程化信息规范

## [1.7.1]

- perf: 股票接口请求逻辑 @zqjimlove
- perf: 状态栏个股点击快速更换，自定义状态栏、侧栏模板格式 @zqjimlove

## [1.7.0]

- chore: 提醒的涨跌状态判断从「昨收价-现价」改为「现价-上一秒价」 @zqjimlove
- fix: 浮点数精度问题 @zqjimlove
- fix: 基金亏时两个减号问题

## [1.6.9]

- feat: 股价提醒功能，增强体验 @zqjimlove

## [1.6.8]

- fix: 收益率小数位数问题 [#96](https://github.com/giscafer/leek-fund/issues/96)

## [1.6.7]

- feat: 新增持仓成本价设置，自动计算收益率 🚀 :rocket:
- fix: VSCode 隔天不重启盈亏计算显示问题 [#78](https://github.com/giscafer/leek-fund/issues/78)

## [1.6.6]

- feat: 增加股价提醒功能 @zqjimlove

## [1.6.5]

- feat: 支持恒生股票 @iporer
- chore: 新增 Discord 交流社区邀请链接 https://discord.gg/AmzMfQz

## [1.6.4]

国庆中秋快乐！🎑

- fix: 休市休眠唤醒 bug @iporer
- refactor: 重构优化代码

## [1.6.3]

- fix: 节假日 bug @iporer
- fix: 闭市轮询策略 bug

## [1.6.2]

- feat: 股票根据自选股所有的交易市场优化交易时间判断 @iporer
- feat: 接口判断中国节假日 @gordongxm
- chore: 闭市之后，定时器轮询检查是否开市时长增长 100 倍

## [1.6.1]

- feat: 新增显示不支持的已添加的股票分组
- fix: 分组计算一开始可能显示为 0 的问题

## [1.6.0]

- feat: 股票支持分组展示（A 股、港股、美股）
- refactor: 重构部分代码
- fix: 15 点后不请求数据（之前是 9 点到 16 点之间都请求了）

## [1.5.9]

- fix: 资金流向页面无法显示 bug

## [1.5.8]

- fix: 雪球新闻支持用户设置 cookie，防爬虫

## [1.5.7]

- chore: 持仓矩形树图面积改为持仓占比
- chore: 股票走势图片保留在右键菜单
- chore: 修改其他已知细节

## [1.5.6]

- feat: 股票实时统计图
- feat: 基金历史趋势统计图

## [1.5.5]

- feat: 新增基金持仓矩形树图
- fix: 基金持仓金额最多 7 位限制问题
- chore: 基金未设置持仓金额不显示盈亏

## [1.5.4]

- feat: 基金持仓明细和持仓股票涨跌情况

## [1.5.3]

- chore: 停牌股票标记误判取消了

## [1.5.1]

- fix: 基金估算收益统计
- fix: 排序 string 值错误问题

## [1.5.0]

- feat: 基金接口更换，速度更快、基金数据更全（支持海外基金显示）
- feat: 基金持仓金额设置
- feat: 基金盈亏实时计算展示
- feat: 雪球信息流自动刷新（20s)
- chore: 新增 2 种涨跌图标
- fix: 股票实时趋势图片定时刷新图片加载失败
- fix: 优化其他已知问题

## [1.4.6]

- feat: 用户排序会保存到配置，下次打开就是上次的排序方式
- feat: 支持更换涨跌图标，目前就两种：箭头、食物（吃面、吃肉）
- fix: 侧边栏股票不自动刷新 bug

## [1.4.5]

- feat: 股票支持 LOF 和 ETF :heart: PR By @iporer
- chore: 根据个股自适应小数位的有效位数 :heart: PR By @iporer

## [1.4.4]

- chore: 修改基金错误时文本信息
- chore: 侧边栏图标更换
- chore: 股票跌默认颜色修改

## [1.4.3]

- chore: 基金搜索数据获取改成静态本地数据

## [1.4.2]

- feat: 右键菜单查看用户动态

## [1.4.1]

- feat: 新增银行螺丝钉和雪球访谈两个默认用户
- feat: 信息流使用简要文字代替全文
- fix: 资讯跳转雪球 url 问题

## [1.4.0]

- feat: 雪球用户动态关注

可以自定义关注雪球用户和浏览用户发布的动态信息（限 10 条记录）

## [1.3.3]

- fix: 隐藏文本时涨跌没区分

## [1.3.2]

- feat: 新增版本检查更新提示

## [1.3.1]

- feat: 新增基金和股票置顶功能 :heart: PR By @gordongxm
- fix: 断网时重启 VSCode，第一次获取不到数据时，会不停的请求数据报错弹窗问题

## [1.3.0]

:rocket:

- feat: 新增设置面板，提供 GUI 功能操作
- feat: 支持 GUI 显示/隐藏股票和基金文本设置
- feat: 支持 GUI 状态栏多股票设置（限制 4 个）
- feat: 支持 GUI 设置股票涨跌颜色
- feat: 按钮快速打开配置页面
- refactor: webview 相关代码重构

## [1.2.12]

- fix: 修复股票搜索，支持中英文

## [1.2.11]

- chore: 优化界面样式

## [1.2.10]

- 优化 webview 打开，复用窗口，同类型窗口只展示一个 :heart: PR By @zomixi

## [1.2.7]

- fix: 资金流向 img 重复添加 bug

## [1.2.6]

- 更换插件 LOGO，:heart: Design By @JayHuangTnT
- fix: 折叠基金 panel 时，股票数据不刷新 bug
- chore: 资金流向流出数据绿色显示

## [1.2.5]

- feat: 股市资金流向（北向资金、南向资金）
- fix: 定时配置修改后需要重启

## [1.2.4]

- fix: 状态栏数据不能刷新

## [1.2.3]

- feat: 基金右键菜单，查看持仓信息和历史净值列表

## [1.2.2]

- fix: sz 股票类型遗漏 :heart: PR by @httpcheck

## [1.2.0]

- feat: 支持股票模糊搜索添加
- fix: 股票支持前缀 `usr_` 美股 :heart: PR by @SubinY
- fix: 美股详情里实时趋势图定时 `20s` 刷新一次

## [1.1.10]

- feat: 基金 GUI 新增支持模糊匹配搜索 :heart: PR by @zomixi
- chore: 修改涨跌图标样式，提升体验

## [1.1.9]

- feat: 排序按钮新增第三个模式：不排序（升序/降序、不排序）
- fix: 基金详情页面实时走势图没有定时刷新（定时 20s 轮询）

## [1.1.8]

:bangbang: 插件由原来的 “韭菜基金” 改名为 **韭菜盒子**

- fix: 股票错误代码需要手动改配置文件问题 :heart: PR by @httpcheck
- feat: 点击基金也可以直接查看到实时走势图
- chore: 新增操作手册 :heart: PR by @JayHuangTnT

## [1.1.7]

- feat: 新增基金实时走势图

## [1.1.6]

- feat: 新增基金历史走势图

## [1.1.5]

- fix: 修复 ubuntu 系统插件初始化 bug

## [1.1.4]

- chore: 加入错误日记提示，用于问题排查
- feat: 美化股票 K 线图样式

## [1.1.3]

- feat: 新增基金排行榜

## [1.1.2]

- fix: 闭市时插件启动 status bar 无法初始化问题

## [1.1.1]

- feat: 支持手动刷新数据
- feat: 股票悬浮显示今日详情 tooltip

## [1.1.0]

- feat: 支持升序/降序排序
- feat: 支持股票新增和删除 GUI 操作（基金也支持）

## [1.0.0]

**:triangular_flag_on_post:重大改变，代码 100% 重构**

- refactor: 重构代码，typescript 开发
- feat: 替换股票数据为新浪 api
- fix: 修复港股和美股数据无法获取问题

## [0.2.1]

- fix: 闭市后不再请求数据，数据定时请求时间固定在 9 点到 15 点

## [0.2.0]

- feat: 支持 GUI 操作新增&删除基金 :heart: PR by @zomixi

## [0.1.10]

- fix: 兼容到 VSCode `1.29.0` 版本
- chore: 配置说明修改

## [0.1.9]

- feat: 股票支持 K 线走势图

## [0.1.8]

- fix: 错误的基金编码处理
- feat: 支持基金历史数据查看&股票走势图查看

## [0.1.6]

- fix: 替换实时基金接口

## [0.1.5]

- 新增 A 股指数

## [0.1.4]

- 新增菜单面板查看基金和上证指数

## [0.1.3]

- 修改体验细节

## [0.1.0]

- 实现基金涨跌实时查看
