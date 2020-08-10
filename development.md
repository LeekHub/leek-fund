## 接口说明

> 需要学习开发的可以了解

### 爬取基金基本概况信息

```
http://fund.eastmoney.com/f10/jbgk_001632.html
```

只需要获取基金名称可以走 js，jsonp

```
http://fundgz.1234567.com.cn/js/001632.js?rt=1596338178723
```

### 爬取净值接口

```
// 历史净值
http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=001632&page=1&&sdate=2020-07-31

股票实时数据，比如腾讯股票：
https://hq.sinajs.cn/list=hk00700

// 基金实时数据（有几分钟延迟，插件基金数据使用的是此接口）
// 比如诺安成长混合
http://fundgz.1234567.com.cn/js/320007.js?callback=a

```

### 图片

```
// 走势图片、[沪深拼音]/time/[图片大小]/[股票代码]
http://img1.money.126.net/chart/hs/time/210x140/1399001.png
```

### 基金代码列表

```
http://fund.eastmoney.com/js/fundcode_search.js
```

### 基金排行榜

```
http://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/IO.XSRV2.CallbackList['hLfu5s99aaIUp7D4']/NetValueReturn_Service.NetValueReturnOpen?page=1&num=40&sort=form_year&asc=0&ccode=&type2=0&type3=
```

### 基金走势图

```
// 近期走势
https://image.sinajs.cn/newchart/v5/fund/nav/ss/150206.gif
```

## 开发

```
// 官方插件文档介绍
https://code.visualstudio.com/api/extension-guides/overview

// Python 爬取历史基金数据
https://blog.csdn.net/yuzhucu/article/details/55261024

// 发布流程
https://blog.csdn.net/Suwanqing_su/article/details/105947156

// 开发系列博文
http://blog.haoji.me/vscode-plugin-overview.html

```
