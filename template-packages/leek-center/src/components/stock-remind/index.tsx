import { Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { MinusOutlined } from '@ant-design/icons';

import { LeekTreeItem } from '@/../types/shim-background';
import { useObserver } from 'mobx-react';
import state from '@/stores/index';
import { updownClassName } from '@/utils/common';
import RemindAddModal from './add-modal';
import { useCallback, useState } from 'react';

import './index.less';

function formatRemindLabel(type: string, value: number | string) {
  const symbol = String(value)[0];
  switch (type) {
    case 'price':
      return '股价' + (symbol === '-' ? '下跌' : '上涨') + '到';
    case 'percent':
      return '当日' + (symbol === '-' ? '跌幅' : '涨幅') + '达';
  }
}

/**
 * ITEM
 * @param param0
 * @returns
 */
function StockRemindItem({ value, unit, type, onRemove }: any) {
  return (
    <div className="remind-item">
      <div className="value">
        <span className="label">{formatRemindLabel(type, value)}：</span>
        <span className={updownClassName(value)}>
          {value}
          {unit}
        </span>
      </div>
      <div className="ctrls">
        <Button onClick={onRemove} size="small" type="link">
          <MinusOutlined className="red" />
        </Button>
      </div>
    </div>
  );
}

/**
 * LIST
 * @param param0
 * @returns
 */
function StockRemindList({ stock }: { stock: LeekTreeItem }) {
  const onRemove = useCallback(
    (type: 'percent' | 'price', value) => {
      state.stock.removeStockRemind(stock.info.code, type, value);
    },
    [stock]
  );

  return useObserver(() => {
    let remind = state.stock.stockRemind?.[stock.info.code];
    if (remind && (remind.price.length || remind.percent.length)) {
      return (
        <div className="remind-list">
          {remind.percent.map((p) => (
            <StockRemindItem
              key={`percent_${p}`}
              value={p}
              onRemove={() => {
                onRemove('percent', p);
              }}
              unit="%"
              type="percent"
            />
          ))}
          {remind.price.map((p) => (
            <StockRemindItem
              key={`price_${p}`}
              value={p}
              onRemove={() => {
                onRemove('price', p);
              }}
              unit="元"
              type="price"
            />
          ))}
        </div>
      );
    } else {
      return <div className="empty">-- 未设置 --</div>;
    }
  });
}

/**
 * Panel
 * @param param0
 * @returns
 */
export default function StockRemind({ stock }: { stock: LeekTreeItem }) {
  const [addModalVisible, setAddModalVisible] = useState(false);

  return (
    <>
      <Card
        extra={
          <Button
            onClick={() => {
              setAddModalVisible(true);
            }}
            size="small"
            type="link"
          >
            <PlusOutlined />
          </Button>
        }
        size="small"
        title="价格预警"
      >
        <StockRemindList stock={stock} />
      </Card>
      <RemindAddModal
        stock={stock}
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
        }}
      />
    </>
  );
}
