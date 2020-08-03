const vscode = require('vscode');
const path = require('path');
const { TreeItem, TreeItemCollapsibleState } = require('vscode');

class DataProvider {
  constructor(context) {
    this.data = [];
    this.context = context;
    this.onDidChangeTreeData = undefined;
  }

  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
  /* setItem(textList) {
    const temp = [];
    for (let item of textList) {
      temp.push(new DataItem(item));
    }
    this.data = temp;
  } */
  setItem(textList) {
    const temp = [];
    for (let item of textList) {
      const treeItem = new vscode.TreeItem(
        item.text,
        vscode.TreeItemCollapsibleState.None
      );
      treeItem.iconPath = this.context.asAbsolutePath(
        path.join('images', `${item.grow ? 'up-arrow' : 'down-arrow'}.svg`)
      );
      // 点击事件
      treeItem.command = {
        title: item.name, // 标题
        command: item.isStock
          ? 'extension.leetfund.stockItemClick'
          : 'extension.leetfund.fundItemClick', // 命令 ID
        // tooltip: item.text, // 鼠标覆盖时的小小提示框
        arguments: [
          // 向 registerCommand 传递的参数。
          item.code, // 基金/股票编码
          item.name, // 基金/股票名称
          item.text,
        ],
      };
      temp.push(treeItem);
    }
    // @ts-ignore
    this.data = temp;
  }
}

class DataItem extends TreeItem {
  constructor(label, children) {
    super(
      label,
      children === undefined
        ? TreeItemCollapsibleState.None
        : TreeItemCollapsibleState.Collapsed
    );
    this.children = children;
  }
}

module.exports = {
  DataProvider,
};
