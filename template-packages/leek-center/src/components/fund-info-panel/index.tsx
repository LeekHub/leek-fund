import { LeekTreeItem } from '@/../types/shim-background';
import { Layout, Card, Row, Col, Spin, Table, Descriptions } from 'antd';
import { StarFilled } from '@ant-design/icons';
import FundInfoHeader from './info-header';
import { useFetchFundMoreInfo } from './services';
import { calcRGColorStyleValue, classes } from '@/utils/ui';
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
    const DItem = Descriptions.Item;
    return (
      <Card title="基本信息">
        <Descriptions style={{ marginTop: 10, marginBottom: -10 }}>
          <DItem label="基金类型">{baseData.fundType}</DItem>
          <DItem label="成立日期">{baseData.setupDate}</DItem>
          <DItem label="基金经理">{baseData.fundManager}</DItem>
          <DItem contentStyle={{ alignItems: 'center' }} label="综合评级">
            {baseData.jjpj
              ? new Array(baseData.jjpj)
                  .fill(1)
                  .map((_, index) => <StarFilled key={index}></StarFilled>)
              : '--'}
          </DItem>
          <DItem label="基金规模" span={2}>
            {baseData.fundMoneySize}
          </DItem>
        </Descriptions>
      </Card>
    );
  }
  return null;
}

/**
 * 盈利概率
 * @param fundMoreData
 * @returns
 */
const renderMNCSDiagData = (fundMoreData: FundData) => {
  const { mncsdiag } = fundMoreData;
  if (!mncsdiag) return null;
  const DItem = Descriptions.Item;
  return (
    <Card title="基金盈利概率">
      <Descriptions style={{ marginTop: 10, marginBottom: -10 }}>
        <DItem label="综合评分">{mncsdiag.DIAGONSEACH.PROWIN}</DItem>
        <DItem label="基金评分">{mncsdiag.DIAGONSEACH.FGOLD}</DItem>
        <DItem
          label="持有7天盈利概率"
          contentStyle={{
            color: calcRGColorStyleValue(mncsdiag.PROFIT_Z, 20),
          }}
        >
          {mncsdiag.PROFIT_Z}%
        </DItem>
        <DItem
          label="持有3月盈利概率"
          contentStyle={{
            color: calcRGColorStyleValue(mncsdiag.PROFIT_3Y, 50),
          }}
        >
          {mncsdiag.PROFIT_Z}%
        </DItem>
        <DItem
          label="持有6月盈利概率"
          contentStyle={{
            color: calcRGColorStyleValue(mncsdiag.PROFIT_3Y, 70),
          }}
        >
          {mncsdiag.PROFIT_3Y}%
        </DItem>
        <DItem
          label="持有1年盈利概率"
          contentStyle={{
            color: calcRGColorStyleValue(mncsdiag.PROFIT_1N, 90),
          }}
        >
          {mncsdiag.PROFIT_1N}%
        </DItem>
      </Descriptions>
    </Card>
  );
};

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
            {renderMNCSDiagData(fundMoreData)}
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
