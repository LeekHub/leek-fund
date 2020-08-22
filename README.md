<div align="center">
<img src="https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/leek-logo.png" alt="韭菜盒子" width="256"/>

# leek-fund（韭菜盒子）

**韭菜盒子**——VSCode 里也可以看股票 & 基金实时数据，做最好用的养基插件。

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/giscafer.leek-fund.svg?label=Marketplace&style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/giscafer.leek-fund.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/giscafer.leek-fund.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)

</div>

## Table of contents

- [功能特性](#功能特性)
- [安装使用](#安装使用)
- [插件介绍](#插件介绍)
- [插件配置说明](#插件配置说明)
- [交流群](#交流群)
- [Todo List](#todo-list)
- [感谢 PR](#感谢-pr)
- [Changelog](#changelog)
- [Github](#github)
- [License](#license)

> 投资其实就是一次心态修炼，稳住心态长期投资都会有收益的！！

## 功能特性

本插件具有以下特点：

- 基金涨跌（因接口原因基金数据延迟 `2 分钟` 左右）
- 股票涨跌，支持 A 股、港股、美股（实时数据）
- 左侧菜单面板
- 底部状态栏信息
- 手动刷新
- 自动刷新（每天 9~15 点之间轮询刷新数据）
- 支持升序/降序排序
- 基金实时走势图和历史走势图
- 基金排行榜
- 基金持仓信息
- 股市资金流向（沪深港通资金流向、北向资金、南向资金）
- 支持 GUI 操作新增&删除 基金 和 股票
- 通过 GUI 添加基金和股票时，支持模糊搜索匹配
- 支持 GUI 设置涨跌颜色、状态栏股票自定义等
- 持续更新……（欢迎 PR 和 Star >>> [Github 源码](https://github.com/giscafer/leek-fund)）

## 安装使用

安装插件：[VisualStudio | Marketplace](https://marketplace.visualstudio.com/items?itemName=giscafer.leek-fund)，VSCode 最低版本要求：`v1.40.0+`

## 插件介绍

- [韭菜盒子使用文档](https://github.com/giscafer/leek-fund/issues/23)
- [VSCode 插件开发——韭菜盒子（图片如果展示不了可以看知乎的文章界面功能截图）](https://zhuanlan.zhihu.com/p/166683895)

<!-- https://raw.staticdn.net/ 为GitHub raw 加速地址 -->

![概览](https://raw.staticdn.net/giscafer/leek-fund/master/screenshot/overview.png)

## 插件配置说明

**添加/删除股票或基金时，建议使用新增按钮模糊搜索添加（支持名称和编码搜索）**，详细可查看 [韭菜盒子使用文档](https://github.com/giscafer/leek-fund/issues/23)

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

## 交流群

[插件（养 🐥）微信交流群](https://github.com/giscafer/leek-fund/issues/19)

## Todo List

- [版本迭代需求池（想法）](https://github.com/giscafer/leek-fund/projects)

## 感谢 PR

- [zomixi](https://github.com/zomixi)
- [httpcheck](https://github.com/httpcheck)
- [JayHuangTnT](https://github.com/JayHuangTnT) （:heart: Logo Designer）
- [yiliang114](https://github.com/yiliang114)
- [SubinY](https://github.com/SubinY)
- [gordongxm](https://github.com/gordongxm)
- [chen86860](https://github.com/chen86860)

更多贡献者 [contributors](https://github.com/giscafer/leek-fund/graphs/contributors)

## Changelog

[CHANGELOG](./CHANGELOG.md)

## Github

https://github.com/giscafer/leek-fund

## License

[LICENSE](./LICENSE)
