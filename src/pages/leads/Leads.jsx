import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, Input, Button, Table, Tabs, Switch, Typography, Empty, Modal, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, MessageOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import BusinessAccountForm from './BusinessAccountForm';
import NotesDrawer from './NotesDrawer';

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
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = () => {
    setLoading(true);
    axios.get(API_URL)
      .then(res => {
        setAccounts(res.data);
        toast.success('Accounts loaded successfully');
      })
      .catch(() => {
        toast.error('Failed to load accounts. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSave = (values) => {
    setLoading(true);
    const promise = currentAccount?._id
      ? axios.put(`${API_URL}/${currentAccount._id}`, values)
      : axios.post(API_URL, values);

    promise
      .then(() => {
        toast.success(`Account ${currentAccount?._id ? 'updated' : 'created'} successfully!`);
        fetchAccounts();
      })
      .catch(() => {
        toast.error(`Failed to ${currentAccount?._id ? 'update' : 'create'} account. Please try again.`);
      })
      .finally(() => {
        setLoading(false);
        setFormVisible(false);
        setCurrentAccount(null);
      });
  };

  const handleEdit = (record) => {
    setCurrentAccount(record);
    setFormVisible(true);
  };

  const handleOpenNotesDrawer = (account) => {
    setSelectedAccount(account);
    setNotesDrawerVisible(true);
  };

  const handleStatusChange = (checked, record) => {
    setAccountToUpdate(record);
    setNewStatus(checked ? 'Active' : 'Inactive');
    setIsModalVisible(true);
  };

  const confirmStatusChange = () => {
    setLoading(true);
    const updated = { ...accountToUpdate, status: newStatus };
    axios.put(`${API_URL}/${accountToUpdate._id}`, updated)
      .then(() => {
        toast.success('Account status updated successfully!');
        fetchAccounts();
      })
      .catch(() => {
        toast.error('Failed to update status. Please try again.');
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoading(false);
      });
  };

  const filteredAccounts = accounts.filter(account => {
    const search = searchText.toLowerCase();
    return (
      account.businessName?.toLowerCase().includes(search) ||
      account.contactName?.toLowerCase().includes(search) ||
      account.email?.toLowerCase().includes(search)
    );
  });

  const activeAccounts = filteredAccounts.filter(a => a.status === 'Active');
  const inactiveAccounts = filteredAccounts.filter(a => a.status === 'Inactive');

  const typeTag = (type) => {
    switch (type) {
      case 'Hot':
        return <Tag color="red">Hot</Tag>;
      case 'Warm':
        return <Tag color="orange">Warm</Tag>;
      case 'Cold':
        return <Tag color="blue">Cold</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    { title: 'Sno.', render: (_, __, index) => index + 1, width: 60 },
    { title: 'Business Name', dataIndex: 'businessName' },
    { title: 'Contact Name', dataIndex: 'contactName' },
    { title: 'Email Id', dataIndex: 'email' },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => typeTag(type)
    },
    {
      title: 'Latest Note',
      render: (_, record) => {
        const lastNote = record.notes?.[record.notes.length - 1];
        return lastNote ? (
          <div>
            <small style={{ color: '#888' }}>{lastNote.timestamp}</small><br />
            {lastNote.text}
          </div>
        ) : <em>No notes</em>;
      }
    },
    {
      title: 'Status',
      render: (_, record) => (
        <span style={{ color: record.status === 'Inactive' ? 'red' : 'inherit' }}>
          <Switch
            checked={record.status === 'Active'}
            onChange={(checked) => handleStatusChange(checked, record)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
          <span style={{ marginLeft: 8 }}>{record.status}</span>
        </span>
      )
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} type="link" />
          <Button icon={<MessageOutlined />} onClick={() => handleOpenNotesDrawer(record)} type="link" />
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Business Accounts</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentAccount(null);
              setFormVisible(true);
            }}
          >
            Add Account
          </Button>
        </div>

        <Input
          placeholder="Search by Business Name, Contact Name or Email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 400, marginBottom: 16 }}
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Active Accounts (${activeAccounts.length})`} key="active">
            <Table
              columns={columns}
              dataSource={activeAccounts}
              pagination={false}
              rowKey="_id"
              loading={loading}
              locale={{ emptyText: <Empty description="No active accounts to show" /> }}
            />
          </TabPane>
          <TabPane tab={`Inactive Accounts (${inactiveAccounts.length})`} key="inactive">
            <Table
              columns={columns}
              dataSource={inactiveAccounts}
              pagination={false}
              rowKey="_id"
              loading={loading}
              locale={{ emptyText: <Empty description="No inactive accounts to show" /> }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        initialValues={currentAccount}
      />

      <Modal
        title="Confirm Status Change"
        open={isModalVisible}
        onOk={confirmStatusChange}
        onCancel={() => setIsModalVisible(false)}
        okText="Yes"
        cancelText="No"
        confirmLoading={loading}
      >
        <p>
          Are you sure you want to change the status of{' '}
          <strong>{accountToUpdate?.businessName}</strong> to{' '}
          <strong>{newStatus}</strong>?
        </p>
      </Modal>

      {selectedAccount && (
        <NotesDrawer
          visible={notesDrawerVisible}
          onClose={() => setNotesDrawerVisible(false)}
          account={selectedAccount}
          refreshAccounts={fetchAccounts}
        />
      )}
    </div>
  );
};

export default Leads;