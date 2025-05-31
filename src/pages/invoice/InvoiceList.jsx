import React, { useState } from 'react';
import {
  Table, Space, Button, Card, Input, Popconfirm, Tag, Tooltip,
  Modal, Descriptions, Select, Typography, message, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FileTextOutlined, PrinterOutlined, SearchOutlined,
  MessageOutlined, LockOutlined, UnlockOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import NotesDrawer from './NotesDrawer';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const InvoiceList = ({ invoices, onAddNew, onEdit, onDelete, onSearch, refreshInvoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [businessFilter, setBusinessFilter] = useState('all');

  const uniqueBusinessNames = [...new Set(invoices.map(inv => inv.businessName))];

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalVisible(true);
  };

  const handleViewNotes = (invoice) => {
    setSelectedInvoice(invoice);
    setNotesDrawerVisible(true);
  };

  const handleCloseInvoice = async (id) => {
    try {
      await axios.patch(`/api/invoices/${id}/close`);
      message.success('Invoice closed successfully');
      refreshInvoices?.();
    } catch (err) {
      console.error(err);
      message.error('Failed to close invoice');
    }
  };

  const handleUnlockInvoice = async (id) => {
    try {
      await axios.patch(`/api/invoices/${id}/unlock`);
      message.success('Invoice unlocked successfully');
      refreshInvoices?.();
    } catch (err) {
      console.error(err);
      message.error('Failed to unlock invoice');
    }
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('TAX INVOICE', 14, 20);
    doc.setFontSize(12);
    doc.text(`Business: ${invoice.businessName || ''}`, 14, 35);
    doc.text(`Address: ${invoice.businessInfo || ''}`, 14, 45);
    doc.text(`GSTIN: ${invoice.gstin || ''}`, 14, 55);
    doc.text(`Invoice No: ${invoice.invoiceNumber || ''}`, 120, 35);
    doc.text(`Date: ${invoice.date || ''}`, 120, 45);
    doc.text(`Due Date: ${invoice.dueDate || 'N/A'}`, 120, 55);
    doc.text(`Status: ${invoice.paymentStatus}`, 120, 65);
    doc.text(`Bill To: ${invoice.customerName || ''}`, 14, 80);
    doc.text(`Address: ${invoice.customerAddress || ''}`, 14, 90);

    const tableData = invoice.items?.map(item => [
      item.description || '',
      item.hsnSac || '',
      item.quantity || 0,
      `₹${(item.rate || 0).toFixed(2)}`,
      `₹${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}`
    ]) || [];

    doc.autoTable({
      head: [['Description', 'HSN/SAC', 'Qty', 'Rate (₹)', 'Amount (₹)']],
      body: tableData,
      startY: 100,
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Sub Total: ₹${invoice.subTotal?.toFixed(2) || '0.00'}`, 120, finalY);
    doc.text(`GST (18%): ₹${invoice.tax?.toFixed(2) || '0.00'}`, 120, finalY + 10);
    doc.setFontSize(14);
    doc.text(`Total: ₹${invoice.total?.toFixed(2) || invoice.totalAmount?.toFixed(2) || '0.00'}`, 120, finalY + 20);
    doc.save(`invoice-${invoice.invoiceNumber || 'draft'}.pdf`);
  };

  const getStatusTag = (status) => {
    const config = {
      paid: { color: 'success', text: 'Paid' },
      partial: { color: 'warning', text: 'Partial' },
      pending: { color: 'error', text: 'Pending' }
    }[status] || {};
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getDueStatus = (dueDate, paymentStatus) => {
    if (!dueDate || paymentStatus === 'paid') return 'none';
    const due = new Date(dueDate);
    return due < new Date() ? 'overdue' : 'pending';
  };

  const filteredInvoices = (invoices || []).filter(inv => {
    const matchesSearch = !searchTerm ||
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !dateRange || (
      new Date(inv.date) >= dateRange[0].toDate() &&
      new Date(inv.date) <= dateRange[1].toDate()
    );

    const matchesStatus = statusFilter === 'all' ? true :
      statusFilter === 'overdue'
        ? inv.paymentStatus !== 'paid' && new Date(inv.dueDate) < new Date()
        : inv.paymentStatus === statusFilter;

    const matchesBusiness = businessFilter === 'all' ? true : inv.businessName === businessFilter;

    return matchesSearch && matchesDate && matchesStatus && matchesBusiness;
  });

  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = filteredInvoices.filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPending = totalAmount - totalPaid;

  const columns = [
    {
      title: 'S.No',
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
      width: 70
    },
    {
      title: 'Invoice Number',
      render: (_, record) => (
        <Tag color="blue" icon={<FileTextOutlined />}>{record.invoiceNumber}</Tag>
      )
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      render: text => <Tooltip title={text}><Text strong>{text}</Text></Tooltip>
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerName',
      render: text => <Tooltip title={text}><Text>{text}</Text></Tooltip>
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      align: 'right',
      render: amount => <Text strong style={{ color: '#52c41a' }}>₹{(amount || 0).toFixed(2)}</Text>
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      align: 'center',
      render: (date, record) => {
        const status = getDueStatus(date, record.paymentStatus);
        const color = status === 'overdue' ? 'red' : status === 'pending' ? '#faad14' : 'inherit';
        return <Text style={{ color }}>{date || 'N/A'}</Text>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'paymentStatus',
      render: getStatusTag
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View"><Button icon={<EyeOutlined />} onClick={() => handleView(record)} /></Tooltip>
          <Tooltip title="PDF"><Button icon={<PrinterOutlined />} onClick={() => generatePDF(record)} /></Tooltip>
          <Tooltip title="Notes"><Button icon={<MessageOutlined />} onClick={() => handleViewNotes(record)} /></Tooltip>
          {!record.isClosed && (
            <Tooltip title="Edit"><Button icon={<EditOutlined />} onClick={() => onEdit(record)} /></Tooltip>
          )}
          {!record.isClosed ? (
            <Popconfirm title="Close this invoice?" onConfirm={() => handleCloseInvoice(record._id)}>
              <Tooltip title="Lock"><Button icon={<LockOutlined />} /></Tooltip>
            </Popconfirm>
          ) : (
            <Popconfirm title="Unlock this invoice?" onConfirm={() => handleUnlockInvoice(record._id)}>
              <Tooltip title="Unlock"><Button icon={<UnlockOutlined />} /></Tooltip>
            </Popconfirm>
          )}
          <Popconfirm title="Delete invoice?" onConfirm={() => onDelete(record._id)}>
            <Tooltip title="Delete"><Button icon={<DeleteOutlined />} danger /></Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card
        title="Invoice Management"
        extra={
          <Space wrap>
            <RangePicker onChange={(range) => setDateRange(range)} format="YYYY-MM-DD" />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }}>
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="paid">Paid</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="partial">Partial</Select.Option>
              <Select.Option value="overdue">Overdue</Select.Option>
            </Select>
            <Select
              value={businessFilter}
              onChange={setBusinessFilter}
              placeholder="Filter by Business"
              style={{ width: 200 }}
              allowClear
            >
              <Select.Option value="all">All Businesses</Select.Option>
              {uniqueBusinessNames.map(name => (
                <Select.Option key={name} value={name}>{name}</Select.Option>
              ))}
            </Select>
            <Input.Search
              placeholder="Search invoices"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 240 }}
              allowClear
              prefix={<SearchOutlined />}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew}>New Invoice</Button>
          </Space>
        }
      >
        <Card type="inner" title="Summary" style={{ marginBottom: 16 }}>
          <Space direction="horizontal" size="large">
            <Text strong>Total Invoices:</Text> {totalInvoices}
            <Text strong>Total Amount:</Text> ₹{totalAmount.toFixed(2)}
            <Text strong>Paid:</Text> ₹{totalPaid.toFixed(2)}
            <Text strong>Pending:</Text> ₹{totalPending.toFixed(2)}
          </Space>
        </Card>

        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>

      <Modal
        title="Invoice Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={<Button onClick={() => setViewModalVisible(false)}>Close</Button>}
        width={800}
      >
        {selectedInvoice && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Invoice No">{selectedInvoice.invoiceNumber}</Descriptions.Item>
            <Descriptions.Item label="Date">{selectedInvoice.date}</Descriptions.Item>
            <Descriptions.Item label="Business">{selectedInvoice.businessName}</Descriptions.Item>
            <Descriptions.Item label="Customer">{selectedInvoice.customerName}</Descriptions.Item>
            <Descriptions.Item label="GSTIN" span={2}>{selectedInvoice.gstin}</Descriptions.Item>
            <Descriptions.Item label="Amount" span={2}>₹{selectedInvoice.totalAmount?.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{getStatusTag(selectedInvoice.paymentStatus)}</Descriptions.Item>
            <Descriptions.Item label="Closed" span={2}>
              {selectedInvoice.isClosed ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <NotesDrawer
        visible={notesDrawerVisible}
        onClose={() => setNotesDrawerVisible(false)}
        invoice={selectedInvoice}
        refreshInvoices={refreshInvoices}
      />
    </>
  );
};

export default InvoiceList;
