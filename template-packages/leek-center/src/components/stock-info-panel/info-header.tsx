import { LeekTreeItem } from '@/../types/shim-background';
import { Space } from 'antd';
import { updownClassName } from '@/utils/common';
import { classes } from '@/utils/ui';

export default function StockInfoHeader({ stock }: { stock: LeekTreeItem }) {
  const { info } = stock;
  return (
    <div className="stock-info-header">
      <div className="stock-info-header__hd">
        <div className="stock-info-name">{info.name}</div>
        <div className="stock-info-code">{info.symbol}</div>
        <Space style={{ marginLeft: 20 }}>
          {/* <Button size="small">价格预警</Button> */}
        </Space>
      </div>
      <div className="stock-info-header__bd">
        <div className="update-time">更新时间：{info.time}</div>
        <div
          className={['stock-info-price', updownClassName(info.percent)].join(
            ' '
          )}
        >
          <div key={info.time + '#' + info.price} className="current">{info.price}</div>
          <div className="other-price-info">
            <p>{info.updown}</p>
            <p>{info.percent}%</p>
          </div>
        </div>
        <div className="stock-info-base-info">
          <table className="stock-info-base-info-table">
            <tbody>
              <tr>
                <td>今开：</td>
                <td
                  className={classes(
                    'val',
                    info &&
                      (Number(info.open) > Number(info.yestclose)
                        ? 'red'
                        : 'green')
                  )}
                >
                  {info.open}
                </td>
                <td>最高：</td>
                <td
                  className={classes(
                    'val',
                    info &&
                      (Number(info.high) > Number(info.yestclose)
                        ? 'red'
                        : 'green')
                  )}
                >
                  {info.high}
                </td>
                <td>成交量：</td>
                <td className="val">{info.volume}手</td>
              </tr>
              <tr>
                <td>昨收：</td>
                <td className="val">{info.yestclose}</td>
                <td>最低：</td>
                <td
                  className={classes(
                    'val',
                    info &&
                      (Number(info.low) > Number(info.yestclose)
                        ? 'red'
                        : 'green')
                  )}
                >
                  {info.low}
                </td>
                <td>成交额：</td>
                <td className="val">{info.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
