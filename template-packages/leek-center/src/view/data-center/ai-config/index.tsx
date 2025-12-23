import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { postMessage } from '@/utils/common';
import './style.less';

const AIConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load config
    postMessage('getAiConfig');

    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (msg.command === 'aiConfig' && msg.data) {
        form.setFieldsValue({
          apiKey: msg.data.apiKey || '',
          baseUrl: msg.data.baseUrl || '',
          model: msg.data.model || '',
        });
      }
      if (msg.command === 'saveSuccess') {
        message.success('保存成功');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [form]);

  const onFinish = (values: any) => {
    setLoading(true);
    postMessage('updateAiConfig', values);
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <div className="ai-config-page">
      <Card title="AI 配置管理" className="config-card">
        <div className="desc">配置你的大模型访问参数（保存在 VS Code 用户设置中）。</div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入 API Key' }]}
            extra="示例：sk-xxx 或其他厂商密钥"
          >
            <Input.Password placeholder="请输入 API Key" />
          </Form.Item>

          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[{ required: true, message: '请输入 Base URL' }]}
          >
            <Input placeholder="例如：https://api.openai.com/v1 或自建网关地址" />
          </Form.Item>

          <Form.Item
            label="模型"
            name="model"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：gpt-4o-mini 或 deepseek-chat 等" />
          </Form.Item>

          <Form.Item className="actions">
            <Button onClick={onReset} style={{ marginRight: 12 }}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AIConfig;
