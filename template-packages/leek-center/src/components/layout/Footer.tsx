import { Layout, Space, Divider, Button } from 'antd';
import { postMessage } from '@/utils/common';
const { Footer } = Layout;

export default function LFooter() {
  return (
    <Footer style={{ lineHeight: '32px' }}>
      <Space
        style={{ float: 'right' }}
        align="end"
        split={<Divider type="vertical" />}
      >
        <Button
          href="https://support.qq.com/products/302926"
          target="_blank"
          type="link"
        >
          🌐 韭菜盒子社区
        </Button>
        <Button
          onClick={() => {
            postMessage('executeCommand', 'leek-fund.viewFundFlow');
          }}
          type="link"
        >
          🏦 资金流向
        </Button>
      </Space>
    </Footer>
  );
}
