import { Layout, Menu } from 'antd';
import { ReactElement } from 'react';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import NxfxbPage from './nxfxb';
import LonghubangPage from './longhubang';
import DazhongPage from './dazhong';
import rongziPage from './rongzi';
import gaoguanPage from './gaoguan';
import xinguPage from './xingu';
import xinguriliPage from './xingurili';
import zengfaPage from './zengfa';
import peiguPage from './peigu';
import reportPage from './report';
import economyPage from './economy';
import OtherPage from './other';
const { Content, Sider } = Layout;

export default function DataCenter({ children }: { children: ReactElement }) {
  return (
    <Layout>
      <Sider
        style={{
          overflow: 'auto',
          height: 'calc(100vh - 86px)',
          position: 'fixed',
          left: 0,
        }}
      >
        <Menu
          theme="dark"
          style={{
            height: 'calc(100vh - 86px)',
          }}
        >
          <Menu.Item key="nxfxb1">
            <Link to="/data-center/nxfxb">牛熊风向标</Link>
          </Menu.Item>
          <Menu.Item key="longhubang">
            <Link to="/data-center/longhubang">龙虎榜数据全览</Link>
          </Menu.Item>
          <Menu.Item key="dazhong">
            <Link to="/data-center/dazhong">大宗交易</Link>
          </Menu.Item>
          <Menu.Item key="rongzi">
            <Link to="/data-center/rongzi">融资融券</Link>
          </Menu.Item>
          <Menu.Item key="gaoguan">
            <Link to="/data-center/gaoguan">高管持股</Link>
          </Menu.Item>

          <Menu.SubMenu title="新股数据">
            <Menu.Item key="xingu">
              <Link to="/data-center/xingu">新股申购</Link>
            </Menu.Item>
            <Menu.Item key="xingurili">
              <Link to="/data-center/xingurili">新股日历</Link>
            </Menu.Item>
            <Menu.Item key="zengfa">
              <Link to="/data-center/zengfa">增发</Link>
            </Menu.Item>
            <Menu.Item key="peigu">
              <Link to="/data-center/peigu">配股</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="report">
            <Link to="/data-center/report">研报中心</Link>
          </Menu.Item>
          <Menu.Item key="economy">
            <Link to="/data-center/economy">宏观数据</Link>
          </Menu.Item>
          <Menu.Item key="other">
            <Link to="/data-center/other">欢迎PR</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Content
        id="flashNewsContent"
        style={{
          height: 'calc(100vh - 86px)',
          position: 'fixed',
          left: 220,
          width: 'calc(100vw - 220px)',
          overflowY: 'auto',
        }}
      >
        <Switch>
          <Route
            exact
            path="/data-center/nxfxb"
            component={NxfxbPage}
          />
          <Route
            exact
            path="/data-center/longhubang"
            component={LonghubangPage}
          />
          <Route exact path="/data-center/dazhong" component={DazhongPage} />
          <Route exact path="/data-center/rongzi" component={rongziPage} />
          <Route exact path="/data-center/gaoguan" component={gaoguanPage} />
          <Route exact path="/data-center/xingu" component={xinguPage} />
          <Route
            exact
            path="/data-center/xingurili"
            component={xinguriliPage}
          />
          <Route exact path="/data-center/zengfa" component={zengfaPage} />
          <Route exact path="/data-center/peigu" component={peiguPage} />
          <Route exact path="/data-center/report" component={reportPage} />
          <Route exact path="/data-center/economy" component={economyPage} />
          <Route exact path="/data-center/other" component={OtherPage} />
          <Redirect from="/data-center" to="/data-center/nxfxb"></Redirect>
        </Switch>
      </Content>
    </Layout>
  );
}
