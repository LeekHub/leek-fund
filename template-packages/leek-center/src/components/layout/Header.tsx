import { Layout, Space, Divider, Button, Menu } from 'antd';
import Styles from './Header.module.less';
import { postMessage } from '@/utils/common';
import { useHistory } from 'react-router-dom';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useEffect, useState } from 'react';
const { Header } = Layout;
const { SubMenu } = Menu;

export default function LHeader() {
  let history = useHistory();

  const [defaultSelectedKeys, setDefaultSelectedKeys] = useState('');
  useEffect(() => {
    const currentRootPathname = history.location.pathname.split('/')[1];
    setDefaultSelectedKeys('/' + currentRootPathname);
  }, [history.location.pathname]);

  function handleClick(e: MenuInfo) {
    history.push(e.key.toString());
  }

  return (
    <Header className={Styles.header}>
      <div className={Styles.logo}>韭菜中心</div>
      <Menu
        onClick={handleClick}
        theme="dark"
        mode="horizontal"
        selectedKeys={[defaultSelectedKeys]}
      >
        <Menu.Item key="/my-stocks">自选中心</Menu.Item>
        <Menu.Item key="/data-center">数据中心</Menu.Item>
        <SubMenu key="3" title="工具">
          <Menu.Item key="3">我的预警</Menu.Item>
        </SubMenu>
      </Menu>
    </Header>
  );
}
