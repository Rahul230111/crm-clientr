import React from 'react';
import { Form, Input, InputNumber, Select, Button, Modal } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const ProductForm = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const onFinish = (values) => {
    onSave(values);
  };

  return (
    <Modal
      title={initialValues ? 'Edit Product' : 'Add New Product'}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          status: 'Active',
          quantity: 1,
          ...initialValues
        }}
      >
        <Form.Item
          name="name"
          label="Product Name"
          rules={[{ required: true, message: 'Please enter product name' }]}
        >
          <Input placeholder="Enter product name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={3} placeholder="Product description" />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Quantity"
          rules={[{ required: true, message: 'Please enter quantity' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price (₹)"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/₹\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Update' : 'Save'}
          </Button>
          <Button onClick={onCancel} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;