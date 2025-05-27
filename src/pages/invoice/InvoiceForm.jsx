import { Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col, Divider, Space } from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Option } = Select;
const { TextArea } = Input;

const InvoiceForm = ({ onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ id: 1, description: '', hsnSac: '', quantity: 1, rate: 0 }]);

  const onFinish = (values) => {
    const invoiceData = {
      ...values,
      items,
      subTotal: calculateSubTotal(),
      tax: calculateGST(),
      total: calculateTotal()
    };
    onSave(invoiceData);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateGST = () => {
    const subTotal = calculateSubTotal();
    return subTotal * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubTotal() + calculateGST();
  };

  return (
    <Card title="Tax Invoice">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
              <Input placeholder="Enter business name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Invoice Number" name="invoiceNumber" rules={[{ required: true }]}>
              <Input placeholder="Enter invoice number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Business Info" name="businessInfo" rules={[{ required: true }]}>
              <TextArea rows={2} placeholder="Address, City, State, India" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="GSTIN" name="gstin">
              <Input placeholder="Enter GSTIN number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}>
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Customer Address" name="customerAddress" rules={[{ required: true }]}>
          <TextArea rows={2} placeholder="Enter customer address" />
        </Form.Item>

        <Divider>Invoice Items</Divider>
        
        <Row gutter={16} style={{ fontWeight: 'bold', marginBottom: 8 }}>
          <Col span={8}>Description</Col>
          <Col span={4}>HSN/SAC</Col>
          <Col span={3}>Qty</Col>
          <Col span={3}>Rate (₹)</Col>
          <Col span={4}>Amount (₹)</Col>
          <Col span={2}>Action</Col>
        </Row>
        
        {items.map((item) => (
          <Row gutter={16} key={item.id} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
              />
            </Col>
            <Col span={4}>
              <Input
                placeholder="HSN/SAC"
                value={item.hsnSac}
                onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)}
              />
            </Col>
            <Col span={3}>
              <InputNumber
                placeholder="Qty"
                min={1}
                value={item.quantity}
                onChange={(value) => updateItem(item.id, 'quantity', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={3}>
              <InputNumber
                placeholder="Rate"
                min={0}
                value={item.rate}
                onChange={(value) => updateItem(item.id, 'rate', value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={4}>
              <InputNumber
                placeholder="Amount"
                value={item.quantity * item.rate}
                readOnly
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={2}>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => removeItem(item.id)}
              />
            </Col>
          </Row>
        ))}
        
        <Button type="dashed" block onClick={addItem}>
          + Add Item
        </Button>

        <Divider>Summary</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Sub Total">
              <Input readOnly value={`₹ ${calculateSubTotal().toFixed(2)}`} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="GST (18%)">
              <Input readOnly value={`₹ ${calculateGST().toFixed(2)}`} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Total">
              <Input readOnly value={`₹ ${calculateTotal().toFixed(2)}`} style={{ fontWeight: 'bold', fontSize: '1.2em' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save Invoice
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InvoiceForm;