import { MouseEventHandler } from 'react';

import { updownClassName } from '@/utils/common';

export default function Item({
  stock,
  onClick,
  selected = false,
}: {
  selected: boolean;
  stock: any;
  onClick?: MouseEventHandler;
}) {
  return (
    <div
      onClick={onClick}
      className={['stock-item', selected ? 'selected' : ''].join(' ')}
    >
      <span className="label">
        {stock.info.name}
        <p className="code">{stock.info.code}</p>
      </span>
      <span
        className={['price', updownClassName(Number(stock.info.percent))].join(
          ' '
        )}
      >
        {stock.info.price}
        <p className="percent">{stock.info.percent}%</p>
      </span>
    </div>
  );
}
