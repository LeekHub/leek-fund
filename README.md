# leek-fund

VScode 插件，随时关注 上证指数和实时基金数据。

**投资其实就是一次心态修炼，稳住心态长期投资都会有收益的！！**

## Screenshot

鼠标悬浮查看上证指数和基金 Tooltip 详情：
![demo1.png](https://ww1.sinaimg.cn/large/940e68eegy1ghches4ozkj20xq0ryk3f.jpg)

## 插件配置说明

修改用户配置，添加你所需要监控的股票代码

```
  // 配置需要监控的基金代码

  "leek-fund.stocks": [
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

  // 配置轮询请求最新数据的时间间隔
  "leek-fund.updateInterval": 10000


  // 配置股票涨的颜色，默认为white。为什么不是red，红色像是报错，很刺眼。
  "leek-fund.riseColor": "white"


  // 配置股票跌的颜色，默认为green
  "leek-fund.fallColor": "black"

  // 配置展示的时间段，默认为[9, 15]，每十分钟判断一下
  "leek-fund.showTime": [9, 15]


```

## 接口说明

> 需要学习开发的可以了解

爬取基金基本概况信息

```
http://fund.eastmoney.com/f10/jbgk_001632.html
```

只需要获取基金名称可以走 js，jsonp

```
http://fundgz.1234567.com.cn/js/001632.js?rt=1596338178723
```

爬取净值接口

```
http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=001632&page=1&&sdate=2020-07-31

或网易的api
https://api.money.126.net/data/feed/420009?callback=a

上证指数：
https://api.money.126.net/data/feed/0000001?callback=a

```

基金代码列表

```
http://fund.eastmoney.com/js/fundcode_search.js
```

参考文章：

```
// 官方插件文档介绍
https://code.visualstudio.com/api/extension-guides/overview

// python 爬取基金数据
https://blog.csdn.net/yuzhucu/article/details/55261024

// 发布流程
https://blog.csdn.net/Suwanqing_su/article/details/105947156
```

## Github

源码: https://github.com/giscafer/leek-fund 欢迎 PR、Star
