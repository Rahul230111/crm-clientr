import React, { useEffect, useState } from "react";
import {
  Card, Col, Row, Table, Tag, Typography, Spin, Select
} from "antd";
import { Pie } from "@ant-design/plots";
import axios from "../api/axios";
import "./Dashboard.css";

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [latestQuotations, setLatestQuotations] = useState([]);
  const [latestAccounts, setLatestAccounts] = useState([]);
  const [invoiceSummary, setInvoiceSummary] = useState({ total: 0, paid: 0, pending: 0 });
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [filteredFollowups, setFilteredFollowups] = useState([]);
  const [followUpFilter, setFollowUpFilter] = useState("today");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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
        applyFollowUpFilter("today", accRes.data); // Initial load
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const applyFollowUpFilter = (filterType, accounts) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const filtered = accounts
      .map((acc) => {
        let filteredFollowUps = [];

        if (filterType === "today") {
          filteredFollowUps = (acc.followUps || []).filter((f) =>
            f.followupDate?.startsWith(todayStr)
          );
        } else if (filterType === "upcoming") {
          filteredFollowUps = (acc.followUps || []).filter((f) =>
            new Date(f.followupDate) > today
          );
        } else if (filterType === "past") {
          filteredFollowUps = (acc.followUps || []).filter((f) =>
            new Date(f.followupDate) < today
          );
        }

        return {
          ...acc,
          followUps: filteredFollowUps,
        };
      })
      .filter((acc) => acc.followUps.length > 0);

    setFilteredFollowups(filtered);
  };

  const handleFollowUpFilterChange = (value) => {
    setFollowUpFilter(value);
    applyFollowUpFilter(value, allAccounts);
  };

  const renderStatusTag = (status) => (
    <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
  );

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
      render: (d) => new Date(d).toLocaleDateString(),
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
      render: (d) => new Date(d).toLocaleDateString(),
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
      render: (d) => new Date(d).toLocaleDateString(),
    },
  ];

  const columnsFollowups = [
    { title: "S.No", render: (_, __, i) => i + 1 },
    { title: "Business Name", dataIndex: "businessName" },
    {
      title: "Follow-up",
      render: (_, record) =>
        record.followUps[0]?.comment || record.followUps[0]?.note || "No comment",
    },
    {
      title: "Added By",
      render: (_, record) =>
        record.followUps[0]?.addedBy?.name ||
        record.followUps[0]?.addedBy?.email ||
        "Unknown",
    },
    {
      title: "Date",
      render: (_, record) =>
        new Date(record.followUps[0]?.followupDate).toLocaleDateString(),
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

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{followUpFilter.charAt(0).toUpperCase() + followUpFilter.slice(1)} Follow-ups</span>
                <Select
                  value={followUpFilter}
                  onChange={handleFollowUpFilterChange}
                  style={{ width: 180 }}
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
              dataSource={filteredFollowups}
              rowKey="_id"
              pagination={false}
              locale={{ emptyText: "No follow-ups in this category" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
