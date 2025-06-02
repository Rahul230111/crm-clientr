import React, { useState, useEffect } from 'react';
import {
  Drawer, Table, Form, Input, Button,
  DatePicker, Select, Space, Modal
} from 'antd';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import dayjs from 'dayjs';

const PaymentHistoryDrawer = ({ visible, onClose, invoice, refreshInvoices }) => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRecordIndex, setEditRecordIndex] = useState(null);

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.email || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  const fetchInvoice = async () => {
    if (!invoice?._id) return;
    try {
      const res = await axios.get(`/api/invoices/${invoice._id}`);
      setInvoiceData(res.data);
    } catch {
      toast.error('Failed to refresh invoice');
    }
  };

  useEffect(() => {
    if (visible) fetchInvoice();
  }, [visible]);

  const columns = [
    { title: 'Amount', dataIndex: 'amount' },
    { title: 'Method', dataIndex: 'method' },
    { title: 'Reference', dataIndex: 'reference' },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Added By', dataIndex: 'addedBy' },
    {
      title: 'Actions',
      render: (_, record, index) => (
        <Button type="link" onClick={() => openEditModal(record, index)}>Edit</Button>
      )
    }
  ];

  const handleAddPayment = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        addedBy: getCurrentUser()
      };

      await axios.patch(`/api/invoices/${invoice._id}/payments`, payload);
      toast.success('Payment added');
      form.resetFields();
      fetchInvoice();
      refreshInvoices?.();
    } catch (err) {
      toast.error('Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record, index) => {
    setEditRecordIndex(index);
    editForm.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    if (editRecordIndex === null) return;
    try {
      const updatedPayments = [...(invoiceData?.paymentHistory || [])];
      updatedPayments[editRecordIndex] = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        addedBy: getCurrentUser()
      };

      await axios.put(`/api/invoices/${invoice._id}/paymentHistory`, {
        paymentHistory: updatedPayments
      });

      toast.success('Payment updated');
      setEditModalVisible(false);
      fetchInvoice();
      refreshInvoices?.();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  return (
    <Drawer
      open={visible}
      onClose={onClose}
      title={`Payment History - ${invoice?.invoiceNumber}`}
      width={800}
    >
      <Table
        dataSource={invoiceData?.paymentHistory || []}
        columns={columns}
        rowKey={(record, index) => index}
        pagination={false}
        style={{ marginBottom: 24 }}
      />

      <Form layout="vertical" form={form} onFinish={handleAddPayment}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]}>
            <Select placeholder="Select method">
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
              <Select.Option value="Card">Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reference" label="Reference" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} defaultValue={dayjs()} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Add Payment</Button>
        </Space>
      </Form>

      <Modal
        open={editModalVisible}
        title="Edit Payment Entry"
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Update"
        cancelText="Cancel"
      >
        <Form layout="vertical" form={editForm} onFinish={handleEditSubmit}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
              <Select.Option value="Card">Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reference" label="Reference" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default PaymentHistoryDrawer;
