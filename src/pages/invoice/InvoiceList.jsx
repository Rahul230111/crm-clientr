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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import NotesDrawer from './NotesDrawer';
import PaymentHistoryDrawer from './PaymentHistoryDrawer';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const InvoiceList = ({ invoices, onAddNew, onEdit, onDelete, onSearch, refreshInvoices }) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [businessFilter, setBusinessFilter] = useState('all');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('Invoice');

  // Get unique business names for filter dropdown
  const uniqueBusinessNames = [...new Set(invoices.map(inv => inv.businessName))];

  // Convert number to words for amount in words section
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

  // Format currency in Indian style
  const formatIndianCurrency = (num) => {
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Generate PDF document for an invoice
  const generatePDF = (invoice) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set document properties
      doc.setProperties({
        title: `${invoice.invoiceType} - ${invoice.invoiceNumber}`,
        subject: 'Invoice',
        author: 'Your Company Name',
        keywords: 'invoice, billing',
        creator: 'Invoice Management System'
      });

      // Set margins and initial position
      const margin = 15;
      let yPos = margin;

      // Invoice title (centered)
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(
        invoice.invoiceType === 'Proforma' ? 'PROFORMA INVOICE' : 'TAX INVOICE', 
        105, 
        yPos,
        { align: 'center' }
      );
      yPos += 10;

      // Company address (left aligned)
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Company Name', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text('Your Company Address Line 1', margin, yPos + 5);
      doc.text('Your Company Address Line 2', margin, yPos + 10);
      doc.text('City, State - PIN, Country', margin, yPos + 15);
      doc.text(`GSTIN: ${invoice.companyGSTIN || 'XXXXXXXXXXXXXXX'}`, margin, yPos + 20);
      yPos += 30;

      // Customer details and invoice info (two columns)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Bill To: ${invoice.customerName || 'N/A'}`, margin, yPos);
      doc.text(`Invoice No: ${invoice.invoiceNumber || 'N/A'}`, 140, yPos);
      yPos += 5;

      doc.text(`Contact: ${invoice.contactPerson || 'N/A'}`, margin, yPos);
      doc.text(`Date: ${invoice.date || new Date().toLocaleDateString()}`, 140, yPos);
      yPos += 5;

      doc.text(`Phone: ${invoice.contactNumber || 'N/A'}`, margin, yPos);
      doc.text(`Due Date: ${invoice.dueDate || 'N/A'}`, 140, yPos);
      yPos += 5;

      doc.text(`GSTIN: ${invoice.customerGSTIN || 'N/A'}`, margin, yPos);
      yPos += 5;

      doc.text(`Address: ${invoice.customerAddress || 'N/A'}`, margin, yPos);
      yPos += 10;

      // Items table - ensure all values are properly formatted
      const tableData = (invoice.items || []).map((item, index) => {
        const description = item?.description?.toString() || 'N/A';
        const quantity = item?.quantity?.toString() || '1';
        const rate = item?.rate?.toString() || '0';
        const total = (parseFloat(quantity) * parseFloat(rate)).toFixed(2);

        return [
          (index + 1).toString(),
          description,
          quantity,
          `₹${formatIndianCurrency(parseFloat(rate))}`,
          `₹${formatIndianCurrency(parseFloat(total))}`
        ];
      });

      // Add items table using autoTable
      autoTable(doc, {
        head: [['S.No', 'Description', 'Qty', 'Unit Price (₹)', 'Total (₹)']],
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
          2: { cellWidth: 15 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 }
        }
      });

      // Get final Y position after table
      yPos = doc.lastAutoTable.finalY + 10;

      // Amount summary section
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Amount Summary:', margin, yPos);
      yPos += 5;

      const totalAmount = parseFloat(invoice.totalAmount) || 0;
      const taxAmount = parseFloat(invoice.taxAmount) || 0;
      const discountAmount = parseFloat(invoice.discountAmount) || 0;
      const grandTotal = totalAmount + taxAmount - discountAmount;

      doc.text(`Sub Total:`, 140, yPos);
      doc.text(`₹${formatIndianCurrency(totalAmount)}`, 200 - margin, yPos, { align: 'right' });
      yPos += 5;

      doc.text(`Tax (${invoice.taxRate || 0}%):`, 140, yPos);
      doc.text(`₹${formatIndianCurrency(taxAmount)}`, 200 - margin, yPos, { align: 'right' });
      yPos += 5;

      doc.text(`Discount:`, 140, yPos);
      doc.text(`₹${formatIndianCurrency(discountAmount)}`, 200 - margin, yPos, { align: 'right' });
      yPos += 5;

      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total:`, 140, yPos);
      doc.text(`₹${formatIndianCurrency(grandTotal)}`, 200 - margin, yPos, { align: 'right' });
      yPos += 10;

      // Amount in words section
      doc.setFont('helvetica', 'bold');
      doc.text('Amount in Words:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${numberToWords(Math.floor(grandTotal))} Rupees Only`, margin + 30, yPos);
      yPos += 15;

      // Payment terms section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Terms:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.paymentTerms || 'Payment due within 15 days of invoice date', margin + 25, yPos);
      yPos += 10;

      // Notes section
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.notes || 'Thank you for your business!', margin + 15, yPos, { maxWidth: 180 });
      yPos += 15;

      // Bank details section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Bank Details:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text('Bank Name: Your Bank Name', margin, yPos + 5);
      doc.text('Account Number: XXXXXXXXXXXX', margin, yPos + 10);
      doc.text('IFSC Code: XXXXXXXXXX', margin, yPos + 15);
      doc.text('Branch: Your Branch Name', margin, yPos + 20);
      yPos += 30;

      // Footer
      doc.setFontSize(10);
      doc.text('This is Computer Generated Invoice & requires no Signature', 105, yPos, { align: 'center' });

      // Save the PDF with appropriate filename
      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, `${invoice.invoiceType.toLowerCase()}-${invoice.invoiceNumber || 'draft'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Search handler
  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  // View invoice details handler
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalVisible(true);
  };

  // View notes handler
  const handleViewNotes = (invoice) => {
    setSelectedInvoice(invoice);
    setNotesDrawerVisible(true);
  };

  // View payment history handler
  const handleViewPayments = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentDrawerVisible(true);
  };

  // Close invoice handler
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

  // Unlock invoice handler
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

  // Export to Excel handler
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

    // Correct MIME type for Excel files
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    saveAs(fileData, `Invoices-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter invoices based on various criteria
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

  // Get status tag component
  const getStatusTag = (status) => {
    const config = {
      paid: { color: 'green', text: 'Paid' },
      partial: { color: 'orange', text: 'Partial' },
      pending: { color: 'red', text: 'Pending' }
    }[status] || {};
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Invoice type tabs component
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

  // Table columns configuration
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
      render: (_, record) => {
        const name = record.businessId?.businessName || record.businessName;
        return <Tooltip title={name}><Text strong>{name}</Text></Tooltip>;
      }
    },
    {
      title: 'Customer',
      render: (_, record) => {
        const customer = record.businessId || {};
        const name = customer.businessName || record.customerName || 'N/A';
        return <Tooltip title={name}><Text>{name}</Text></Tooltip>;
      }
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      align: 'right',
      render: (amt) => <Text style={{ color: '#52c41a' }}>₹{(amt || 0).toFixed(2)}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'date',
      align: 'center',
      render: (date) => <Text>{date || 'N/A'}</Text>
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

  // Main component render
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
            <Button onClick={exportToExcel}>Export Excel</Button>
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
          scroll={{ x: true }}
        />
      </Card>

      {/* Invoice Details Modal */}
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
            <Descriptions.Item label="GSTIN" span={2}>{selectedInvoice.gstin || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Sub Total" span={2}>₹{selectedInvoice.totalAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
            <Descriptions.Item label="Tax Amount" span={2}>₹{selectedInvoice.taxAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
            <Descriptions.Item label="Discount" span={2}>₹{selectedInvoice.discountAmount?.toFixed(2) || '0.00'}</Descriptions.Item>
            <Descriptions.Item label="Grand Total" span={2}>₹{(selectedInvoice.totalAmount + (selectedInvoice.taxAmount || 0) - (selectedInvoice.discountAmount || 0)).toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>{getStatusTag(selectedInvoice.paymentStatus)}</Descriptions.Item>
            <Descriptions.Item label="Closed" span={2}>
              {selectedInvoice.isClosed ? <Tag color="red">Yes</Tag> : <Tag color="green">No</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Notes Drawer */}
      <NotesDrawer
        visible={notesDrawerVisible}
        onClose={() => setNotesDrawerVisible(false)}
        invoice={selectedInvoice}
        refreshInvoices={refreshInvoices}
      />

      {/* Payment History Drawer */}
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