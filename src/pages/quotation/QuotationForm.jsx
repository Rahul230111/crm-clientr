import {
  Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col, Divider, Space
} from 'antd';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;

const QuotationForm = ({ onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [businessOptions, setBusinessOptions] = useState([]);
  const [items, setItems] = useState([{ id: 1, description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const toastId = toast.loading('Loading business options...');
    axios.get('/api/quotations/leads/active')
      .then(res => {
        setBusinessOptions(res.data);
        toast.success('Business options loaded', { id: toastId });
      })
      .catch(() => {
        toast.error('Failed to load businesses', { id: toastId });
      });

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : null,
        validUntil: initialValues.validUntil ? dayjs(initialValues.validUntil) : null,
        noteText: ''
      });
      setItems(initialValues.items || []);
      setNotes(initialValues.notes || []);
    }
  }, [initialValues]);

  const onFinish = async (values) => {
    if (!items || items.length === 0) {
      toast.error("At least one item is required.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Saving quotation...');

    const timestamp = new Date().toLocaleString();
    const newNote = values.noteText ? { text: values.noteText, timestamp } : null;

    const quotation = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
      validUntil: values.validUntil?.format('YYYY-MM-DD'),
      items,
      notes: newNote ? [...notes, newNote] : notes,
      subTotal: calculateSubTotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      createdDate: new Date().toLocaleDateString()
    };

    try {
      if (initialValues?._id) {
        await axios.put(`/api/quotations/${initialValues._id}`, quotation);
      } else {
        await axios.post('/api/quotations', quotation);
      }
      toast.success('Quotation saved successfully', { id: toastId });
      onSave(quotation);
    } catch (error) {
      toast.error(`Failed to save: ${error?.response?.data?.message || error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => setItems([...items, { id: Date.now(), description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  const removeItem = (id) => setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateSubTotal = () => items.reduce((sum, i) => sum + i.quantity * i.rate, 0);
  const calculateTax = () => calculateSubTotal() * 0.18;
  const calculateTotal = () => calculateSubTotal() + calculateTax();

  return (
    <Card title={initialValues ? 'Edit Quotation' : 'Create Quotation'} loading={loading}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Business" name="businessId" rules={[{ required: true }]}>
              <Select placeholder="Select business" onChange={(id) => {
                const selected = businessOptions.find(b => b._id === id);
                if (selected) {
                  form.setFieldsValue({
                    businessId: id,
                    businessName: selected.businessName,
                    businessType: selected.type,
                    businessInfo: `${selected.addressLine1}, ${selected.city}, ${selected.state}`,
                    gstin: selected.gstNumber
                  });
                }
              }}>
                {businessOptions.map(b => (
                  <Option key={b._id} value={b._id}>{b.businessName}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="businessName" hidden><Input /></Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="businessType" label="Type"><Input readOnly /></Form.Item>
          </Col>
        </Row>

        {initialValues?.quotationNumber && (
          <Form.Item label="Quotation Number">
            <Input value={initialValues.quotationNumber} readOnly />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="validUntil" label="Valid Until">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gstin" label="GSTIN"><Input /></Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}><Input /></Form.Item>
          </Col>
        </Row>

        <Form.Item name="customerAddress" label="Customer Address" rules={[{ required: true }]}>
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item name="businessInfo" label="Business Info"><TextArea rows={2} /></Form.Item>

        <Divider>Items</Divider>
        {items.map(item => (
          <Row key={item.id} gutter={16} style={{ marginBottom: 12 }}>
            <Col span={6}><Input placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} /></Col>
            <Col span={4}><Input placeholder="HSN/SAC" value={item.hsnSac} onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)} /></Col>
            <Col span={4}><InputNumber placeholder="Qty" value={item.quantity} onChange={(val) => updateItem(item.id, 'quantity', val)} style={{ width: '100%' }} /></Col>
            <Col span={4}><InputNumber placeholder="Rate" value={item.rate} onChange={(val) => updateItem(item.id, 'rate', val)} style={{ width: '100%' }} /></Col>
            <Col span={4}><Input value={`₹${(item.quantity * item.rate).toFixed(2)}`} readOnly /></Col>
            <Col span={2}><Button icon={<DeleteOutlined />} danger onClick={() => removeItem(item.id)} /></Col>
          </Row>
        ))}
        <Button onClick={addItem} block>+ Add Item</Button>

        <Divider>Summary</Divider>
        <Row gutter={16}>
          <Col span={8}><Form.Item label="Sub Total"><Input readOnly value={`₹${calculateSubTotal().toFixed(2)}`} /></Form.Item></Col>
          <Col span={8}><Form.Item label="GST (18%)"><Input readOnly value={`₹${calculateTax().toFixed(2)}`} /></Form.Item></Col>
          <Col span={8}><Form.Item label="Total"><Input readOnly value={`₹${calculateTotal().toFixed(2)}`} /></Form.Item></Col>
        </Row>

        <Form.Item name="noteText" label="Add Note"><TextArea rows={2} placeholder="Add new note..." /></Form.Item>

        <Form.Item>
          <Space>
            <Button htmlType="submit" type="primary" icon={<SaveOutlined />} loading={loading}>Save</Button>
            <Button onClick={onCancel} disabled={loading}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default QuotationForm;
