import React, { useState } from 'react';
import { Card, Input, Button, Table, Tag, Divider, Typography } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import BusinessAccountForm from './BusinessAccountForm';

const { Title } = Typography;

const Leads = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [accounts, setAccounts] = useState([
    {
      key: '1',
      sno: 1,
      businessName: '7 Crafts Contracting P Ltd',
      contactName: 'Virooth',
      email: '',
      status: 'Active'
    },
    {
      key: '2',
      sno: 2,
      businessName: 'AADHIRA TRADERS',
      contactName: 'AADHIRA TRADERS',
      email: '',
      status: 'Inactive'
    },
    {
      key: '3',
      sno: 3,
      businessName: 'Add Account',
      contactName: 'DBSALAC CORN',
      email: '',
      status: 'Active'
    }
  ]);

  const handleSave = (values) => {
    if (currentAccount) {
      setAccounts(accounts.map(account =>
        account.key === currentAccount.key ? { ...account, ...values } : account
      ));
    } else {
      const newAccount = {
        key: Date.now().toString(),
        sno: accounts.length + 1,
        ...values,
        status: 'Active'
      };
      setAccounts([...accounts, newAccount]);
    }
    setCurrentAccount(null);
    setFormVisible(false);
  };

  const handleEdit = (record) => {
    setCurrentAccount(record);
    setFormVisible(true);
  };

  const filteredAccounts = accounts.filter(account => {
    const searchLower = searchText.toLowerCase();
    return (
      account.businessName.toLowerCase().includes(searchLower) ||
      account.contactName.toLowerCase().includes(searchLower) ||
      (account.email && account.email.toLowerCase().includes(searchLower))
    );
  });

  const renderTable = (status) => (
    <>
      <Title level={4}>
        {status} Accounts List ({accounts.filter(a => a.status === status).length})
      </Title>
      <Table
        columns={[
          { title: 'Sno.', dataIndex: 'sno', key: 'sno', width: 80 },
          { title: 'Business Name', dataIndex: 'businessName', key: 'businessName' },
          { title: 'Contact Name', dataIndex: 'contactName', key: 'contactName' },
          { title: 'Email Id', dataIndex: 'email', key: 'email' },
          {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: status => (
              <Tag color={status === 'Active' ? 'green' : 'red'}>
                {status}
              </Tag>
            ),
          },
          {
            title: 'Action',
            key: 'action',
            width: 100,
            render: (_, record) => (
              <Button 
                icon={<EditOutlined />} 
                onClick={() => handleEdit(record)}
              />
            ),
          },
        ]}
        dataSource={filteredAccounts.filter(a => a.status === status)}
        pagination={false}
        bordered
        rowKey="key"
        style={{ marginBottom: 24 }}
      />
    </>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Business Accounts</Title>
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

        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search by Business Name, Contact Name or Email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
        </div>

        {renderTable('Active')}

        {accounts.some(a => a.status === 'Inactive') && (
          <>
            <Divider />
            {renderTable('Inactive')}
          </>
        )}
      </Card>

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        initialValues={currentAccount}
      />
    </div>
  );
};

export default Leads;
