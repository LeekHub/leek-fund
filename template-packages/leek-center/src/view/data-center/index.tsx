import { Layout, Menu } from 'antd';
import { ReactElement } from 'react';
import { Link, Route, Switch, Redirect } from 'react-router-dom';
import NxfxbPage from './nxfxb';
import OtherPage from './other';
import BkhqPage from './bkhq';
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
          <Menu.Item key="nxfxb">
            <Link to="/data-center/nxfxb">牛熊风向标</Link>
          </Menu.Item>
          
          <Menu.SubMenu title="板块行情">
            <Menu.Item key="zrztb">
              <Link to="/data-center/bkhq/bk0815">昨日涨停板</Link>
            </Menu.Item>
            <Menu.Item key="zrlb">
              <Link to="/data-center/bkhq/bk0816">昨日连扳</Link>
            </Menu.Item>
          </Menu.SubMenu>

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
          <Route exact path="/data-center/nxfxb" component={NxfxbPage} />
          <Route exact path="/data-center/bkhq/:bkCode" component={BkhqPage} />
          <Route exact path="/data-center/other" component={OtherPage} />
          <Redirect from="/data-center" to="/data-center/nxfxb"></Redirect>
        </Switch>
      </Content>
    </Layout>
  );
}
