import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs, List, Typography, Spin, Card, Descriptions, Breadcrumb, Button,
  Empty, Table, Collapse
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from '../api/axios';

const { TabPane } = Tabs;
const { Title } = Typography;
const { Panel } = Collapse;

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`/api/accounts/${id}`),
      axios.get(`/api/quotations/business/${id}`),
      axios.get(`/api/invoices/business/${id}`),
      axios.get(`/api/accounts/${id}/followups`),
      axios.get(`/api/invoices/business/${id}/payments`)
    ])
      .then(([cust, q, i, f, p]) => {
        setCustomer(cust.data);
        setQuotations(q.data || []);
        setInvoices(i.data || []);
        setFollowups(f.data || []);
        setPayments(p.data || []);
      })
      .catch((err) => console.error('Failed to load data', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 24 }}><Spin size="large" /></div>;

  if (!customer) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/customers')}>Back to Customers</Button>
        <Title level={3} style={{ marginTop: 16 }}>Customer Not Found</Title>
        <Empty description="No data found for this customer ID." />
      </div>
    );
  }

  const sortedFollowups = [...followups].sort(
    (a, b) => new Date(b.followupDate || b.date) - new Date(a.followupDate || a.date)
  );

  const sortedNotes = [...(customer.notes || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div style={{ padding: 24 }}>
      <Breadcrumb
        items={[
          { title: 'Customers', href: '/customers' },
          { title: customer.businessName || 'Profile' },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{customer.businessName} Profile</Title>
      </div>

      <Card style={{ margin: '24px 0' }}>
        <p><strong>Business Name:</strong> {customer.businessName}</p>
        <p><strong>GSTIN:</strong> {customer.gstNumber || 'N/A'}</p>
        <p><strong>Customer Name:</strong> {customer.contactName}</p>
        <p><strong>Customer Address:</strong> 
          {Array.isArray(customer.addressLines)
            ? customer.addressLines.join(', ')
            : customer.addressLines || 'N/A'}
        </p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phoneNumber}</p>
        <p><strong>Status:</strong> {customer.status}</p>
        <p><strong>Type:</strong> {customer.type}</p>
      </Card>

      <Tabs defaultActiveKey="1">
        <TabPane tab={`Quotations (${quotations.length})`} key="1">
          {quotations.length === 0 ? <Empty description="No quotations found" /> : (
            <Collapse accordion>
              {quotations.map((q, idx) => (
                <Panel
                  header={`#${q.quotationNumber} - ₹${q.totalAmount} - ${q.date}`}
                  key={idx}
                >
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Quotation Number">#{q.quotationNumber}</Descriptions.Item>
                    <Descriptions.Item label="Date">{q.date}</Descriptions.Item>
                    <Descriptions.Item label="Business Name">{q.businessName}</Descriptions.Item>
                    <Descriptions.Item label="Customer Name">{q.contactName}</Descriptions.Item>
                    <Descriptions.Item label="GSTIN">{q.gstNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Business Info">{q.businessInfo || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Customer Address" span={2}>
                      {Array.isArray(q.customerAddress)
                        ? q.customerAddress.join(', ')
                        : q.customerAddress || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount" span={2}>
                      <strong style={{ color: 'green' }}>₹{Number(q.totalAmount).toFixed(2)}</strong>
                    </Descriptions.Item>
                  </Descriptions>

                  <Typography.Title level={5} style={{ marginTop: 16 }}>Items</Typography.Title>
                  <Table
                    dataSource={q.items || []}
                    columns={[
                      { title: 'Description', dataIndex: 'description' },
                      { title: 'HSN/SAC', dataIndex: 'hsn' },
                      { title: 'Qty', dataIndex: 'quantity' },
                      {
                        title: 'Rate (₹)',
                        dataIndex: 'rate',
                        render: val => `₹${Number(val).toFixed(2)}`
                      },
                      {
                        title: 'Amount (₹)',
                        dataIndex: 'amount',
                        render: val => `₹${Number(val).toFixed(2)}`
                      }
                    ]}
                    pagination={false}
                    rowKey={(_, i) => i}
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </TabPane>

        <TabPane tab={`Invoices (${invoices.length})`} key="2">
          {invoices.length === 0 ? <Empty description="No invoices found" /> : (
            <Collapse accordion>
              {invoices.map((inv, idx) => (
                <Panel header={`#${inv.invoiceNumber} - ₹${inv.totalAmount} - ${inv.date}`} key={idx}>
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Invoice Number">#{inv.invoiceNumber}</Descriptions.Item>
                    <Descriptions.Item label="Date">{inv.date}</Descriptions.Item>
                    <Descriptions.Item label="Customer Name">{inv.contactName}</Descriptions.Item>
                    <Descriptions.Item label="GSTIN">{inv.gstNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Customer Address" span={2}>
                      {Array.isArray(inv.customerAddress)
                        ? inv.customerAddress.join(', ')
                        : inv.customerAddress || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Amount" span={2}>
                      <strong style={{ color: 'green' }}>₹{Number(inv.totalAmount).toFixed(2)}</strong>
                    </Descriptions.Item>
                  </Descriptions>

                  <Typography.Title level={5} style={{ marginTop: 16 }}>Items</Typography.Title>
                  <Table
                    dataSource={inv.items || []}
                    columns={[
                      { title: 'Description', dataIndex: 'description' },
                      { title: 'HSN/SAC', dataIndex: 'hsn' },
                      { title: 'Qty', dataIndex: 'quantity' },
                      {
                        title: 'Rate (₹)',
                        dataIndex: 'rate',
                        render: val => `₹${Number(val).toFixed(2)}`
                      },
                      {
                        title: 'Amount (₹)',
                        dataIndex: 'amount',
                        render: val => `₹${Number(val).toFixed(2)}`
                      }
                    ]}
                    pagination={false}
                    rowKey={(_, i) => i}
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </TabPane>

        <TabPane tab={`Follow-ups (${sortedFollowups.length})`} key="3">
          <List
            bordered
            dataSource={sortedFollowups}
            locale={{ emptyText: 'No follow-ups found' }}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ fontWeight: 'bold', color: '#555' }}>
                    📅 {item.followupDate || item.date
                      ? new Date(item.followupDate || item.date).toLocaleDateString()
                      : 'No date'}
                  </div>
                  <div style={{ color: '#333', marginTop: 4 }}>
                    📝 {item.note || item.comment || 'No comment provided'}
                  </div>
                  {item.addedBy && (
                    <div style={{ marginTop: 4, fontSize: 12, color: '#888' }}>
                      Added by: {item.addedBy.name || item.addedBy.email || 'Unknown'}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab={`Payments (${payments.length})`} key="4">
          <List
            bordered
            dataSource={payments}
            locale={{ emptyText: 'No payments found' }}
            renderItem={(item) => (
              <List.Item>
                ₹{item.amount} via {item.method} — {item.date} — {item.addedBy}
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab={`Notes (${sortedNotes.length})`} key="5">
          <List
            bordered
            dataSource={sortedNotes}
            locale={{ emptyText: 'No notes available' }}
            renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ color: '#333' }}>{item.text}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    {item.author || item.addedBy?.name || item.addedBy?.email || 'Unknown'} | {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;
