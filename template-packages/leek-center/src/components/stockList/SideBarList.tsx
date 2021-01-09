import { Collapse } from 'antd';
import { useObserver } from 'mobx-react';
import state from '@/stores/index';
import styles from './SideBarList.module.less';
import { LeekTreeItem } from '@/../types/shim-background';

import Item from './SidebarItem';

const { Panel } = Collapse;

function StockList({
  state,
  stateKey,
  emptyText,
  onClick,
  currentStock,
}: {
  state: any;
  stateKey: string;
  emptyText: string;
  onClick?: (stockInfo: LeekTreeItem) => void;
  currentStock: undefined | LeekTreeItem;
}) {
  return useObserver(() => {
    if (state[stateKey].length) {
      return (
        <>
          {state[stateKey].map((stock: LeekTreeItem) => (
            <Item
              selected={
                !!(currentStock && currentStock.info.code === stock.info.code)
              }
              onClick={() => {
                onClick && onClick(stock);
              }}
              stock={stock}
              key={`${stateKey}_${stock.info.code}`}
            ></Item>
          ))}
        </>
      );
    } else {
      return <div className="empty">{emptyText}</div>;
    }
  });
}

export default function SideBarist({
  currentStock,
  onClick,
}: {
  currentStock: undefined | LeekTreeItem;
  onClick?: (stockInfo: LeekTreeItem) => void;
}) {
  return (
    <>
      <Collapse
        defaultActiveKey={['fund', 'stock']}
        className={styles['stock-list']}
      >
        <Panel header="基金" key="fund">
          <StockList
            currentStock={currentStock}
            state={state.fund}
            stateKey="funds"
            emptyText="请先添加基金数据"
            onClick={onClick}
          ></StockList>
        </Panel>
        <Panel header="股票" key="stock">
          <StockList
            currentStock={currentStock}
            state={state.stock}
            stateKey="stocks"
            emptyText="请先添加个股数据"
            onClick={onClick}
          ></StockList>
        </Panel>
      </Collapse>
    </>
  );
}
