# leek-fund

VSCode 插件，在编码的时候随时关注实时股票&基金数据。因接口原因基金数据延迟 `2 分钟` 左右，股票数据是实时

**投资其实就是一次心态修炼，稳住心态长期投资都会有收益的！！**

安装插件：[VisualStudio | Marketplace](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)，
VSCode 最低版本要求：`v1.40.0+`

功能主要有：

- 基金涨跌查看，可自定义配置基金代码，支持查看基金历史净值详情
- 股票涨跌查看，可自定义配置股票代码，支持查看股票实时 K 线图
- 左侧菜单面板
- 底部状态 bar
- 自动刷新（每天 9~15 点之间轮询刷新数据）
- 手动刷新
- 支持升序/降序排序
- 支持 GUI 操作新增&删除 基金 和 股票
- 基金排行榜
- 持续更新……（欢迎 PR 和 Star >>> [Github 源码](https://github.com/giscafer/leek-fund)）

## 界面截图

- [VSCode 插件开发——韭菜基金（图片如果展示不了可以看知乎的文章界面功能截图）](https://zhuanlan.zhihu.com/p/166683895)

<!-- https://raw.staticdn.net/ 为GitHub raw 加速地址 -->

##### 新增

![GUI新增操作](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/add.png)

##### 删除

![GUI删除操作](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/delete.png)

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

```

## 感谢 PR

- [zomixi](https://github.com/zomixi)

## Github

https://github.com/giscafer/leek-fund

## License

MIT
