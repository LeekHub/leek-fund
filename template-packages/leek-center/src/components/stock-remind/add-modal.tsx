import { LeekTreeItem } from '@/../types/shim-background';
import { Modal, Form, Input, message } from 'antd';
import { useCallback, useEffect } from 'react';
import state from '@/stores';

function checkInputValue(v: string) {
  return /^[0-9]+(.[0-9]{1,3})?%?$/.test(v);
}

export default function RemindAddModal({
  visible = false,
  stock,
  onClose = () => {},
}: {
  visible: boolean;
  onClose: () => void;
  stock: LeekTreeItem;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const submit = useCallback(() => {
    const code = stock.info.code;
    const values = form.getFieldsValue();
    const addArgs: string[][] = [];
    Object.keys(values).forEach((name) => {
      let value = values[name];
      if (value == null) return;
      if (!checkInputValue(value)) {
        message.error(`“${value}” 输入的格式错误`);
        throw new Error('格式错误');
      }
      const type = name.substring(0, name.length - 1);
      const remindType = name.substring(name.length - 1);
      value = (remindType === '1' ? '+' : '-') + value;

      addArgs.push([code, type, value]);
    });

    addArgs.forEach((args) => {
      state.stock.addStockRemind(
        args[0],
        args[1] as 'percent' | 'price',
        args[2]
      );
    });
    onClose();
  }, [stock, form, onClose]);

  return (
    <Modal
      onOk={submit}
      onCancel={onClose}
      width={300}
      okText="Save"
      title="添加价格预警"
      visible={visible}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
      >
        <Form.Item label="价格上涨到" name="price1">
          <Input prefix="+" suffix="元" />
        </Form.Item>
        <Form.Item label="价格下跌到" name="price0">
          <Input prefix="-" suffix="元" />
        </Form.Item>
        <Form.Item label="当日涨幅达" name="percent1">
          <Input prefix="+" suffix="%" />
        </Form.Item>
        <Form.Item label="当日跌幅达" name="percent0">
          <Input prefix="-" suffix="%" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
