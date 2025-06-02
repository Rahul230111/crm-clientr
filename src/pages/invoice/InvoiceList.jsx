import React, { useState } from 'react';
import {
  Table, Space, Button, Card, Input, Popconfirm, Tag, Tooltip,
  Modal, Descriptions, Select, Typography, DatePicker
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  FileTextOutlined, PrinterOutlined, SearchOutlined,
  MessageOutlined, LockOutlined, UnlockOutlined, DollarOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import NotesDrawer from './NotesDrawer';
import PaymentHistoryDrawer from './PaymentHistoryDrawer';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const InvoiceList = ({ invoices, onAddNew, onEdit, onDelete, onSearch, refreshInvoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [businessFilter, setBusinessFilter] = useState('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('Invoice');

  const uniqueBusinessNames = [...new Set(invoices.map(inv => inv.businessName))];

  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + units[num % 10] : '');
    if (num < 1000) return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const formatIndianCurrency = (num) => {
    if (!num) return '0.00';
    return num.toFixed(2).replace(/(\d)(?=(\d{2})+\d\.)/g, '$1,');
  };

  const generatePDF = (invoice) => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${invoice.invoiceType} - ${invoice.invoiceNumber}`,
      subject: 'Invoice',
      author: 'Acculer Media Technologies',
      keywords: 'invoice, billing',
      creator: 'Invoice Management System'
    });

    // Set margins and initial position
    const margin = 15;
    let yPos = margin;

    // Invoice title (right aligned)
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(
      invoice.invoiceType === 'Proforma' ? 'PROFORMA INVOICE' : 'TAX INVOICE', 
      200 - margin, 
      yPos,
      { align: 'right' }
    );
    yPos += 10;

    // Company address
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Acculer Media Technologies', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('3rd Floor, Aruna Avanthika Complex,', margin, yPos + 5);
    doc.text('NSR Road, Janaki Nagar,', margin, yPos + 10);
    doc.text('Saibaba Colony, Coimbatore - 641011, Tamil Nadu, India', margin, yPos + 15);
    yPos += 25;

    // Customer details and invoice info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Company Name: ${invoice.customerName || 'M/s. Image Enterprises'}`, margin, yPos);
    doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 120, yPos);
    yPos += 5;

    doc.text(`Contact Person: ${invoice.contactPerson || 'Ramesh'}`, margin, yPos);
    doc.text(`Reference No: ${invoice.invoiceNumber || 'AMPI0186'}`, 120, yPos);
    yPos += 5;

    doc.text(`Contact Number: ${invoice.contactNumber || '9894526079'}`, margin, yPos);
    yPos += 5;

    doc.text(`Address: ${invoice.customerAddress || '34 Linganoor Vadavalli Road Vadavalli, Coimbatore, Tamil Nadu - 641041 INDIA'}`, margin, yPos);
    yPos += 10;

    // Items table
    const tableData = (invoice.items || []).map((item, index) => [
      index + 1,
      item.description || 'New CRM',
      item.quantity || 1,
      `₹${formatIndianCurrency(item.rate || 12500)}`,
      `₹${formatIndianCurrency((item.quantity || 1) * (item.rate || 12500))}`
    ]);

    // Add empty row if no items
    if (tableData.length === 0) {
      tableData.push([1, 'New CRM', 1, '₹12,500.00', '₹12,500.00']);
    }

    doc.autoTable({
      head: [['S.No', 'Description', 'Quantity (Nos)', 'Unit Price (Rs.)', 'Total (Rs.)']],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 }
      }
    });

    // Get the final Y position after the table
    yPos = doc.lastAutoTable.finalY + 10;

    // Amount details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Notes:', margin, yPos);
    yPos += 5;

    const totalAmount = invoice.totalAmount || 12500;
    doc.text(`Total Amount Rs. ${formatIndianCurrency(totalAmount)}`, 200 - margin, yPos, { align: 'right' });
    yPos += 5;

    doc.text(`Total Netpay Rs. ${formatIndianCurrency(totalAmount)}`, 200 - margin, yPos, { align: 'right' });
    yPos += 5;

    doc.text(`Grand Total Rs. ${formatIndianCurrency(totalAmount)}`, 200 - margin, yPos, { align: 'right' });
    yPos += 10;

    // Amount in words
    doc.text(`Amount in Words: ${numberToWords(Math.floor(totalAmount))} Rupees`, margin, yPos);
    yPos += 10;

    // Payment details
    doc.text('Cheque / DD No: __________________', margin, yPos);
    doc.text('Date: ____________', 120, yPos);
    yPos += 15;

    // Notes
    doc.setFontSize(8);
    doc.text('This is an application for Acculer Media Technologies, order confirmation will be done on phone/email.', margin, yPos, { maxWidth: 180 });
    yPos += 5;
    doc.text('All information including text & pictures to be provided by the client who should also be the legal', margin, yPos, { maxWidth: 180 });
    yPos += 5;
    doc.text('copyright owner of the same. Acculer Media Technologies shall not be liable for any claims / damages', margin, yPos, { maxWidth: 180 });
    yPos += 5;
    doc.text('arising out of content posted on your website. Work on services shall commence only after clearance', margin, yPos, { maxWidth: 180 });
    yPos += 5;
    doc.text('cheque / pay order.', margin, yPos, { maxWidth: 180 });
    yPos += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Payment to us is covered under advertising contract u/s 194C. TDS, if applicable, will be 2%', margin, yPos, { maxWidth: 180 });
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.text('Note: Cheque / Draft to be made in the favour of Acculer Media Technologies', margin, yPos, { maxWidth: 180 });
    yPos += 10;

    // Bank details
    doc.setFontSize(8);
    doc.text('PAN: AVCPP9464E', margin, yPos);
    doc.text('GST No: 33AVCPP9464E1ZG', 100, yPos);
    yPos += 5;

    doc.text('A/C No: 759105500106', margin, yPos);
    doc.text('IFSC Code: ICIC0007591', 100, yPos);
    yPos += 5;

    doc.text('SAC Code: 9983', margin, yPos);
    doc.text('Branch: ICICI Bank, Sirumugai, Coimbatore', 100, yPos);
    yPos += 10;

    // Footer
    doc.setFontSize(10);
    doc.text('This is Computer Generated Invoice & requires no Signature', 105, yPos, { align: 'center' });

    // Save the PDF
    doc.save(`${invoice.invoiceType.toLowerCase()}-${invoice.invoiceNumber || 'draft'}.pdf`);
  };

  // Rest of your component code remains the same...
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

  const handleViewPayments = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDrawerVisible(true);
  };

  const handleCloseInvoice = async (id) => {
    const toastId = toast.loading('Closing invoice...');
    try {
      await axios.patch(`/api/invoices/${id}/close`);
      toast.success('Invoice closed successfully', { id: toastId });
      refreshInvoices?.();
    } catch {
      toast.error('Failed to close invoice', { id: toastId });
    }
  };

  const handleUnlockInvoice = async (id) => {
    const toastId = toast.loading('Unlocking invoice...');
    try {
      await axios.patch(`/api/invoices/${id}/unlock`);
      toast.success('Invoice unlocked successfully', { id: toastId });
      refreshInvoices?.();
    } catch {
      toast.error('Failed to unlock invoice', { id: toastId });
    }
  };

  const exportToExcel = () => {
    const data = filteredInvoices.map((inv, index) => ({
      SNo: index + 1,
      InvoiceNumber: inv.invoiceNumber,
      Type: inv.invoiceType,
      Business: inv.businessName,
      Customer: inv.customerName,
      TotalAmount: inv.totalAmount || 0,
      Date: inv.date,
      DueDate: inv.dueDate || '',
      Status: inv.paymentStatus,
      Closed: inv.isClosed ? 'Yes' : 'No',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(fileData, `Invoices-${invoiceTypeFilter}.xlsx`);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesType = inv.invoiceType === invoiceTypeFilter;
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
    return matchesType && matchesSearch && matchesDate && matchesStatus && matchesBusiness;
  });

  const getStatusTag = (status) => {
    const config = {
      paid: { color: 'green', text: 'Paid' },
      partial: { color: 'orange', text: 'Partial' },
      pending: { color: 'red', text: 'Pending' }
    }[status] || {};
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const invoiceTypeTabs = (
    <Space style={{ marginBottom: 16 }}>
      {['Invoice', 'Proforma'].map(type => {
        const count = invoices.filter(inv => inv.invoiceType === type).length;
        const isActive = invoiceTypeFilter === type;
        return (
          <span
            key={type}
            onClick={() => setInvoiceTypeFilter(type)}
            style={{
              cursor: 'pointer',
              borderBottom: isActive ? '2px solid #1890ff' : 'none',
              color: isActive ? '#1890ff' : '#000',
              fontWeight: isActive ? '600' : 'normal',
              paddingBottom: 4,
              marginRight: 20
            }}
          >
            {type} ({count})
          </span>
        );
      })}
    </Space>
  );

  const columns = [
    {
      title: 'S.No',
      render: (_, __, index) => <Text strong>{index + 1}</Text>,
      width: 60
    },
    {
      title: 'Invoice #',
      render: (_, record) => <Tag icon={<FileTextOutlined />} color="blue">{record.invoiceNumber}</Tag>
    },
    {
      title: 'Type',
      dataIndex: 'invoiceType',
      render: (type) => <Tag color={type === 'Proforma' ? 'purple' : 'cyan'}>{type}</Tag>
    },
    {
      title: 'Business',
      dataIndex: 'businessName',
      render: (text) => <Tooltip title={text}><Text strong>{text}</Text></Tooltip>
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      render: (text) => <Tooltip title={text}>{text}</Tooltip>
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      align: 'right',
      render: (amt) => <Text style={{ color: '#52c41a' }}>₹{(amt || 0).toFixed(2)}</Text>
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      align: 'center',
      render: (date) => <Text>{date || 'N/A'}</Text>
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
          <Tooltip title="Payments"><Button icon={<DollarOutlined />} onClick={() => handleViewPayments(record)} /></Tooltip>
          {!record.isClosed && <Tooltip title="Edit"><Button icon={<EditOutlined />} onClick={() => onEdit(record)} /></Tooltip>}
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
            <RangePicker onChange={setDateRange} format="YYYY-MM-DD" />
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
            <Button onClick={exportToExcel}>Export CSV/Excel</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew}>New Invoice</Button>
          </Space>
        }
      >
        {invoiceTypeTabs}
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
            <Descriptions.Item label="Type">{selectedInvoice.invoiceType}</Descriptions.Item>
            <Descriptions.Item label="Date">{selectedInvoice.date}</Descriptions.Item>
            <Descriptions.Item label="Due Date">{selectedInvoice.dueDate}</Descriptions.Item>
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

      <PaymentHistoryDrawer
        visible={paymentDrawerVisible}
        onClose={() => setPaymentDrawerVisible(false)}
        invoice={selectedInvoice}
        refreshInvoices={refreshInvoices}
      />
    </>
  );
};

export default InvoiceList;