import { LeekTreeItem } from '@/../types/shim-background';
import { Space, Button } from 'antd';
import { updownClassName, postMessage } from '@/utils/common';
import { classes } from '@/utils/ui';
import { Fragment } from 'react';

const FundMoreDataKeyMapLabel: Record<string, string> = {
  latest1m: '近1个月',
  latest3m: '近3个月',
  latest6m: '近半年',
  latest12m: '近1年',
  latest36m: '近3年',
  sinceToday: '成立以来',
};

export default function StockInfoHeader({
  fund,
  fundInfoMoreData,
}: {
  fund: LeekTreeItem;
  fundInfoMoreData: FundData;
}) {
  console.log('fundInfoMoreData: ', fundInfoMoreData);
  const { info } = fund;

  return (
    <div className="stock-info-header">
      <div className="stock-info-header__hd">
        <div className="stock-info-name">{info.name}</div>
        <div className="stock-info-code">{info.code}</div>
        <Space style={{ marginLeft: 20 }}>
          <Button
            onClick={() => {
              postMessage('executeCommand', 'leek-fund.setFundAmount');
            }}
            size="small"
          >
            设置持仓
          </Button>
        </Space>
      </div>
      <div className="stock-info-header__bd">
        <div className="fund-info-price">
          <div className="fund-update-time">估算净值：{info.time}</div>
          <div
            className={classes(
              'stock-info-price',
              updownClassName(info.percent)
            )}
          >
            <div key={info.time + '#' + info.price} className="current">
              {info.price}
            </div>
            <div className="other-price-info">
              <p>{info.updown}</p>
              <p>{info.percent}%</p>
            </div>
          </div>
        </div>
        <div className="fund-info-price">
          <div className="fund-update-time">最新净值：{info.yestPriceDate}</div>
          <div
            className={classes(
              'stock-info-price',
              updownClassName(Number(info.yestpercent || '0'))
            )}
          >
            <div className="current">{info.yestclose}</div>
            <div className="other-price-info">
              <p>{info.updown}</p>
              {/* <p>{info.yestpercent}%</p> */}
            </div>
          </div>
        </div>

        <div className="stock-info-base-info">
          {!!fundInfoMoreData.baseData && (
            <table className="stock-info-base-info-table">
              <tbody>
                {([
                  ['latest1m', 'latest3m', 'latest6m'],
                  ['latest12m', 'latest36m', 'sinceToday'],
                ] as (keyof FundBaseData)[][]).map((keyArr, index) => (
                  <tr key={'tr_' + index}>
                    {keyArr.map((key) => (
                      <Fragment key={'label_' + (key as string)}>
                        <td>{FundMoreDataKeyMapLabel[key as string]}：</td>
                        <td
                          className={classes(
                            'val',
                            info &&
                              (parseFloat(
                                fundInfoMoreData.baseData![key]?.toString() ??
                                  '0'
                              ) > 0
                                ? 'red'
                                : 'green')
                          )}
                        >
                          {fundInfoMoreData.baseData![key]}
                        </td>
                      </Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
