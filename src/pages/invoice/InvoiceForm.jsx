import {
  Form, Input, DatePicker, Select, InputNumber, Button, Card, Row, Col,
  Divider, Space, Alert, Radio
} from 'antd';
import {
  SaveOutlined, DeleteOutlined, PrinterOutlined
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
    const toastId = toast.loading('Loading business options...');
    axios.get('/api/invoices/leads/active')
      .then(res => {
        setBusinessOptions(res.data);
        toast.success('Business options loaded', { id: toastId });
      })
      .catch(() => toast.error('Failed to load businesses', { id: toastId }));
  }, []);

  useEffect(() => {
    axios.get('/api/invoices/types')
      .then(res => setInvoiceTypes(res.data))
      .catch(() => toast.error('Failed to load invoice types'));
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
        paymentStatus: initialValues.paymentStatus || 'pending',
        invoiceType: initialValues.invoiceType || 'Invoice',
        paymentHistory: initialValues.paymentHistory?.map(p => ({
          ...p,
          date: p.date ? dayjs(p.date) : null,
        })) || [],
      });
      setItems(initialValues.items || []);
      setPaymentStatus(initialValues.paymentStatus || 'pending');
      setDueDate(initialValues.dueDate ? dayjs(initialValues.dueDate) : null);
    }
  }, [initialValues]);

  const onFinish = (values) => {
    const subTotal = calculateSubTotal();
    const tax = calculateGST();
    const totalAmount = calculateTotal();
    const invoiceData = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
      dueDate: dueDate?.format('YYYY-MM-DD'),
      paymentStatus,
      items,
      subTotal,
      tax,
      totalAmount,
      paymentHistory: values.paymentHistory?.filter(p => p.amount) || []
    };
    onSave(invoiceData);
  };

  const addItem = () => setItems([...items, { id: Date.now(), description: '', hsnSac: '', quantity: 1, rate: 0 }]);
  const removeItem = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));

  const calculateSubTotal = () => items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const calculateGST = () => calculateSubTotal() * 0.18;
  const calculateTotal = () => calculateSubTotal() + calculateGST();

  const generatePDF = () => {
    const values = form.getFieldsValue();
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('TAX INVOICE', 14, 20);
    doc.setFontSize(12);
    doc.text(`Business: ${values.businessName || ''}`, 14, 35);
    doc.text(`Type: ${values.businessType || ''}`, 14, 42);
    doc.text(`Address: ${values.businessInfo || ''}`, 14, 50);
    doc.text(`GSTIN: ${values.gstin || ''}`, 14, 58);
    doc.text(`Invoice No: ${initialValues?.invoiceNumber || 'Generated on save'}`, 120, 35);
    doc.text(`Date: ${values.date?.format('DD/MM/YYYY') || ''}`, 120, 43);
    doc.text(`Due Date: ${dueDate?.format('DD/MM/YYYY') || ''}`, 120, 51);
    doc.text(`Status: ${paymentStatus}`, 120, 59);
    doc.text(`Bill To: ${values.customerName || ''}`, 14, 75);
    doc.text(`Address: ${values.customerAddress || ''}`, 14, 83);
    const tableData = items.map(i => [
      i.description || '', i.hsnSac || '', i.quantity, `₹${i.rate.toFixed(2)}`, `₹${(i.quantity * i.rate).toFixed(2)}`
    ]);
    doc.autoTable({
      head: [['Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Amount (₹)']],
      body: tableData,
      startY: 100,
      theme: 'grid'
    });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Sub Total: ₹${calculateSubTotal().toFixed(2)}`, 120, finalY);
    doc.text(`GST (18%): ₹${calculateGST().toFixed(2)}`, 120, finalY + 10);
    doc.setFontSize(14);
    doc.text(`Total: ₹${calculateTotal().toFixed(2)}`, 120, finalY + 20);
    doc.text(`Payment Status: ${paymentStatus}`, 14, finalY + 30);
    doc.save(`invoice-${initialValues?.invoiceNumber || 'draft'}.pdf`);
  };

  return (
    <Card title={initialValues ? 'Edit Invoice' : 'Create New Invoice'}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
              <Select placeholder="Select business" onChange={(value) => {
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
                    businessId: selected._id
                  });
                }
              }}>
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
 <Form.Item label="Invoice Type" name="invoiceType" rules={[{ required: true, message: 'Please select invoice type' }]}>
  <Select placeholder="Select invoice type">
    {invoiceTypes.map(type => (
      <Option key={type} value={type}>{type}</Option>
    ))}
  </Select>
</Form.Item>
        <Row gutter={16}>
          {initialValues?.invoiceNumber && (
            <Col span={12}>
              <Form.Item label="Invoice Number">
                <Input value={initialValues.invoiceNumber} readOnly />
              </Form.Item>
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
            <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Customer Address" name="customerAddress" rules={[{ required: true }]}>
          <TextArea rows={2} />
        </Form.Item>

        

        <Form.Item label="Payment Status" name="paymentStatus">
          <Radio.Group value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            <Radio.Button value="pending">Pending</Radio.Button>
            <Radio.Button value="paid">Paid</Radio.Button>
            <Radio.Button value="partial">Partial</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Divider>Invoice Items</Divider>
        {items.map(item => (
          <Row key={item.id} gutter={16} style={{ marginBottom: 12 }}>
            <Col span={8}><Input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} placeholder="Description" /></Col>
            <Col span={4}><Input value={item.hsnSac} onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)} placeholder="HSN/SAC" /></Col>
            <Col span={3}><InputNumber value={item.quantity} min={1} onChange={(val) => updateItem(item.id, 'quantity', val)} style={{ width: '100%' }} /></Col>
            <Col span={3}><InputNumber value={item.rate} min={0} onChange={(val) => updateItem(item.id, 'rate', val)} style={{ width: '100%' }} /></Col>
            <Col span={4}><Input value={`₹ ${(item.quantity * item.rate).toFixed(2)}`} readOnly /></Col>
            <Col span={2}><Button icon={<DeleteOutlined />} danger onClick={() => removeItem(item.id)} disabled={items.length === 1} /></Col>
          </Row>
        ))}

        <Button type="dashed" onClick={addItem} block style={{ marginBottom: 24 }}>+ Add Item</Button>

        <Divider>Payment History</Divider>
        <Form.List name="paymentHistory">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <Row key={key} gutter={16} style={{ marginBottom: 12 }}>
                  <Col span={4}>
                    <Form.Item name={[name, 'amount']} rules={[{ required: true }]}>
                      <InputNumber placeholder="Amount" style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name={[name, 'method']} rules={[{ required: true }]}>
                      <Select placeholder="Method">
                        <Option value="Cash">Cash</Option>
                        <Option value="UPI">UPI</Option>
                        <Option value="Card">Card</Option>
                        <Option value="Bank Transfer">Bank</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item name={[name, 'reference']} rules={[{ required: true }]}>
                      <Input placeholder="Reference" />
                    </Form.Item>
                  </Col>
                  <Col span={5}>
                    <Form.Item name={[name, 'date']} rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name={[name, 'addedBy']} initialValue={getCurrentUser()}>
                      <Input placeholder="Added By" readOnly />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Button onClick={() => remove(name)} danger>Remove</Button>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block>
                  + Add Payment
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider>Summary</Divider>
        <Row gutter={16}>
          <Col span={8}><Input readOnly value={`₹ ${calculateSubTotal().toFixed(2)}`} addonBefore="Sub Total" /></Col>
          <Col span={8}><Input readOnly value={`₹ ${calculateGST().toFixed(2)}`} addonBefore="GST (18%)" /></Col>
          <Col span={8}><Input readOnly value={`₹ ${calculateTotal().toFixed(2)}`} addonBefore="Total" style={{ fontWeight: 'bold' }} /></Col>
        </Row>

        <Form.Item name="noteText" label="Note">
          <TextArea rows={2} placeholder="Add a note" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
              {initialValues ? 'Update Invoice' : 'Save Invoice'}
            </Button>
            <Button onClick={onCancel} size="large">Cancel</Button>
            <Button onClick={generatePDF} icon={<PrinterOutlined />} size="large">Generate PDF</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default InvoiceForm;
