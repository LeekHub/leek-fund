## 开发

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

### 基金持仓股票涨跌情况

```
https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&invt=2&fields=f2,f3,f12,f14,f9&secids=0.000661,1.603259,0.300142,0.300122,0.002007,0.300601,1.600201,0.300529,0.300676,1.600867,&_=1599742806408
```

html 数据

```
 http://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=161726&topline=10&year=&month=&rt=0.3585181467435923
```

页面逻辑

```
http://j5.dfcfw.com/js/f10/f10_min_20200220153807.js
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

// 天天基金 app
https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=50&plat=Android&appType=ttjj&product=EFund&Version=1&deviceid=ssdfsdfsdf&Fcodes=320007,161726

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

## 基金接口

标签（空格分隔）： 个人项目

---

#### 数据接口

> 数据来源 蛋卷基金&天天基金

- 获取基金净值

地址:https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo

请求方式:POST

参数列表
| 参数名 | 参数类型 |默认值|
| ------------ | ------------ |--|
| plat | String |Android|
| deviceid | String ||
| product | String |EFund|
| Version | String |6.2.4|
| Fcodes | String |基金编码,多个使用,隔开|
|appType|String|ttjj|

返回值

```json
{
  "Datas": [
    {
      "FCODE": "005919",
      "SHORTNAME": "天弘中证500指数C",
      "PDATE": "2020-04-29",
      "NAV": "0.9214",
      "ACCNAV": "0.9214",
      "NAVCHGRT": "0.01",
      "GSZ": "0.9427",
      "GSZZL": "2.31",
      "GZTIME": "2020-04-30 15:00",
      "NEWPRICE": "--",
      "CHANGERATIO": "--",
      "ZJL": "--",
      "HQDATE": "--",
      "ISHAVEREDPACKET": false
    }
  ],
  "ErrCode": 0,
  "Success": true,
  "ErrMsg": null,
  "Message": null,
  "ErrorCode": "0",
  "ErrorMessage": null,
  "ErrorMsgLst": null,
  "TotalCount": 8,
  "Expansion": {
    "GZTIME": "2020-04-30",
    "FSRQ": "2020-04-29"
  }
}
```

返回值含义
|字段名|含义|
|-|-|
|PDATE|最新的净值日期|
|NAV|最新净值|
|NAVCHGRT|最新的净值涨了多少|
|GSZ|估值|
|GSZZL|估值涨了多少|
|GZTIME|估值的日期|

```
https://fundmobapi.eastmoney.com/FundMNewApi/FundMNFInfo?pageIndex=1&pageSize=11&appType=ttjj&product=EFund&plat=Android&deviceid=9e16077fca2fcr78ep0ltn98&Version=1&Fcodes=161725,320007,001632,161726,001071,007874,004857,420009,377240,002207,004855
```

- 获取基金历史净值

地址:https://fundmobapi.eastmoney.com/FundMNewApi/FundMNHisNetList

请求方式:POST

参数列表
| 参数名 | 参数类型 |默认值|
| ------------ | ------------ |--|
|FCODE|String|基金编码|
|pageSize|int|数据一页多少个|
|deviceid|String|设备 id|
|version|String|版本名|
|pageIndex|int|页码 从 1 开始|
|plat|String|Android|

返回值

```
{
    "Datas": [
        {
            "FSRQ": "2020-04-29",
            "DWJZ": "0.9214",
            "JZZZL": "0.0109",
            "LJJZ": "0.9214",
            "NAVTYPE": "1",
            "RATE": "--",
            "MUI": "--",
            "SYI": "--"
        }
    ],
    "ErrCode": 0,
    "Success": true,
    "ErrMsg": null,
    "Message": null,
    "ErrorCode": "0",
    "ErrorMessage": null,
    "ErrorMsgLst": null,
    "TotalCount": 495,
    "Expansion": null
}
```

|       |          |     |
| ----- | -------- | --- |
| FSRQ  | 净值日期 |
| DWJZ  | 单位净值 |
| LJJZ  | 累计净值 |
| JZZZL | 日增长率 |

- 查询基金基本信息

地址:https://fundmobapi.eastmoney.com/FundMNewApi/FundMNNBasicInformation

请求方式:POST

参数列表:version=6.2.4&plat=Android&appType=ttjj&FCODE=005919&onFundCache=3&keeeeeyparam=FCODE&deviceid=656c09923c567b89bb44801020bc59ab%7C%7Ciemi_tluafed_me&igggggnoreburst=true&product=EFund&MobileKey=656c09923c567b89bb44801020bc59ab%7C%7Ciemi_tluafed_me

https://fundmobapi.eastmoney.com/FundMNewApi/FundMNNBasicInformation?version=6.2.4&plat=Android&appType=ttjj&FCODE=320007&onFundCache=3&keeeeeyparam=FCODE&deviceid=656c09923c567b89bb44801020bc59ab%7C%7Ciemi_tluafed_me&igggggnoreburst=true&product=EFund&MobileKey=656c09923c567b89bb44801020bc59ab%7C%7Ciemi_tluafed_me
