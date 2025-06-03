import {
  Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col,
  Divider, Space, Radio
} from 'antd';
import {
  SaveOutlined, PrinterOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';

const { Option } = Select;
const { TextArea } = Input;

const InvoiceForm = ({ onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([{ id: 1, description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [invoiceTypes, setInvoiceTypes] = useState([]);
  const [dueDate, setDueDate] = useState(null);
  const [businessOptions, setBusinessOptions] = useState([]);

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.email || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  useEffect(() => {
    axios.get('/api/invoices/leads/active')
      .then(res => setBusinessOptions(res.data))
      .catch(() => toast.error('Failed to load businesses'));
  }, []);

  useEffect(() => {
    axios.get('/api/invoices/types')
      .then(res => setInvoiceTypes(res.data))
      .catch(() => toast.error('Failed to load invoice types'));
  }, []);

  useEffect(() => {
    if (initialValues) {
      const selectedBusinessId = initialValues.businessId?._id || initialValues.businessId;
      const selectedBusiness = businessOptions.find(b => b._id === selectedBusinessId);

      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
        paymentStatus: initialValues.paymentStatus || 'pending',
        invoiceType: initialValues.invoiceType || 'Invoice',
        businessName: selectedBusiness?.businessName,
        businessType: selectedBusiness?.type,
        businessInfo: selectedBusiness ? [
          selectedBusiness.addressLine1,
          selectedBusiness.addressLine2,
          selectedBusiness.addressLine3,
          selectedBusiness.city,
          selectedBusiness.state,
          selectedBusiness.pincode,
          selectedBusiness.country
        ].filter(Boolean).join(', ') : '',
        gstin: selectedBusiness?.gstNumber || '',
        businessId: selectedBusiness?._id,
      });

      setItems(initialValues.items || []);
      setPaymentStatus(initialValues.paymentStatus || 'pending');
      setDueDate(initialValues.dueDate ? dayjs(initialValues.dueDate) : null);
    }
  }, [initialValues, businessOptions]);

  const addItem = () => {
    const nextId = Math.max(0, ...items.map(i => i.id)) + 1;
    setItems([...items, { id: nextId, description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  };

  const updateItem = (id, key, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [key]: value } : item));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateSubTotal = () => items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const calculateGST = () => calculateSubTotal() * 0.18;
  const calculateTotal = () => calculateSubTotal() + calculateGST();

  const onFinish = (values) => {
    const subTotal = calculateSubTotal();
    const tax = calculateGST();
    const totalAmount = calculateTotal();

    const newPayment = {
      amount: values.newPaymentAmount,
      method: values.newPaymentMethod,
      reference: values.newPaymentReference,
      date: values.newPaymentDate?.format('YYYY-MM-DD'),
      addedBy: getCurrentUser()
    };

    const invoiceData = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
      dueDate: dueDate?.format('YYYY-MM-DD'),
      paymentStatus,
      items,
      subTotal,
      tax,
      totalAmount,
    };

    if (newPayment.amount && newPayment.method) {
      invoiceData.paymentHistory = [
        ...(initialValues?.paymentHistory || []),
        newPayment
      ];
    }

    delete invoiceData.newPaymentAmount;
    delete invoiceData.newPaymentMethod;
    delete invoiceData.newPaymentReference;
    delete invoiceData.newPaymentDate;

    onSave(invoiceData);
  };

  return (
    <Card title={initialValues ? 'Edit Invoice' : 'Create New Invoice'}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
              <Select
                placeholder="Select business"
                onChange={(value) => {
                  const selected = businessOptions.find(b => b.businessName === value);
                  if (selected) {
                    const address = [
                      selected.addressLine1, selected.addressLine2, selected.addressLine3,
                      selected.city, selected.state, selected.pincode, selected.country
                    ].filter(Boolean).join(', ');
                    form.setFieldsValue({
                      businessType: selected.type || '',
                      businessInfo: address,
                      gstin: selected.gstNumber || '',
                      businessId: selected._id,
                    });
                  }
                }}
              >
                {businessOptions.map(b => (
                  <Option key={b._id} value={b.businessName}>{b.businessName}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="businessId" hidden><Input /></Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Business Type" name="businessType"><Input readOnly /></Form.Item>
          </Col>
        </Row>

        <Form.Item label="Invoice Type" name="invoiceType" rules={[{ required: true }]}>
          <Select placeholder="Select invoice type">
            {invoiceTypes.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          {initialValues?.invoiceNumber && (
            <Col span={12}>
              <Form.Item label="Invoice Number"><Input value={initialValues.invoiceNumber} readOnly /></Form.Item>
            </Col>
          )}
          <Col span={12}>
            <Form.Item label="Business Info" name="businessInfo"><TextArea rows={2} /></Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Date" name="date" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Due Date" name="dueDate">
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" value={dueDate} onChange={setDueDate} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="GSTIN" name="gstin"><Input /></Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}><Input /></Form.Item>
          </Col>
        </Row>

        <Form.Item label="Customer Address" name="customerAddress" rules={[{ required: true }]}>
          <TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Payment Status" name="paymentStatus">
          <Radio.Group value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="partial">Partial</Radio.Button>
            <Radio.Button value="paid">Paid</Radio.Button>
          </Radio.Group>
        </Form.Item>

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
          <Col span={8}><Input readOnly value={`₹${calculateSubTotal().toFixed(2)}`} addonBefore="Sub Total" /></Col>
          <Col span={8}><Input readOnly value={`₹${calculateGST().toFixed(2)}`} addonBefore="GST (18%)" /></Col>
          <Col span={8}><Input readOnly value={`₹${calculateTotal().toFixed(2)}`} addonBefore="Total" style={{ fontWeight: 'bold' }} /></Col>
        </Row>

        <Divider>Payment History</Divider>
        {initialValues?.paymentHistory?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {initialValues.paymentHistory.map((p, i) => (
              <Card key={i} size="small" style={{ marginBottom: 8 }}>
                <p><strong>Amount:</strong> ₹{p.amount}</p>
                <p><strong>Method:</strong> {p.method}</p>
                <p><strong>Date:</strong> {p.date}</p>
                <p><strong>Reference:</strong> {p.reference}</p>
                <p><strong>Added By:</strong> {p.addedBy}</p>
              </Card>
            ))}
          </div>
        )}

        <Divider>Add Payment Entry</Divider>
        <Row gutter={16}>
          <Col span={6}><Form.Item label="Amount" name="newPaymentAmount"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item label="Method" name="newPaymentMethod">
            <Select placeholder="Select method">
              <Option value="Cash">Cash</Option>
              <Option value="Bank">Bank</Option>
              <Option value="UPI">UPI</Option>
              <Option value="Cheque">Cheque</Option>
            </Select>
          </Form.Item></Col>
          <Col span={6}><Form.Item label="Reference" name="newPaymentReference"><Input /></Form.Item></Col>
          <Col span={6}><Form.Item label="Date" name="newPaymentDate"><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item></Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
              {initialValues ? 'Update Invoice' : 'Save Invoice'}
            </Button>
            <Button onClick={onCancel} size="large">Cancel</Button>
            <Button icon={<PrinterOutlined />} size="large" onClick={() => window.print()}>Print</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InvoiceForm;
