import { LeekTreeItem } from '@/../types/shim-background';
import { Layout, Card, Row, Col } from 'antd';
import FundInfoHeader from './info-header';
import { useFetchFundMoreInfo } from './services';
import { classes } from '@/utils/ui';
import '../stock-info-panel/index.less';
import './index.less';

const { Content, Sider } = Layout;

/**
 * 持仓
 * @param fundMoreData
 * @returns
 */
function renderPositionStocksCard(fundMoreData: FundMoreDataType | undefined) {
  const positionStocksKeys = Object.keys(fundMoreData?.positionStocks ?? {});
  if (positionStocksKeys.length)
    return (
      <Card title="前十持仓">
        {positionStocksKeys.map((stockName) => (
          <div key={stockName} className="position-stocks">
            {stockName}
            <span className="percent">
              {fundMoreData?.positionStocks?.[stockName]}
            </span>
          </div>
        ))}
        <div className="small">
          最后更新：{fundMoreData?.positionStocksDate}
        </div>
      </Card>
    );
}

/**
 * 基本信息
 * @param fundMoreData
 */
function renderFundBaseInfoPanel(fundMoreData: FundMoreDataType | undefined) {
  if (fundMoreData) {
    return (
      <Card title="基本信息">
        <div className="info">
          <span className="label">基金类型：</span>
          <span className="value">{fundMoreData.fundType}</span>
        </div>
        <div className="info">
          <span className="label">成立日期：</span>
          <span className="value">{fundMoreData.setupDate}</span>
        </div>
        <div className="info">
          <span className="label">基金经理：</span>
          <span className="value">{fundMoreData.fundManager}</span>
        </div>
        <div className="info">
          <span className="label">基金规模：</span>
          <span className="value">{fundMoreData.fundMoneySize}</span>
        </div>
      </Card>
    );
  }
}

/**
 * 同类基金排行
 * @param fundMoreData
 */
function renderSameKindFundRank(fundMoreData: FundMoreDataType | undefined) {
  if (fundMoreData && fundMoreData.sameKindOtherFund?.length) {
    return (
      <Card title="同类基金排行（天天基金网）">
        <Row style={{ marginBottom: -12 }} gutter={[24, 24]}>
          {fundMoreData.sameKindOtherFund.map((fund) => (
            <Col key={fund.code} span={8}>
              <div className="fund-rank-item">
                <div className="fund-info">
                  <div className="fund-name">{fund.fundName}</div>
                  <div className="fund-code">{fund.code}</div>
                </div>
                <div className="fund-rate">
                  <div className="date">{fund.date}</div>
                  <div
                    className={classes(
                      'rate',
                      parseFloat(fund.rate) > 0 ? 'red' : 'green'
                    )}
                  >
                    {fund.rate}
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    );
  }
}

export default function FundInfoPanel({ fund }: { fund: LeekTreeItem }) {
  const fundMoreData = useFetchFundMoreInfo(fund.info);
  return (
    <div className="stock-info-panel">
      <FundInfoHeader
        fundInfoMoreData={fundMoreData}
        fund={fund}
      ></FundInfoHeader>
      <Layout style={{ marginTop: 10 }}>
        <Content style={{ marginRight: 10 }}>
          {renderFundBaseInfoPanel(fundMoreData)}
          {renderSameKindFundRank(fundMoreData)}
        </Content>
        <Sider style={{ background: 'none' }}>
          {renderPositionStocksCard(fundMoreData)}
        </Sider>
      </Layout>
    </div>
  );
}
