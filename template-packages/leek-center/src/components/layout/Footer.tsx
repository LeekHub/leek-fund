import { Layout, Space, Divider, Button, Switch } from 'antd';
import { postMessage } from '@/utils/common';
const { Footer } = Layout;

export default function LFooter() {
  return (
    <Footer style={{ lineHeight: '32px' }}>
      <Space>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          老板模式：
          <Switch
            onChange={(checked) => {
              document.body.classList[checked ? 'add' : 'remove']('mode-moyu');
            }}
            size="small"
          />
        </div>
      </Space>
      <Space
        style={{ float: 'right' }}
        align="end"
        split={<Divider type="vertical" />}
      >
        {/*   <Button
          onClick={() => {
            postMessage('executeCommand', 'leek-fund.tucaoForum');
          }}
          type="link"
        >
          韭菜盒子社区
        </Button> */}
        <Button
          onClick={() => {
            postMessage('executeCommand', 'leek-fund.viewFundFlow');
          }}
          type="link"
        >
          北向资金流向
        </Button>
        <Button
          onClick={() => {
            postMessage('executeCommand', 'leek-fund.viewMainFundFlow');
          }}
          type="link"
        >
          主力资金流向
        </Button>
      </Space>
    </Footer>
  );
}
