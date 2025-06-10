import React, { useState, useEffect } from 'react';
import {
  Drawer, Table, Form, Input, Button,
  DatePicker, Select, Space, Modal, Popconfirm, Typography, Descriptions // Added Typography and Descriptions for display
} from 'antd';
import toast from 'react-hot-toast';
import axios from '../../api/axios';
import dayjs from 'dayjs';

const { Text } = Typography; // Destructure Text from Typography

const PaymentHistoryDrawer = ({ visible, onClose, invoice, refreshInvoices }) => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ paymentHistory: [] });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditingPaymentId, setCurrentEditingPaymentId] = useState(null);

  // --- Start of new/modified code for calculations ---
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [outstandingBalance, setOutstandingBalance] = useState(0);

  // Function to calculate total paid and outstanding balance
  const calculateTotals = (currentInvoiceData) => {
    const paid = currentInvoiceData.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    setTotalPaidAmount(paid);

    if (invoice?.totalAmount) { // Ensure invoice total amount is available
      setOutstandingBalance(invoice.totalAmount - paid);
    } else {
      setOutstandingBalance(0); // Or handle appropriately if totalAmount is not available
    }
  };
  // --- End of new/modified code for calculations ---

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
      const fetchedInvoiceData = {
        ...res.data,
        paymentHistory: Array.isArray(res.data.paymentHistory)
          ? res.data.paymentHistory
          : []
      };
      setInvoiceData(fetchedInvoiceData);
      calculateTotals(fetchedInvoiceData); // Call calculation after fetching data
    } catch (error) {
      toast.error('Failed to fetch invoice details.');
      console.error('Error fetching invoice:', error);
      setInvoiceData({ paymentHistory: [] }); // Reset on error
      calculateTotals({ paymentHistory: [] }); // Recalculate with empty history on error
    }
  };

  // --- Effects for fetching and recalculating ---
  useEffect(() => {
    if (visible) {
      fetchInvoice();
    }
  }, [visible, invoice?._id]); // Re-fetch when drawer becomes visible or invoice changes

  useEffect(() => {
    // Recalculate if invoice prop changes, in case totalAmount is updated externally
    calculateTotals(invoiceData);
  }, [invoice?.totalAmount, invoiceData.paymentHistory]); // Depend on invoice total and payment history
  // --- End of Effects ---

  const handleAddPayment = async (values) => {
    setLoading(true);
    try {
      const newPayment = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        addedBy: getCurrentUser(),
      };
      await axios.post(`/api/invoices/${invoice._id}/payments`, newPayment);
      toast.success('Payment added successfully!');
      form.resetFields();
      await fetchInvoice(); // Re-fetch to update history and totals
      refreshInvoices(); // Notify parent component to refresh invoice list
    } catch (error) {
      toast.error('Failed to add payment.');
      console.error('Error adding payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await axios.delete(`/api/invoices/${invoice._id}/payments/${paymentId}`);
      toast.success('Payment deleted successfully!');
      await fetchInvoice(); // Re-fetch to update history and totals
      refreshInvoices();
    } catch (error) {
      toast.error('Failed to delete payment.');
      console.error('Error deleting payment:', error);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const updatedPayment = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      await axios.put(`/api/invoices/${invoice._id}/payments/${currentEditingPaymentId}`, updatedPayment);
      toast.success('Payment updated successfully!');
      setEditModalVisible(false);
      await fetchInvoice(); // Re-fetch to update history and totals
      refreshInvoices();
    } catch (error) {
      toast.error('Failed to update payment.');
      console.error('Error updating payment:', error);
    }
  };

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => `₹${Number(text).toFixed(2)}`,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Added By',
      dataIndex: 'addedBy',
      key: 'addedBy',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => {
            setCurrentEditingPaymentId(record._id);
            editForm.setFieldsValue({
              amount: record.amount,
              method: record.method,
              reference: record.reference,
              date: dayjs(record.date),
            });
            setEditModalVisible(true);
          }}>Edit</Button>
          <Popconfirm
            title="Are you sure to delete this payment?"
            onConfirm={() => handleDeletePayment(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Drawer
      title={`Payment History for Invoice #${invoice?.invoiceNo || 'N/A'}`}
      placement="right"
      onClose={onClose}
      open={visible}
      width={720}
    >
      {/* Display Summary Calculations */}
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 20 }}>
        <Descriptions.Item label="Invoice Total">
          <Text strong>₹{invoice?.totalAmount?.toFixed(2) || '0.00'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Total Paid">
          <Text strong style={{ color: totalPaidAmount > 0 ? 'green' : 'inherit' }}>₹{totalPaidAmount.toFixed(2)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding Balance">
          <Text strong style={{ color: outstandingBalance > 0 ? 'red' : 'green' }}>₹{outstandingBalance.toFixed(2)}</Text>
        </Descriptions.Item>
      </Descriptions>

      <h3>Add New Payment</h3>
      <Form form={form} layout="vertical" onFinish={handleAddPayment} style={{ marginBottom: 20 }}>
        <Space>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please input amount!' }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Form.Item name="method" label="Method" rules={[{ required: true, message: 'Please select method!' }]}>
            <Select style={{ width: 120 }}>
              <Select.Option value="Cash">Cash</Select.Option>
              <Select.Option value="UPI">UPI</Select.Option>
              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
              <Select.Option value="Card">Card</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="reference" label="Reference">
            <Input />
          </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date!' }]}>
            <DatePicker style={{ width: '100%' }} defaultValue={dayjs()} format="DD/MM/YYYY" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Add Payment</Button>
        </Space>
      </Form>

      <h3>Payment History</h3>
      <Table
        dataSource={invoiceData.paymentHistory}
        columns={columns}
        rowKey="_id"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />

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
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

export default PaymentHistoryDrawer;