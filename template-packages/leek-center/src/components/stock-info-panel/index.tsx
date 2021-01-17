import { LeekTreeItem } from '@/../types/shim-background';
import { Layout, Card, Tooltip, Spin } from 'antd';
import StockInfoHeader from './info-header';
import StockRemind from '../stock-remind';
import { formatNumber } from '@/utils/common';

import './index.less';
import { useXinheData } from './services';
import { useHistory } from 'react-router-dom';

const { Content, Sider } = Layout;

/**
 * 机构研报
 * @param xinheData
 * @returns
 */
function renderOrganizationReports(xinheData: StockXinHeDataType) {
  if (
    !xinheData.hotData?.organizationReports ||
    !xinheData.hotData?.organizationReports.length
  )
    return null;

  return (
    <Card title="机构研报(最近一个月）">
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            {xinheData.hotData.organizationReports[0].map((r) => {
              return (
                <th
                  key={r.title}
                  dangerouslySetInnerHTML={{ __html: r.title }}
                ></th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {xinheData.hotData.organizationReports.map((or, index) => (
            <tr key={index}>
              {or.map((r) => (
                <td key={r.title}>
                  {r.key === '研究员姓名' ? (
                    <a
                      href={`http://www.iwencai.com/search?typed=1&preParams=tid%3Dinfo%26tr%3D0%26ft%3D1%26st%3D0&ts=1&f=1&qs=result_rewrite&selfsectsn=&querytype=&bgid=&sdate=&edate=&searchfilter=&tid=info&w=&w=${encodeURIComponent(
                        `${r.value}+研究`
                      )}`}
                    >
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** 社区数据 */
function renderCommunityData(xinheData: StockXinHeDataType | undefined) {
  return (
    <Card title="社区热度">
      <p>
        同花顺人气热度：
        {xinheData?.hotData?.hot ? formatNumber(xinheData.hotData?.hot) : '--'}
      </p>
      <p>雪球社区关注量：-- </p>
    </Card>
  );
}

/**
 * 价位水平线
 */
function renderPriceWarningTips(xinheData: StockXinHeDataType | undefined) {
  return (
    <Card title="止盈止损价">
      <p>压力位：{xinheData?.hotData?.ylw ?? '--'}</p>
      <p>支撑位：{xinheData?.hotData?.zcw ?? '--'}</p>
      <p>止盈位：{xinheData?.hotData?.zyw ?? '--'}</p>
      <p>止损位：{xinheData?.hotData?.zsw ?? '--'}</p>
    </Card>
  );
}

function renderNiuxTips(xinheData: StockXinHeDataType) {
  if (!xinheData.niux) return null;
  const { niux } = xinheData;
  return (
    <Card title="同花顺诊股">
      <p className="info">{niux.title}</p>
      <p className="info">
        综合评分：
        <span className={parseInt(niux.score) > 5 ? 'red' : 'green'}>
          {niux.score}
        </span>
      </p>
      <p className="info">
        <span className="label">短线观点：</span>
        <span className="value">{niux.short}</span>
      </p>
      <p className="info">
        <span className="label">中线观点：</span>
        <span className="value">{niux.short}</span>
      </p>
      <p className="info">
        <span className="label">长线观点：</span>
        <span className="value">{niux.long}</span>
      </p>
      <div className="info">
        <span className="label">详细内容：</span>
        <div
          dangerouslySetInnerHTML={{ __html: niux.content }}
          className="value"
        ></div>
      </div>
    </Card>
  );
}

function renderConcept(xinheData: StockXinHeDataType) {
  if (xinheData.concept && xinheData.concept.length) {
    return (
      <Card title="板块概念">
        <div className="info">
          <div>概念：</div>
          <div className="value">
            {xinheData.concept.map((c) => (
              <div
                style={{ marginRight: 10, display: 'inline-block' }}
                key={c.title}
              >
                {c.content ? (
                  <Tooltip title={c.content}>
                    <a href="void(0)">{c.title}</a>
                  </Tooltip>
                ) : (
                  c.title
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }
}

export default function StockInfoPanel({ stock }: { stock: LeekTreeItem }) {
  let history = useHistory();
  console.log('history: ', history);

  const { xinheData, loading } = useXinheData(stock);
  return (
    <div className="stock-info-panel">
      <StockInfoHeader stock={stock}></StockInfoHeader>
      <Spin spinning={loading} delay={200} tip="loading">
        <Layout style={{ marginTop: 10 }}>
          <Content style={{ marginRight: 10 }}>
            {!!xinheData && renderNiuxTips(xinheData)}
            {!!xinheData && renderConcept(xinheData)}
            {!!xinheData && renderOrganizationReports(xinheData)}
          </Content>
          <Sider style={{ background: 'none' }}>
            <StockRemind stock={stock} />
            {renderPriceWarningTips(xinheData)}
            {renderCommunityData(xinheData)}
          </Sider>
        </Layout>
      </Spin>
    </div>
  );
}
