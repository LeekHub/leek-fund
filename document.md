# 韭菜盒子使用指南

## 目录

<!--ts-->

- [支持环境](#支持环境)
- [安装指引](#安装指引)
- [更新指引](#更新指引)
- [功能介绍](#功能介绍)
- [插件配置说明](#插件配置说明)
- [常见问题](#常见问题)
- [交流群](#交流群)

<!-- Added by: giscafer, at: Tue Aug 11 15:20:22 CST 2020 -->

<!--te-->

## 支持环境

- VSCode 最低版本要求：`v1.40.0+`
- Windows、Mac

### 安装指引

- 根据自身系统、环境。[安装 vscode](https://code.visualstudio.com/)
- 在左侧竖状任务栏找到 Extensions → 搜索`韭菜盒子`或`LeekFund` → 安装即可

### 更新指引

- 在发布了新版本后，在 Extensions → 搜索`韭菜盒子`或`LeekFund` → 更新安装即可
- 存在延迟情况，可重启 VSCode 解决
- 如遇更新问题，请提[issues](https://github.com/LeekHub/leek-fund/issues)

## 功能特性

本插件具有以下特点：

- 基金实时涨跌，实时数据，支持海外基展示
- 股票实时涨跌，支持 A 股、港股、美股
- 期货实时涨跌，支持国内期货
- 底部状态栏信息
- 开市自动刷新，节假日关闭轮询
- 支持升序/降序排序、基金持仓金额升序/降序
- 基金实时走势图和历史走势图
- 基金排行榜
- 基金持仓信息
- 股市资金流向（沪深港通资金流向、北向资金、南向资金）
- 支持 GUI 操作新增&删除 基金 和 股票
- 通过 GUI 添加基金和股票时，支持模糊搜索匹配
- 支持 GUI 设置涨跌颜色、状态栏股票自定义等
- 雪球用户动态关注（雪球新闻）
- 自定义涨跌图标（吃面、吃肉、烤韭菜、烤肉、喝酒）
- 基金持仓金额设置（用于动态计算盈亏）
- 基金盈亏展示（根据实时基金涨跌情况动态实时计算盈亏）
- 支持维护持仓成本价，自动计算收益率
- 基金趋势统计图
- 基金支持分组展示
- 股票支持分组展示（A 股、港股、美股）
- 股票涨跌提醒设置
- 状态栏、侧栏支持自定义模板格式
- OUTPUT 面板支持选股宝异动快讯，金十资讯
- 数据中心>牛熊风向标数据统计
- 新增支持期货
- 外汇牌价

### 图文操作指引

- [VSCode 插件开发——韭菜盒子（图片如果展示不了可以看知乎的文章界面功能截图）](https://zhuanlan.zhihu.com/p/166683895)

<!-- https://raw.githubusercontents.com/ 为GitHub raw 加速地址 -->

### 概览

![概览](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/overview.png)

### 新增

![GUI新增操作](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/add1.png)

### 快速删除

![GUI删除操作](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/del.png)

### 刷新数据

![刷新数据](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/refresh-data.png)

### 股票 和 基金 搜索添加

![股票搜索添加](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/stock-search.png)

![股票搜索添加](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/fund-search.png)

### 排序

排序、降序按涨跌值排序；不排序的模式是按基金代码或股票代码的顺序，配置文件中数组的元素顺序（可以临时利用这个调整你们想置顶关注的股票或基金）

这个按钮有三个功能：

- 正常顺序（含置顶，置顶会一直在头部）
- 升序
- 降序

点击的时候是这三种情况循环切换的。

![升序/降序排序](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/sort.png)

### 趋势图和 K 线图

![股票实时K线图](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/stock-k-line.png)

### 基金历史净值

![基金历史净值](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/fund-history.png)

### 基金走势图

![基金走势图](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/trend-chart.png)

### 基金排行榜

![基金排行榜](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/ranking.png)

### 股市资金流向（沪深港通资金流向、北向资金、南向资金）

![资金流向](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/fund-flow.png)

### 设置面板

> v1.3.0

![设置面板](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/settings.png)

## OUTPUT 快讯消息

除了韭菜中心里的新闻快讯可以查看新闻，在 OUTPUT 还支持查看金十快讯

![OUTPUT 快讯](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/output.png)

## 韭菜中心

1、有两个入口可以进入

![韭菜中心](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/home-entry.png)

2、进入之后可以查看基金和股票详情

![韭菜中心](https://raw.githubusercontents.com/LeekHub/leek-fund/master/screenshot/600036.png)

## 插件配置

> 打开 VSCode 插件配置文件

**添加/删除股票或基金时，建议使用新增按钮模糊搜索添加（支持名称和编码搜索）**，详细可查看 [韭菜盒子使用文档](https://github.com/LeekHub/leek-fund/issues/23)

下面是插件配置说明：

```
"configuration": {
      "properties": {

        // 配置需要监控的股票代码（新浪接口，所以去新浪找股票代码比较合适）
        // 深股股，上证指数：sh000001
        // 港股股票代码，如阿里巴巴：hk09988，腾讯：hk00700，美团：hk03690
        // 美股指数代码，如道琼斯指数: usr_dji，纳斯达克: usr_ixic，标普500: usr_inx
        // 如配置后没有数据，可以用这个链接测试一下是否有返回数据：https://hq.sinajs.cn/list=hk00700

        "leek-fund.stocks": {
          "type": "array",
          "default": [
            "sh000001",
            "sh000300",
            "sh000016",
            "sh000688",
            "hk03690",
            "hk00700",
            "usr_ixic",
            "usr_dji",
            "usr_inx"
          ],
          "description": "配置需要监控的股票代码（建议通过界面新增）"
        },

        // 配置需要监控的基金代码
        "leek-fund.funds": {
          "type": "array",
          "default": [
            "001632",
            "420009",
            "320007",
            "003096",
            "001102",
            "003885",
            "001071",
            "005963"
          ],
          "description": "配置需要监控的基金代码（建议通过界面新增）"
        },
        "leek-fund.statusBarStock": {
          "type": "array",
          "default": [
            "sh000001"
          ],
          "description": "状态栏展示的股票（建议通过界面选择设置，必须是在股票代码已设置存在）"
        },
        "leek-fund.interval": {
          "type": "number",
          "default": 5000,
          "description": "配置轮询请求最新数据的时间间隔，单位：毫秒（最小轮询间隔是3秒）"
        },
        "leek-fund.riseColor": {
          "type": "string",
          "default": "white",
          "description": "股票涨的颜色"
        },
        "leek-fund.fallColor": {
          "type": "string",
          "default": "#C9AD06",
          "description": "股票跌的颜色"
        }
      }
    }

```

## 常见问题

> 问题会逐渐修复和完善

- 如遇页面操作无法解决的问题，可点击左下角齿轮 setting 搜 `韭菜盒子` 可进入配置文件进行修改

- 如遇添加基金后，显示基金名称为 `Null` 请先验证下 `http://fundgz.1234567.com.cn/js/xxxxx.js?callback=a` 行的话但是插件显示 `null` 麻烦进行[群反馈问题](https://github.com/LeekHub/leek-fund/issues/19)，不行就是接口不支持，解决不了，除非有新接口。

- 如遇`股票面板无数据`，可先检查下是否开启代理。股票走 https。关闭代码刷新数据重试。如果仍无数据，麻烦进行[群反馈问题](https://github.com/LeekHub/leek-fund/issues/19)

### fail: Stock error

**如果出现此错误，浏览器打开报错链接，自测链接是否请求通，如果浏览器可以，VSCode 不行，检查一下是不是 VSCode 走了代理导致网络不通？**

![image](https://user-images.githubusercontent.com/8676711/90463266-16ccda00-e13d-11ea-8458-5362dd53c9bb.png)

## 问题反馈

使用有 bug 或者体验问题可以在 issues 反馈：https://github.com/LeekHub/leek-fund/issues

## 交流群

[投资学习交流群](https://github.com/LeekHub/leek-fund/issues/19)
