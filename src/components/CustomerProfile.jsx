import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs, List, Typography, Spin, Card, Descriptions, Breadcrumb, Button,
  Empty, Table, Collapse, Tag, Statistic, Row, Col
} from 'antd';
import { ArrowLeftOutlined, FallOutlined, FormOutlined, DollarOutlined, SolutionOutlined, BookOutlined, DashboardOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from '../api/axios';
import './CustomerProfile.css'; // Make sure this import is present

const { TabPane } = Tabs;
const { Title, Text } = Typography;
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
      .catch((err) => {
        console.error('Failed to load data:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" tip="Loading Customer Profile..." />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-lg m-6">
        <Button
          className="mb-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/customers')}
        >
          Back to Customers
        </Button>
        <Title level={3} className="mt-4 text-center text-gray-700">Customer Not Found</Title>
        <Empty
          description="No data found for this customer ID. It might not exist or there was an issue fetching it."
          className="mt-8"
        />
      </div>
    );
  }

  const combinedHistory = [
    ...(followups.map(item => ({ ...item, type: 'Follow-up', date: item.followupDate || item.date }))),
    ...(customer.notes || []).map(item => ({ ...item, type: 'Note', date: item.timestamp }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString;
    }
  };

  const formatFullAddress = (addressObj) => {
    const addressParts = [];
    if (addressObj.addressLine1) addressParts.push(addressObj.addressLine1);
    if (addressObj.addressLine2) addressParts.push(addressObj.addressLine2);
    if (addressObj.addressLine3) addressParts.push(addressObj.addressLine3);
    if (addressObj.city) addressParts.push(addressObj.city);
    if (addressObj.state) addressParts.push(addressObj.state);
    if (addressObj.pincode) addressParts.push(addressObj.pincode);
    if (addressObj.country) addressParts.push(addressObj.country);

    return addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
  };

  const totalInvoicesAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPendingAmount = totalInvoicesAmount - totalPaidAmount;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center space-x-2 customer-profile-back-button" // Added custom class
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Back
      </Button>
      <Breadcrumb
        className="mb-4 text-gray-600 mt-5 font-medium"
        items={[
          { title: 'Customers', href: '/customers' },
          { title: customer.businessName || 'Profile' },
        ]}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <Title level={2} className="text-gray-800 font-extrabold mb-0 text-center sm:text-left text-gradient-blue-purple"> {/* Added custom class */}
          {customer.businessName} Profile
        </Title>
      </div>

      <Card
        title={<Title level={4} className="text-gray-800 font-bold mb-0">Customer Details</Title>}
        className="shadow-xl rounded-xl mb-8 border-t-8 border-blue-600 transform hover:scale-100 transition duration-300 ease-in-out"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 2, lg: 3 }} size="middle" className="text-gray-700">
          <Descriptions.Item label={<Text strong className="text-gray-600">Business Name</Text>}>
            <Text strong className="text-gray-900">{customer.businessName || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">GSTIN</Text>}>{customer.gstNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Customer Name</Text>}>{customer.contactName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Email</Text>}>{customer.email || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Phone Number</Text>}>{customer.phoneNumber || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Status</Text>}>
            <Tag
              color={
                customer.status === 'Active' ? 'green' :
                  customer.status === 'Inactive' ? 'red' :
                    'blue'
              }
              className="rounded-full px-3 py-1 text-sm font-medium">
              {customer.status || 'N/A'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Type</Text>}>{customer.type || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Customer Address</Text>} span={3}>
            {formatFullAddress(customer)}
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Created At</Text>}>
            {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<Text strong className="text-gray-600">Last Updated</Text>}>
            {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey="1"
        className="bg-white p-4 rounded-xl shadow-xl"
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <FallOutlined className="text-xl" />
              <span>Quotations ({quotations.length})</span>
            </span>
          }
          key="1"
        >
          {quotations.length === 0 ? (
            <Empty description="No quotations found for this customer." className="py-8" />
          ) : (
            <Collapse
              accordion
              className="shadow-md rounded-lg overflow-hidden"
              expandIconPosition="end"
            >
              {quotations.map((q, idx) => (
                <Panel
                  header={
                    <div className="font-semibold text-lg flex justify-between items-center py-2">
                      <span className="text-gray-800">Quotation #{q.quotationNumber || 'N/A'}</span>
                      <span className="text-green-600 text-xl font-bold">{formatCurrency(q.totalAmount)}</span>
                    </div>
                  }
                  key={q._id || idx}
                  className="bg-white border-b border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
                >
                  <Descriptions bordered column={{ xs: 1, sm: 2, md: 2 }} size="small" className="mb-4 text-gray-700">
                    <Descriptions.Item label={<Text strong className="text-gray-600">Date</Text>}>{formatDate(q.date)}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Status</Text>}>
                      <Tag
                        color={
                          q.status === 'Approved' ? 'green' :
                            q.status === 'Pending' ? 'orange' :
                              q.status === 'Rejected' ? 'red' :
                                'blue'
                        }
                        className="rounded-full px-3 py-1 text-sm font-medium">
                        {q.status || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Customer Name</Text>}>{customer.contactName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">GSTIN</Text>}>{customer.gstNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Customer Address</Text>} span={2}>
                      {formatFullAddress(customer)}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} className="mt-6 mb-3 text-gray-800 font-bold">Items Quoted</Title>
                  <Table
                    dataSource={q.items || []}
                    columns={[
                      { title: 'Product Name', dataIndex: 'productName', key: 'productName', render: text => text || 'N/A' },
                      { title: 'Description', dataIndex: 'description', key: 'description' },
                      { title: 'HSN/SAC', dataIndex: 'hsn', key: 'hsn' },
                      { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
                      {
                        title: 'Rate (₹)',
                        dataIndex: 'rate',
                        key: 'rate',
                        render: val => formatCurrency(val)
                      },
                      {
                        title: 'Amount (₹)',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: val => formatCurrency(val)
                      }
                    ]}
                    pagination={false}
                    rowKey={(_, i) => i}
                    size="small"
                    className="border border-gray-200 rounded-md overflow-hidden shadow-sm"
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </TabPane>

        <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <HistoryOutlined className="text-xl" />
              <span>History ({combinedHistory.length})</span>
            </span>
          }
          key="4"
        >
          {combinedHistory.length === 0 ? (
            <Empty description="No follow-ups or notes found for this customer." className="py-8" />
          ) : (
            <List
              bordered
              dataSource={combinedHistory}
              className="rounded-lg overflow-hidden shadow-md"
              renderItem={(item) => (
                <List.Item className="flex flex-col items-start bg-white p-5 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0 customer-profile-list-item-hover"> {/* Added custom class */}
                  <div className="w-full">
                    <div className="font-semibold text-gray-800 text-base mb-2 flex items-center">
                      <span className="mr-3 text-blue-500 text-xl">
                        {item.type === 'Follow-up' ? <FormOutlined /> : <BookOutlined />}
                      </span>
                      <Text strong>{item.type}:</Text> <span className="ml-2">{item.text || item.note || item.comment || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-3 border-t border-gray-100 pt-2">
                      Added by: <Text italic>{item.addedBy?.name || item.addedBy?.email || item.author || 'Unknown'}</Text> | {formatDate(item.date)}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerProfile;