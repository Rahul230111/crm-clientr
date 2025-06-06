import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
  Card, Input, Button, Table, Tabs, Switch, Typography,
  Empty, Modal, Tag, Popconfirm, Space
} from 'antd';
import {
  PlusOutlined, EditOutlined, SearchOutlined,
  MessageOutlined, PrinterOutlined, CustomerServiceOutlined, DeleteOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import BusinessAccountForm from './BusinessAccountForm';
import NotesDrawer from './NotesDrawer';
import FollowUpDrawer from './FollowUpDrawer';

const { Title } = Typography;
const { TabPane } = Tabs;
const API_URL = '/api/accounts';

const Leads = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, [activeTab]); // Refetch when tab changes

  const fetchAccounts = async () => {
    try {
      let endpoint = '';
      if (activeTab === 'active') {
        endpoint = `${API_URL}/leads/active`;
      } else if (activeTab === 'customers') {
        endpoint = `${API_URL}/customers`;
      } else {
        endpoint = API_URL; // All accounts, if you implement such a tab
      }

      const response = await axios.get(endpoint);
      setAccounts(response.data);
    } catch (error) {
      toast.error('Failed to fetch accounts.');
      console.error('Fetch accounts error:', error);
    }
  };

  const handleSaveAccount = async (values) => {
    try {
      if (currentAccount) {
        // Update existing account
        await axios.put(`${API_URL}/${currentAccount._id}`, values);
        toast.success('Account updated successfully!');
      } else {
        // Create new account
        await axios.post(API_URL, values);
        toast.success('Account created successfully!');
      }
      setFormVisible(false);
      fetchAccounts(); // Refresh the list
    } catch (error) {
      toast.error('Failed to save account.');
      console.error('Save account error:', error.response?.data || error.message);
    }
  };

  const showEditForm = (account) => {
    setCurrentAccount(account);
    setFormVisible(true);
  };

  const handleDeleteAccount = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Account deleted successfully (soft delete)!');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to delete account.');
      console.error('Delete account error:', error.response?.data || error.message);
    }
  };


  const showNotesDrawer = (account) => {
    setSelectedAccount(account);
    setNotesDrawerVisible(true);
  };

  const showFollowUpDrawer = (account) => {
    setSelectedAccount(account);
    setFollowUpDrawerVisible(true);
  };

  const handleStatusChange = (checked, account) => {
    setAccountToUpdate(account);
    setNewStatus(checked);
    setIsModalVisible(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      const updatedAccount = { ...accountToUpdate, isCustomer: newStatus };
      await axios.put(`${API_URL}/${accountToUpdate._id}`, updatedAccount);
      toast.success(`Account status changed to ${newStatus ? 'Customer' : 'Lead'}!`);
      fetchAccounts(); // Refresh list to reflect changes
    } catch (error) {
      toast.error('Failed to update account status.');
      console.error('Status update error:', error.response?.data || error.message);
    } finally {
      setIsModalVisible(false);
      setAccountToUpdate(null);
      setNewStatus(null);
    }
  };

  const handleCancelStatusChange = () => {
    setIsModalVisible(false);
    setAccountToUpdate(null);
    setNewStatus(null);
  };

  const generatePdf = async (account) => {
    const input = document.getElementById(`lead-${account._id}`);
    if (!input) {
      toast.error('PDF content not found.');
      return;
    }

    toast.loading('Generating PDF...', { id: 'pdf-toast' });

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`${account.businessName}-details.pdf`);
      toast.success('PDF generated!', { id: 'pdf-toast' });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error('Failed to generate PDF.', { id: 'pdf-toast' });
    }
  };


  const columns = [
    {
      title: 'S.No',
      key: 'sno',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Business Name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        record.businessName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Contact Name',
      dataIndex: 'contactName',
      key: 'contactName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile Number',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
    },
    {
      title: 'Lead Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Hot', value: 'Hot' },
        { text: 'Warm', value: 'Warm' },
        { text: 'Cold', value: 'Cold' },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
    },
    {
      title: 'Source Type',
      dataIndex: 'sourceType',
      key: 'sourceType',
      filters: [
        { text: 'Direct', value: 'Direct' },
        { text: 'Facebook Referral', value: 'Facebook Referral' },
        { text: 'Google Ads', value: 'Google Ads' },
        { text: 'Website', value: 'Website' },
        { text: 'Cold Call', value: 'Cold Call' },
        { text: 'Other', value: 'Other' },
      ],
      onFilter: (value, record) => record.sourceType?.indexOf(value) === 0,
    },
    {
      title: 'Referral Person',
      dataIndex: 'referralPersonName',
      key: 'referralPersonName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditForm(record)} />
          <Button icon={<MessageOutlined />} onClick={() => showNotesDrawer(record)} />
          <Button icon={<CustomerServiceOutlined />} onClick={() => showFollowUpDrawer(record)} />
          <Switch
            checkedChildren="Customer"
            unCheckedChildren="Lead"
            checked={record.isCustomer}
            onChange={(checked) => handleStatusChange(checked, record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this account?"
            onConfirm={() => handleDeleteAccount(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredAccounts = accounts.filter(account =>
    account.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
    account.contactName.toLowerCase().includes(searchText.toLowerCase())
  );


  return (
    <Card title={<Title level={2}>Manage Leads & Customers</Title>}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          placeholder="Search by business or contact name"
          efix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setCurrentAccount(null);
          setFormVisible(true);
        }}>
          Add New Account
        </Button>
      </div>

      <Tabs defaultActiveKey="active" onChange={setActiveTab}>
        <TabPane tab="Active Leads" key="active" />
        <TabPane tab="Customers" key="customers" />
      </Tabs>

      {filteredAccounts.length > 0 ? (
        <Table columns={columns} dataSource={filteredAccounts} rowKey="_id" scroll={{ x: 'max-content' }} />
      ) : (
        <Empty description="No accounts found." />
      )}

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSaveAccount}
        initialValues={currentAccount}
      />

      {selectedAccount && (
        <>
          <NotesDrawer
            visible={notesDrawerVisible}
            onClose={() => setNotesDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={fetchAccounts}
          />
          <FollowUpDrawer
            visible={followUpDrawerVisible}
            onClose={() => setFollowUpDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={fetchAccounts}
          />
        </>
      )}

      <Modal
        title="Change Account Status"
        visible={isModalVisible}
        onOk={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to change this account's status to {newStatus ? 'Customer' : 'Lead'}?</p>
      </Modal>

     
    </Card>
  );
};

export default Leads;