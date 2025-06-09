import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Table, Tag, Typography, Spin, Select, Modal, Form, Input, DatePicker, message
} from "antd";
import { Pie } from "@ant-design/plots";
import axios from "../api/axios";
import "./Dashboard.css";
import dayjs from 'dayjs'; // Import dayjs for DatePicker compatibility

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Dashboard = () => {
  const [latestQuotations, setLatestQuotations] = useState([]);
  const [latestAccounts, setLatestAccounts] = useState([]);
  const [invoiceSummary, setInvoiceSummary] = useState({ total: 0, paid: 0, pending: 0 });
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [allAccountFollowUps, setAllAccountFollowUps] = useState([]);
  const [allQuotationFollowUps, setAllQuotationFollowUps] = useState([]);
  const [allInvoiceFollowUps, setAllInvoiceFollowUps] = useState([]);

  const [filteredAccountFollowups, setFilteredAccountFollowups] = useState([]);
  const [filteredQuotationFollowups, setFilteredQuotationFollowups] = useState([]);
  const [filteredInvoiceFollowups, setFilteredInvoiceFollowups] = useState([]);

  const [followUpFilter, setFollowUpFilter] = useState("today");

  // State for the Edit Follow-up Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [editForm] = Form.useForm(); // Form instance for Ant Design Form

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      const [quotRes, accRes, invRes] = await Promise.all([
        axios.get("/api/quotations"),
        axios.get("/api/accounts"),
        axios.get("/api/invoices"),
      ]);

      setLatestQuotations(quotRes.data.slice(0, 5));
      setLatestAccounts(accRes.data.slice(0, 5));
      setInvoiceDetails(invRes.data);

      const paidTotal = invRes.data
        .filter((inv) => inv.paymentStatus === "paid")
        .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

      const allTotal = invRes.data.reduce(
        (sum, inv) => sum + (inv.totalAmount || 0), 0
      );

      const pending = allTotal - paidTotal;
      setInvoiceSummary({ total: allTotal, paid: paidTotal, pending });

      setAllAccounts(accRes.data);

      await fetchAllFollowUps(quotRes.data, accRes.data, invRes.data);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      message.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFollowUps = async (quotations, accounts, invoices) => {
    // Account Follow-ups
    const accountFollowUpPromises = accounts.map(async (account) => {
      try {
        const res = await axios.get(`/api/accounts/${account._id}/followups`);
        return res.data.map((f, index) => ({
          ...f,
          type: 'account',
          parentName: account.businessName,
          parentId: account._id,
          followupDate: f.date,
          originalIndex: index, // Store original index for PUT request
        }));
      } catch (error) {
        console.error(`Failed to fetch follow-ups for account ${account.businessName} (${account._id}):`, error);
        return [];
      }
    });

    // Quotation Follow-ups
    const quotationFollowUpPromises = quotations.map(async (quotation) => {
      try {
        const res = await axios.get(`/api/quotations/${quotation._id}/followups`);
        return res.data.map((f, index) => ({
          ...f,
          type: 'quotation',
          parentName: quotation.businessName,
          parentId: quotation._id,
          followupDate: f.date,
          originalIndex: index, // Store original index for PUT request
        }));
      } catch (error) {
        console.error(`Failed to fetch follow-ups for quotation ${quotation.quotationNumber} (${quotation._id}):`, error);
        return [];
      }
    });

    // Invoice Follow-ups
    const invoiceFollowUpPromises = invoices.map(async (invoice) => {
      try {
        const res = await axios.get(`/api/invoices/${invoice._id}/followups`);
        return res.data.map((f, index) => ({
          ...f,
          type: 'invoice',
          parentName: invoice.businessName,
          parentId: invoice._id,
          followupDate: f.date,
          originalIndex: index, // Store original index for PUT request
        }));
      } catch (error) {
        console.error(`Failed to fetch follow-ups for invoice ${invoice.invoiceNumber || invoice.proformaNumber} (${invoice._id}):`, error);
        return [];
      }
    });

    const allAccountFUs = (await Promise.all(accountFollowUpPromises)).flat();
    const allQuotationFUs = (await Promise.all(quotationFollowUpPromises)).flat();
    const allInvoiceFUs = (await Promise.all(invoiceFollowUpPromises)).flat();

    setAllAccountFollowUps(allAccountFUs);
    setAllQuotationFollowUps(allQuotationFUs);
    setAllInvoiceFollowUps(allInvoiceFUs);

    // Apply initial filter "today" to all fetched follow-ups
    applyFollowUpFilter(followUpFilter, allAccountFUs, setFilteredAccountFollowups);
    applyFollowUpFilter(followUpFilter, allQuotationFUs, setFilteredQuotationFollowups);
    applyFollowUpFilter(followUpFilter, allInvoiceFUs, setFilteredInvoiceFollowups);
  };

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const applyFollowUpFilter = (filterType, followUps, setFilteredState) => {
    const today = dayjs().startOf('day'); // Use dayjs for consistency

    const filtered = followUps.filter((f) => {
      if (!f.followupDate) return false;

      const followupDate = dayjs(f.followupDate).startOf('day');

      if (filterType === "today") {
        return followupDate.isSame(today, 'day');
      } else if (filterType === "upcoming") {
        return followupDate.isAfter(today, 'day');
      } else if (filterType === "past") {
        return followupDate.isBefore(today, 'day');
      }
      return false;
    });
    setFilteredState(filtered);
  };

  const handleFollowUpFilterChange = (value) => {
    setFollowUpFilter(value);
    applyFollowUpFilter(value, allAccountFollowUps, setFilteredAccountFollowups);
    applyFollowUpFilter(value, allQuotationFollowUps, setFilteredQuotationFollowups);
    applyFollowUpFilter(value, allInvoiceFollowUps, setFilteredInvoiceFollowups);
  };

  const renderStatusTag = (status) => (
    <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
  );

  // --- Follow-up Edit Modal Handlers ---
  const showEditModal = (followUp) => {
    setEditingFollowUp(followUp);
    editForm.setFieldsValue({
      note: followUp.note,
      followupDate: followUp.followupDate ? dayjs(followUp.followupDate) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleEditModalCancel = () => {
    setIsEditModalVisible(false);
    setEditingFollowUp(null);
    editForm.resetFields();
  };

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields();
      const { note, followupDate } = values;

      if (!editingFollowUp) return;

      const { type, parentId, originalIndex } = editingFollowUp;

      let apiUrl = '';
      if (type === 'account') {
        apiUrl = `/api/accounts/${parentId}/followups/${originalIndex}`;
      } else if (type === 'quotation') {
        apiUrl = `/api/quotations/${parentId}/followups/${originalIndex}`;
      } else if (type === 'invoice') {
        apiUrl = `/api/invoices/${parentId}/followups/${originalIndex}`;
      } else {
        message.error("Unknown follow-up type.");
        return;
      }

      await axios.put(apiUrl, {
        date: followupDate ? followupDate.format('YYYY-MM-DD') : null, // Send date in 'YYYY-MM-DD' format
        note: note,
      });

      message.success("Follow-up updated successfully!");
      setIsEditModalVisible(false);
      setEditingFollowUp(null);
      editForm.resetFields();
      fetchAllDashboardData(); // Refresh all dashboard data to get updated follow-ups
    } catch (error) {
      console.error("Failed to update follow-up:", error);
      message.error("Failed to update follow-up. Please try again.");
    }
  };

  // Unified follow-up columns
  const columnsFollowups = [
    { title: "S.No", render: (_, __, i) => i + 1 },
    { title: "Parent Type", dataIndex: "type", render: (type) => type.charAt(0).toUpperCase() + type.slice(1) },
    { title: "Business Name", dataIndex: "parentName" },
    {
      title: "Follow-up Comment",
      dataIndex: "note",
      render: (note) => note || "No comment",
    },
    {
      title: "Added By",
      dataIndex: "addedBy",
      render: (addedBy) => addedBy?.name || addedBy?.email || "Unknown",
    },
    {
      title: "Date",
      dataIndex: "followupDate",
      render: (d) => d ? dayjs(d).toDate().toLocaleDateString() : 'N/A',
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a onClick={() => showEditModal(record)}>Edit</a>
      ),
    },
  ];

  const columnsAccounts = [
    { title: "S.No", render: (_, __, i) => i + 1 },
    { title: "Business Name", dataIndex: "businessName" },
    { title: "Status", dataIndex: "status", render: renderStatusTag },
    {
      title: "Notes",
      render: (_, record) =>
        record.notes?.length ? record.notes.at(-1).text : "No notes",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (d) => d ? new Date(d).toLocaleDateString() : 'N/A',
    },
  ];

  const columnsQuotations = [
    { title: "S.No", render: (_, __, i) => i + 1 },
    { title: "Business Name", dataIndex: "businessName" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => <Tag>{status || "N/A"}</Tag>,
    },
    {
      title: "Notes",
      render: (_, record) =>
        record.notes?.length ? record.notes.at(-1).text : "No notes",
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => d ? new Date(d).toLocaleDateString() : 'N/A',
    },
  ];

  const columnsInvoices = [
    { title: "S.No", render: (_, __, i) => i + 1 },
    { title: "Invoice No.", dataIndex: "invoiceNumber" },
    { title: "Business", dataIndex: "businessName" },
    {
      title: "Status",
      dataIndex: "paymentStatus",
      render: (status) => (
        <Tag color={status === "paid" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (amt) => `₹${amt?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => d ? new Date(d).toLocaleDateString() : 'N/A',
    },
  ];

  const pieData = [
    { type: "Paid", value: invoiceSummary.paid },
    { type: "Pending", value: invoiceSummary.pending },
  ];

  const pieConfig = {
    appendPadding: 10,
    data: pieData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    height: 250,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-50%",
      content: ({ type, value }) => `${type}: ₹${value.toFixed(2)}`,
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
    legend: { position: "bottom" },
    color: ["#52c41a", "#faad14"],
  };

  if (loading) return <Spin fullscreen />;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Total Invoice Amount" bordered>
            <Title level={3} style={{ color: "#1890ff" }}>
              ₹{invoiceSummary.total.toFixed(2)}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card title="Paid Amount" bordered>
            <Title level={3} style={{ color: "#52c41a" }}>
              ₹{invoiceSummary.paid.toFixed(2)}
            </Title>
          </Card>
        </Col>
        <Col xs={24} sm={24} lg={8}>
          <Card title="Pending Amount" bordered>
            <Title level={3} style={{ color: "#faad14" }}>
              ₹{invoiceSummary.pending.toFixed(2)}
            </Title>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Invoice Summary Chart" bordered>
            <div className="chart-wrapper">
              <Pie {...pieConfig} />
            </div>
            <div className="invoice-summary-info">
              <p><strong>Total Invoices:</strong> {invoiceDetails.length}</p>
              <p><strong>Quotations:</strong> {latestQuotations.length}</p>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Latest Business Leads"
            bordered
            extra={<a href="/leads">View All</a>}
          >
            <Table
              columns={columnsAccounts}
              dataSource={latestAccounts}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Latest Quotations"
            bordered
            extra={<a href="/quotation">View All</a>}
          >
            <Table
              columns={columnsQuotations}
              dataSource={latestQuotations}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Latest Invoices"
            bordered
            extra={<a href="/invoice">View All</a>}
          >
            <Table
              columns={columnsInvoices}
              dataSource={invoiceDetails.slice(0, 5)}
              rowKey="_id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Follow-up sections - now split by type */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Account Follow-ups Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                <span>{followUpFilter.charAt(0).toUpperCase() + followUpFilter.slice(1)} Account Follow-ups</span>
                <Select
                  value={followUpFilter}
                  onChange={handleFollowUpFilterChange}
                  style={{ width: 120 }}
                >
                  <Option value="today">Today</Option>
                  <Option value="upcoming">Upcoming</Option>
                  <Option value="past">Past</Option>
                </Select>
              </div>
            }
            bordered
            extra={<a href="/leads">View All Leads</a>}
          >
            <Table
              columns={columnsFollowups}
              dataSource={filteredAccountFollowups}
              rowKey={(record, index) => `${record.parentId || 'no-parent'}-${record.originalIndex || index}`}
              pagination={false}
              locale={{ emptyText: "No account follow-ups in this category" }}
            />
          </Card>
        </Col>

        {/* Quotation Follow-ups Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                <span>{followUpFilter.charAt(0).toUpperCase() + followUpFilter.slice(1)} Quotation Follow-ups</span>
                <Select
                  value={followUpFilter}
                  onChange={handleFollowUpFilterChange}
                  style={{ width: 120 }}
                >
                  <Option value="today">Today</Option>
                  <Option value="upcoming">Upcoming</Option>
                  <Option value="past">Past</Option>
                </Select>
              </div>
            }
            bordered
            extra={<a href="/quotation">View All Quotations</a>}
          >
            <Table
              columns={columnsFollowups}
              dataSource={filteredQuotationFollowups}
              rowKey={(record, index) => `${record.parentId || 'no-parent'}-${record.originalIndex || index}`}
              pagination={false}
              locale={{ emptyText: "No quotation follow-ups in this category" }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Invoice Follow-ups Card */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
                <span>{followUpFilter.charAt(0).toUpperCase() + followUpFilter.slice(1)} Invoice Follow-ups</span>
                <Select
                  value={followUpFilter}
                  onChange={handleFollowUpFilterChange}
                  style={{ width: 120 }}
                >
                  <Option value="today">Today</Option>
                  <Option value="upcoming">Upcoming</Option>
                  <Option value="past">Past</Option>
                </Select>
              </div>
            }
            bordered
            extra={<a href="/invoice">View All Invoices</a>}
          >
            <Table
              columns={columnsFollowups}
              dataSource={filteredInvoiceFollowups}
              rowKey={(record, index) => `${record.parentId || 'no-parent'}-${record.originalIndex || index}`}
              pagination={false}
              locale={{ emptyText: "No invoice follow-ups in this category" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Edit Follow-up Modal */}
      <Modal
        title={`Edit Follow-up for ${editingFollowUp?.parentName || ''} (${editingFollowUp?.type.charAt(0).toUpperCase() + editingFollowUp?.type.slice(1) || ''})`}
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="note"
            label="Follow-up Comment"
            rules={[{ required: true, message: 'Please enter a follow-up comment!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="followupDate"
            label="Follow-up Date"
            rules={[{ required: true, message: 'Please select a follow-up date!' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;