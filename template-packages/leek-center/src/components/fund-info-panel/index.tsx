import { LeekTreeItem } from '@/../types/shim-background';
import { Layout, Card, Row, Col, Spin, Table } from 'antd';
import { StarFilled } from '@ant-design/icons';
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
function renderPositionStocksCard(fundMoreData: FundData) {
  if (!fundMoreData.baseData) {
    return null;
  }
  const { baseData } = fundMoreData;
  const positionStocksKeys = Object.keys(baseData?.positionStocks ?? {});
  if (positionStocksKeys.length) {
    return (
      <Card title="前十持仓">
        {positionStocksKeys.map((stockName) => (
          <div key={stockName} className="position-stocks">
            {stockName}
            <span className="percent">
              {baseData?.positionStocks?.[stockName]}
            </span>
          </div>
        ))}
        <div className="small">最后更新：{baseData?.positionStocksDate}</div>
      </Card>
    );
  }
  return (
    <Card title="前十持仓">
      <div className="empty">暂无数据，可能未公布</div>
    </Card>
  );
}

/**
 * 基本信息
 * @param fundMoreData
 */
function renderFundBaseInfoPanel(fundMoreData: FundData) {
  if (fundMoreData.baseData) {
    const { baseData } = fundMoreData;
    return (
      <Card title="基本信息">
        <div className="info">
          <span className="label">基金类型：</span>
          <span className="value">{baseData.fundType}</span>
        </div>
        <div className="info">
          <span className="label">成立日期：</span>
          <span className="value">{baseData.setupDate}</span>
        </div>
        <div className="info">
          <span className="label">基金经理：</span>
          <span className="value">{baseData.fundManager}</span>
        </div>
        <div className="info">
          <span className="label">基金规模：</span>
          <span className="value">{baseData.fundMoneySize}</span>
        </div>
        <div className="info">
          <span className="label">综合评级：</span>
          <span className="value">
            {baseData.jjpj
              ? new Array(baseData.jjpj).fill(1).map((_, index) => (
                  <StarFilled key={index}></StarFilled>
                ))
              : '--'}
          </span>
        </div>
      </Card>
    );
  }
  return null;
}

/**
 * 机构评级
 * @param fundData
 * @returns
 */
function renderPJDatasPanel(fundData: FundData) {
  function starRender(star: string | number) {
    if (!star) return '--';
    star = parseInt(star.toString());
    if (Number.isNaN(star)) return '--';
    return (
      <>
        {Array(star)
          .fill(1)
          .map((_, index) => (
            <StarFilled key={index} />
          ))}
      </>
    );
  }
  if (!fundData.PJDatas?.length) return null;
  return (
    <Card title="机构评级">
      <Table
        size="small"
        rowKey="RDATE"
        dataSource={fundData.PJDatas}
        pagination={false}
        columns={[
          {
            align: 'center',
            title: '招商评级',
            dataIndex: 'ZSPJ',
            key: 'ZSPJ',
            render: starRender,
          },
          {
            align: 'center',
            title: '济安金信评级',
            dataIndex: 'JAPJ',
            key: 'JAPJ',
            render: starRender,
          },
          {
            align: 'center',
            title: '上海证券评级',
            dataIndex: 'SZPJ3',
            key: 'SZPJ3',
            render: starRender,
          },
          {
            align: 'right',
            title: '时间',
            dataIndex: 'RDATE',
            key: 'RDATE',
          },
        ]}
      />
    </Card>
  );
}

/**
 * 同类基金排行
 * @param fundMoreData
 */
function renderSameKindFundRank(fundMoreData: FundData) {
  const { baseData } = fundMoreData;
  if (baseData && baseData.sameKindOtherFund?.length) {
    return (
      <Card title="同类基金排行（天天基金网）">
        <Row style={{ marginBottom: -12 }} gutter={[24, 24]}>
          {baseData.sameKindOtherFund.map((fund) => (
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
  return null;
}

export default function FundInfoPanel({ fund }: { fund: LeekTreeItem }) {
  const { fundMoreData, loading } = useFetchFundMoreInfo(fund.info);
  return (
    <div className="stock-info-panel">
      <FundInfoHeader
        fundInfoMoreData={fundMoreData}
        fund={fund}
      ></FundInfoHeader>{' '}
      <Spin spinning={loading} delay={200} tip="loading">
        <Layout style={{ marginTop: 10 }}>
          <Content style={{ marginRight: 10 }}>
            {renderFundBaseInfoPanel(fundMoreData)}
            {renderPJDatasPanel(fundMoreData)}
            {renderSameKindFundRank(fundMoreData)}
          </Content>
          <Sider style={{ background: 'none' }}>
            {renderPositionStocksCard(fundMoreData)}
          </Sider>
        </Layout>
      </Spin>
    </div>
  );
}
