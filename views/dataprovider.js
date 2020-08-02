const vscode = require('vscode');
const path = require('path');
const { TreeItem, TreeItemCollapsibleState } = require('vscode');

class DataProvider {
  constructor(context) {
    this.data = [new DataItem('暂无数据')];
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
