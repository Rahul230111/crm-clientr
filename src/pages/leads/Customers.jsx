import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import {
  Card, Input, Button, Table, Tabs, Typography, Empty, Tag, Switch, Modal
} from 'antd';
import {
  SearchOutlined, EditOutlined, MessageOutlined, EyeOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import BusinessAccountForm from './BusinessAccountForm';
import NotesDrawer from './NotesDrawer';
import FollowUpDrawer from './FollowUpDrawer';

const { Title } = Typography;
const { TabPane } = Tabs;

const Customers = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate();

  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get('/api/accounts/customers')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setCustomers(data);
        toast.success('Customers loaded');
      })
      .catch(() => {
        toast.error('Failed to load customers');
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEdit = (record) => {
    setCurrentCustomer(record);
    setFormVisible(true);
  };

  const handleSave = (values) => {
    setLoading(true);
    const request = currentCustomer?._id
      ? axios.put(`/api/accounts/${currentCustomer._id}`, values)
      : axios.post('/api/accounts', values);

    request
      .then(() => {
        toast.success(`Customer ${currentCustomer?._id ? 'updated' : 'created'} successfully`);
        fetchCustomers();
      })
      .catch(() => {
        toast.error(`Failed to ${currentCustomer?._id ? 'update' : 'create'} customer`);
      })
      .finally(() => {
        setFormVisible(false);
        setCurrentCustomer(null);
        setLoading(false);
      });
  };

  const handleStatusChange = (checked, record) => {
    setAccountToUpdate(record);
    setNewStatus(checked ? 'Active' : 'Inactive');
    setIsModalVisible(true);
  };

  const confirmStatusChange = () => {
    setLoading(true);
    const updated = { ...accountToUpdate, status: newStatus };
    axios
      .put(`/api/accounts/${accountToUpdate._id}`, updated)
      .then(() => {
        toast.success('Status updated');
        fetchCustomers();
      })
      .catch(() => {
        toast.error('Failed to update status');
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoading(false);
      });
  };

  const handleDelete = (record) => {
    setCustomerToDelete(record);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (!customerToDelete?._id) return;
    setLoading(true);
    axios
      .delete(`/api/accounts/${customerToDelete._id}`)
      .then(() => {
        toast.success('Customer deleted successfully');
        fetchCustomers();
      })
      .catch(() => {
        toast.error('Failed to delete customer');
      })
      .finally(() => {
        setDeleteModalVisible(false);
        setCustomerToDelete(null);
        setLoading(false);
      });
  };

  const handleOpenNotesDrawer = (account) => {
    setSelectedAccount(account);
    setNotesDrawerVisible(true);
  };

  const handleOpenFollowUpDrawer = (account) => {
    setSelectedAccount(account);
    setFollowUpDrawerVisible(true);
  };

  const goToCustomerProfile = (record) => {
    navigate(`/customers/${record._id}`);
  };

  const filtered = customers.filter((account) => {
    const search = searchText.toLowerCase();
    return (
      account.businessName?.toLowerCase().includes(search) ||
      account.contactName?.toLowerCase().includes(search) ||
      account.email?.toLowerCase().includes(search)
    );
  });

  const active = filtered.filter((a) => a.status === 'Active');
  const inactive = filtered.filter((a) => a.status === 'Inactive');

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
    { title: 'Sno.', render: (_, __, i) => i + 1, width: 60 },
    { title: 'Business Name', dataIndex: 'businessName' },
    { title: 'Contact Name', dataIndex: 'contactName' },
    { title: 'Email Id', dataIndex: 'email' },
    { title: 'Type', dataIndex: 'type', render: typeTag },
    {
      title: 'Latest Note',
      render: (_, record) => {
        const note = record.notes?.[record.notes.length - 1];
        return note ? (
          <div>
            <small style={{ color: '#888' }}>{note.timestamp}</small><br />
            {note.text}
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
          <Button icon={<EyeOutlined />} onClick={() => goToCustomerProfile(record)} type="link">View</Button>
          <Button onClick={() => handleOpenFollowUpDrawer(record)} type="link">Follow-ups</Button>
          <Button danger onClick={() => handleDelete(record)} type="link">Delete</Button>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Customers</Title>
        </div>

        <Input
          placeholder="Search by Business Name, Contact Name or Email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400, marginBottom: 16 }}
        />

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`Active (${active.length})`} key="active">
            <Table
              columns={columns}
              dataSource={active}
              rowKey="_id"
              pagination={false}
              loading={loading}
              locale={{ emptyText: <Empty description="No active customers" /> }}
            />
          </TabPane>
          <TabPane tab={`Inactive (${inactive.length})`} key="inactive">
            <Table
              columns={columns}
              dataSource={inactive}
              rowKey="_id"
              pagination={false}
              loading={loading}
              locale={{ emptyText: <Empty description="No inactive customers" /> }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        initialValues={currentCustomer}
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
          Are you sure you want to change the status of <strong>{accountToUpdate?.businessName}</strong> to <strong>{newStatus}</strong>?
        </p>
      </Modal>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <p>
          Are you sure you want to delete <strong>{customerToDelete?.businessName}</strong>?
        </p>
      </Modal>

      {selectedAccount && (
        <FollowUpDrawer
          visible={followUpDrawerVisible}
          onClose={() => setFollowUpDrawerVisible(false)}
          account={selectedAccount}
          refreshAccounts={fetchCustomers}
        />
      )}

      {selectedAccount && (
        <NotesDrawer
          visible={notesDrawerVisible}
          onClose={() => setNotesDrawerVisible(false)}
          account={selectedAccount}
          refreshAccounts={fetchCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
