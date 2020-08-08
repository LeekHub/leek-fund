# leek-fund

VSCode 插件，在编码的时候随时关注实时股票&基金数据。**因接口原因基金数据延迟 2 分钟左右，股票数据是实时**

**投资其实就是一次心态修炼，稳住心态长期投资都会有收益的！！**

安装插件：[VisualStudio | Marketplace](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)

功能主要有：

- 基金涨跌查看，可自定义配置基金代码，支持查看基金历史净值详情
- 股票涨跌查看，可自定义配置股票代码，支持查看股票实时 K 线图
- 左侧菜单面板
- 底部状态 bar
- 支持 GUI 操作新增&删除基金
- 每天 9~15 点之间轮询刷新数据（刷新频率最低 3 秒，可配置）
- 持续更新……（欢迎 PR）

## 截图

鼠标悬浮查看股票和基金实时数据截图：

![界面截图 1](https://ww1.sinaimg.cn/large/940e68eegy1ghcoqirahuj214w1pke73.jpg)
![基金历史净值](https://raw.githubusercontent.com/giscafer/leek-fund/master/screenshot/fund-history-detail.png)

- [VSCode 插件开发——韭菜基金（查看更多界面功能截图）](https://zhuanlan.zhihu.com/p/166683895)

## 插件配置说明

手动修改用户配置，添加你所需要监控的股票代码

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
  // (支持 GUI 操作新增&删除基金，也不一定需要这里手动配置)
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

  // 配置轮询请求最新数据的时间间隔 （单位毫秒ms）
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
