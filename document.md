# 韭菜盒子使用指南

## 目录

<!--ts-->

- [序言](#序言)
- [支持环境](#支持环境)
- [功能介绍](#功能介绍)
  _ [图文操作指引](#图文操作指引)
  _ [新增](#新增)
  _ [删除](#删除)
  _ [排序](#排序)
  _ [趋势图和 K 线图](#趋势图和-k-线图)
  _ [基金历史净值](#基金历史净值)
- [插件配置说明](#插件配置说明)
- [问题](#问题)
- [问题反馈](#问题反馈)
- [交流群](#交流群)

<!-- Added by: giscafer, at: Tue Aug 11 15:20:22 CST 2020 -->

<!--te-->

## 序言

**投资其实就是一次心态修炼，稳住心态长期投资都会有收益的！！**

今年开始学习养基，有一天想安装个 VSCode 插件，但没找到好用的 VSCode 基金插件，插件中大部分只有股票的功能，所以就决定开发**韭菜盒子**了……

## 支持环境

- 安装插件：[VisualStudio | Marketplace](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)，
  VSCode 最低版本要求：`v1.40.0+`
- Windows、Mac、Linux

## 功能介绍

- 基金涨跌查看，可自定义配置基金代码，支持查看基金历史净值详情
- 股票涨跌查看，可自定义配置股票代码，支持查看股票实时 K 线图
- 左侧菜单面板
- 底部状态 bar
- 自动刷新（每天 9~15 点之间轮询刷新数据）
- 手动刷新
- 支持升序/降序排序
- 支持 GUI 操作新增&删除 基金 和 股票
- 基金排行榜
- 基金走势图（含实时走势） `v1.1.7`
- 持续更新……

#### 图文操作指引

- [VSCode 插件开发——韭菜盒子（图片如果展示不了可以看知乎的文章界面功能截图）](https://zhuanlan.zhihu.com/p/166683895)

<!-- https://raw.staticdn.net/ 为GitHub raw 加速地址 -->

##### 新增

![GUI新增操作](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/add1.png)

##### 删除

![GUI删除操作](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/del.png)

##### 排序

![升序/降序排序](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/sort.png)

##### 趋势图和 K 线图

![股票实时K线图](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/stock-k-line.png)

##### 基金历史净值

![基金历史净值](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/fund-history.png)

## 插件配置说明

支持 GUI 操作新增&删除基金，也可以手动修改用户插件配置，修改或添加你所需要监控的股票代码和基金代码，下面是配置说明：

```
  // 配置需要监控的股票代码（新浪接口，所以去新浪找股票代码比较合适）
  // 深股股，上证指数：sh000001
  // 港股股票代码，如阿里巴巴：hk09988，腾讯：hk00700，美团：hk03690
  // 美股指数代码，如道琼斯指数: gb_dji，纳斯达克: gb_ixic，标普500: gb_inx
  // 如配置后没有数据，可以用这个链接测试一下是否有返回数据：https://hq.sinajs.cn/list=hk00700

  "leek-fund.stocks": [
    "sh000001",
    "sh000300",
    "sh000016",
    "sh000688",
    "sh000913",
    "sh000905",
    "hk03690",
    "hk00700",
    "hk09988",
    "gb_ixic",
    "gb_dji",
    "gb_inx"
  ],

  // 配置需要监控的基金代码

  "leek-fund.funds": [
    "001632",
    "420009",
    "320007",
    "003096",
    "001102",
    "003885",
    "001071",
    "005963",
    "005223",
    "002316",
    "161726",
    "161028",
    "519674",
    "161725"
  ],

  // 配置轮询请求最新数据的时间间隔 （单位毫秒ms，为了避免无意义的轮询请求，程序限制配置<3000ms时，用3000ms时间轮询）
  "leek-fund.interval": 5000

  // 配置股票涨的颜色，默认为 white。
  "leek-fund.riseColor": "white"

  // 配置股票跌的颜色，默认为 green
  "leek-fund.fallColor": "black"

  // 隐藏股市状态栏
  "leek-fund.hideStatusBarStock": false

  // 隐藏基金状态栏
  "leek-fund.hideFundBarItem": false

```

## 状态栏、侧栏模板

```
"leek-fund.labelFormat": {
  "type": "object",
  "default": {
    "statusBarLabelFormat": "「${name}」${price}  ${icon}（${percent}%）",
    "sidebarStockLabelFormat": "${icon|padRight|4}${percent|padRight|11}${price|padRight|15}「${name}」",
    "sidebarFundLabelFormat": "${icon|padRight|4}${percent|padRight}「${name}」${earnings} ${time}"
  },
  "description": "修改底部状态栏、侧栏的显示格式。\n"
}
```

支持自定义底部状态栏、侧栏的模板格式。

### 模板语法

请使用 `${key}` 作为占位格式。

支持`padRight`方法（字符不满指定长度则往右填充**空格**），使用格式为`${key|padRight}`或`${key|padRight|15}`，已`|`作为分割，第一个是方法名，第二个是参数。`padRight`默认是*10个空格*长度，可以通过第二个参数定义需要的空格数量。如`${key|padRight|15}`就是使用15个空格长度。

### 支持的参数列表

- `name` 股票、基金名字
- `code` 代码
- `price` 现价
- `percent` 涨跌幅度
- `high` 最高价
- `low` 最低价
- `yestclose` 昨收价
- `open` 开盘价
- `volume` 成交量
- `amount` 成交额

#### 以下参数 **基金** 独有

- `earnings` 盈亏，显示格式如：盈：+100
- `time` 更新时间，**仅T+2的基金显示**。


## 问题

> 问题会逐渐修复和完善

- 如遇页面操作无法解决的问题，可点击左下角齿轮 setting 搜 `韭菜盒子` 可进入配置文件进行修改

- 如遇添加基金后，显示基金名称为 `Null` 请先验证下 `http://fundgz.1234567.com.cn/js/xxxxx.js?callback=a` 行的话但是插件显示 `null` 麻烦进行群反馈问题，不行就是接口不支持，解决不了，除非有新接口。

## 问题反馈

使用有 bug 或者体验问题可以在 issues 反馈：https://github.com/giscafer/leek-fund/issues

## 交流群

[插件（养 🐥）微信交流群](https://github.com/giscafer/leek-fund/issues/19)
