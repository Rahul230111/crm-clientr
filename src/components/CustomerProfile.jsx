import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs, List, Typography, Spin, Card, Descriptions, Breadcrumb, Button,
  Empty, Table, Collapse, Tag, Statistic, Row, Col
} from 'antd';
import { ArrowLeftOutlined, FallOutlined, FormOutlined, DollarOutlined, SolutionOutlined, BookOutlined, DashboardOutlined } from '@ant-design/icons';
import axios from '../api/axios'; // Corrected: Importing axios directly

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for holding customer data and related records
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [payments, setPayments] = useState([]);

  // Effect to fetch all customer-related data on component mount or ID change
  useEffect(() => {
    setLoading(true);
    // Use Promise.all to fetch data concurrently for efficiency
    Promise.all([
      axios.get(`/api/accounts/${id}`), // Fetch customer details
      axios.get(`/api/quotations/business/${id}`), // Fetch quotations related to the business
      axios.get(`/api/invoices/business/${id}`), // Fetch invoices related to the business
      axios.get(`/api/accounts/${id}/followups`), // Fetch follow-ups for the customer
      axios.get(`/api/invoices/business/${id}/payments`) // Fetch payments for invoices related to the business
    ])
      .then(([cust, q, i, f, p]) => {
        setCustomer(cust.data);
        setQuotations(q.data || []); // Ensure array if data is null/undefined
        setInvoices(i.data || []);
        setFollowups(f.data || []);
        setPayments(p.data || []);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        // Optionally, show a notification to the user
        // notification.error({ message: 'Error', description: 'Failed to load customer data.' });
      })
      .finally(() => setLoading(false)); // Set loading to false once all promises settle
  }, [id]); // Rerun effect if customer ID changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        
        <Spin size="large" tip="Loading Customer Profile..." />
      </div>
    );
  }

  // Display 'Customer Not Found' if no customer data is returned
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

  // Sort follow-ups and notes by date in descending order
  const sortedFollowups = [...followups].sort(
    (a, b) => new Date(b.followupDate || b.date) - new Date(a.followupDate || a.date)
  );

  const sortedNotes = [...(customer.notes || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to format date
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
      return dateString; // Return original if parsing fails
    }
  };

  // Helper function to format the full address from multiple fields
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

  // Calculate dashboard statistics
  const totalInvoicesAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPendingAmount = totalInvoicesAmount - totalPaidAmount;

  return (
    
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <Button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center space-x-2"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      {/* Breadcrumb navigation */}
      <Breadcrumb
        className="mb-4 text-gray-600 mt-5 font-medium"
        items={[
          { title: 'Customers', href: '/customers' },
          { title: customer.businessName || 'Profile' },
        ]}
      />

      {/* Header with back button and title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        
        <Title level={2} className="text-gray-800 font-extrabold mb-0 text-center sm:text-left">
          {customer.businessName} Profile
        </Title>
      </div>

      {/* Customer Information Panel */}
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
                'blue' // Default color for other statuses
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

      {/* Dashboard Section (now outside of Tabs) */}
      {/* <Card
        title={<Title level={4} className="text-gray-800 font-bold mb-0 flex items-center space-x-2"><DashboardOutlined /><span>Summary Dashboard</span></Title>}
        className="shadow-xl rounded-xl mb-8 border-t-8 border-purple-600 transform hover:scale-100 transition duration-300 ease-in-out"
      >
        <div className="p-4 bg-gray-50 rounded-lg">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="shadow-lg rounded-xl border-l-8 border-blue-500 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <Statistic 
                  title={<Text strong className="text-gray-700">Total Quotations</Text>} 
                  value={quotations.length} 
                  valueStyle={{ color: '#ef7a1b', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="shadow-lg rounded-xl border-l-8 border-green-500 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <Statistic 
                  title={<Text strong className="text-gray-700">Total Invoices</Text>} 
                  value={invoices.length} 
                  valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="shadow-lg rounded-xl border-l-8 border-purple-500 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <Statistic 
                  title={<Text strong className="text-gray-700">Total Invoiced Amount</Text>} 
                  value={totalInvoicesAmount} 
                  precision={2} 
                  prefix="₹" 
                  valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card className="shadow-lg rounded-xl border-l-8 border-red-500 hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <Statistic 
                  title={<Text strong className="text-gray-700">Total Pending Amount</Text>} 
                  value={totalPendingAmount} 
                  precision={2} 
                  prefix="₹" 
                  valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Card> */}

      {/* Tabs for related data (now starting with Quotations) */}
      <Tabs 
        defaultActiveKey="1" // Default to Quotations since Dashboard is now a separate section
        className="bg-white p-4 rounded-xl shadow-xl"
        tabBarStyle={{ marginBottom: 24 }}
      >
        {/* Quotations Tab */}
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
                          'blue' // Default color for other statuses
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

        {/* Invoices Tab */}
        {/* <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <SolutionOutlined className="text-xl" />
              <span>Invoices ({invoices.length})</span>
            </span>
          }
          key="2"
        >
          {invoices.length === 0 ? (
            <Empty description="No invoices found for this customer." className="py-8" />
          ) : (
            <Collapse 
              accordion 
              className="shadow-md rounded-lg overflow-hidden"
              expandIconPosition="end"
            >
              {invoices.map((inv, idx) => (
                <Panel
                  header={
                    <div className="font-semibold text-lg flex justify-between items-center py-2">
                      <span className="text-gray-800">Invoice #{inv.invoiceNumber || 'N/A'}</span>
                      <span className="text-green-600 text-xl font-bold">{formatCurrency(inv.totalAmount)}</span>
                    </div>
                  }
                  key={inv._id || idx}
                  className="bg-white border-b border-gray-200 rounded-lg mb-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out"
                >
                  <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 2 }} className="mb-4 text-gray-700">
                    <Descriptions.Item label={<Text strong className="text-gray-600">Date</Text>}>{formatDate(inv.date)}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Due Date</Text>}>{formatDate(inv.dueDate)}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Status</Text>}>
                      <Tag 
                        color={
                          inv.paymentStatus === 'Paid' ? 'green' : 
                          inv.paymentStatus === 'Pending' ? 'orange' : 
                          inv.paymentStatus === 'Overdue' ? 'red' :
                          'blue' // Default color for other paymentStatuses
                        } 
                        className="rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {inv.paymentStatus || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Customer Name</Text>}>{customer.contactName || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">GSTIN</Text>}>{customer.gstNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label={<Text strong className="text-gray-600">Customer Address</Text>} span={2}>
                      {formatFullAddress(customer)}
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5} className="mt-6 mb-3 text-gray-800 font-bold">Items Invoiced</Title>
                  <Table
                    dataSource={inv.items || []}
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
        </TabPane> */}

        {/* Follow-ups Tab */}
        <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <FormOutlined className="text-xl" />
              <span>Follow-ups ({sortedFollowups.length})</span>
            </span>
          }
          key="3"
        >
          {sortedFollowups.length === 0 ? (
            <Empty description="No follow-ups found for this customer." className="py-8" />
          ) : (
            <List
              bordered
              dataSource={sortedFollowups}
              className="rounded-lg overflow-hidden shadow-md"
              renderItem={(item) => (
                <List.Item className="flex flex-col items-start bg-white p-5 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0">
                  <div className="w-full">
                    <div className="font-semibold text-gray-800 text-base mb-2 flex items-center">
                      <span className="mr-3 text-blue-500 text-xl"><BookOutlined /></span>
                      <Text strong>Date:</Text> <span className="ml-2">{formatDate(item.followupDate || item.date)}</span>
                    </div>
                    <div className="text-gray-800 mb-2 leading-relaxed text-base">
                      <Text strong>Note:</Text> {item.note || item.comment || 'No comment provided'}
                    </div>
                    {item.addedBy && (
                      <div className="text-sm text-gray-500 mt-3 border-t border-gray-100 pt-2">
                        Added by: <Text italic>{item.addedBy.name || item.addedBy.email || 'Unknown'}</Text>
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          )}
        </TabPane>

        {/* Payments Tab */}
        {/* <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <DollarOutlined className="text-xl" />
              <span>Payments ({payments.length})</span>
            </span>
          }
          key="4"
        >
          {payments.length === 0 ? (
            <Empty description="No payments found for this customer." className="py-8" />
          ) : (
            <List
              bordered
              dataSource={payments}
              className="rounded-lg overflow-hidden shadow-md"
              renderItem={(item) => (
                <List.Item className="flex items-center justify-between bg-white p-5 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0">
                  <div className="flex-grow flex items-center">
                    <Text strong className="text-green-600 text-xl mr-2">{formatCurrency(item.amount)}</Text>
                    <Text className="text-gray-700 text-base">via {item.method || 'N/A'}</Text>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <span className="block">{formatDate(item.date)}</span> 
                    <span className="block">by {item.addedBy || 'Unknown'}</span>
                  </div>
                </List.Item>
              )}
            />
          )}
        </TabPane> */}

        {/* Notes Tab */}
        <TabPane
          tab={
            <span className="flex items-center space-x-2 text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-200">
              <BookOutlined className="text-xl" />
              <span>Notes ({sortedNotes.length})</span>
            </span>
          }
          key="5"
        >
          {sortedNotes.length === 0 ? (
            <Empty description="No notes available for this customer." className="py-8" />
          ) : (
            <List
              bordered
              dataSource={sortedNotes}
              className="rounded-lg overflow-hidden shadow-md"
              renderItem={(item) => (
                <List.Item className="flex flex-col items-start bg-white p-5 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0">
                  <div className="w-full">
                    <div className="text-gray-800 text-base leading-relaxed mb-2">
                      <Text strong>Note:</Text> {item.text || 'No text provided'}
                    </div>
                    <div className="text-sm text-gray-500 mt-3 border-t border-gray-100 pt-2">
                      Added by: <Text italic>{item.author || item.addedBy?.name || item.addedBy?.email || 'Unknown'}</Text> | {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}
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
