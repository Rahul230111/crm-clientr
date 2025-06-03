import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
  Card, Input, Button, Table, Tabs, Switch, Typography,
  Empty, Modal, Tag
} from 'antd';
import {
  PlusOutlined, EditOutlined, SearchOutlined,
  MessageOutlined, PrinterOutlined
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
  const [loading, setLoading] = useState(false);
  const [isConvertModalVisible, setIsConvertModalVisible] = useState(false);
  const [accountToConvert, setAccountToConvert] = useState(null);

  const fetchAccounts = () => {
    setLoading(true);
    axios.get(API_URL)
      .then(res => {
        const leadsOnly = res.data.filter(a => !a.isCustomer);
        setAccounts(leadsOnly);
        toast.success('Leads loaded successfully');
      })
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const generateLeadPDF = async (record) => {
    try {
      const toastId = toast.loading('Generating Lead PDF...');
      const source = document.getElementById(`lead-${record._id}`);
      if (!source) {
        toast.error('Lead content not found', { id: toastId });
        return;
      }

      const clone = source.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = '210mm';
      clone.style.background = 'white';
      clone.style.zIndex = '-1';
      clone.style.display = 'block';
      document.body.appendChild(clone);

      await new Promise(resolve => setTimeout(resolve, 200));

      const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);

      pdf.save(`${record.businessName || 'lead'}.pdf`);
      toast.success('PDF downloaded', { id: toastId });

      document.body.removeChild(clone);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  const handleSave = (values) => {
    setLoading(true);
    const request = currentAccount?._id
      ? axios.put(`${API_URL}/${currentAccount._id}`, values)
      : axios.post(API_URL, values);

    request
      .then(() => {
        toast.success(`Account ${currentAccount?._id ? 'updated' : 'created'} successfully`);
        fetchAccounts();
      })
      .catch(() => {
        toast.error(`Failed to ${currentAccount?._id ? 'update' : 'create'} account`);
      })
      .finally(() => {
        setFormVisible(false);
        setCurrentAccount(null);
        setLoading(false);
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

  const handleOpenFollowUpDrawer = (account) => {
    setSelectedAccount(account);
    setFollowUpDrawerVisible(true);
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
        toast.success('Status updated');
        fetchAccounts();
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => {
        setIsModalVisible(false);
        setLoading(false);
      });
  };

  const handleConvertToCustomer = (record) => {
    setAccountToConvert(record);
    setIsConvertModalVisible(true);
  };

  const confirmConvertToCustomer = () => {
    setLoading(true);
    axios.put(`${API_URL}/${accountToConvert._id}`, {
      ...accountToConvert,
      isCustomer: true
    })
      .then(() => {
        toast.success('Converted to customer');
        fetchAccounts();
      })
      .catch(() => toast.error('Failed to convert'))
      .finally(() => {
        setIsConvertModalVisible(false);
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
      case 'Hot': return <Tag color="red">Hot</Tag>;
      case 'Warm': return <Tag color="orange">Warm</Tag>;
      case 'Cold': return <Tag color="blue">Cold</Tag>;
      default: return <Tag>Unknown</Tag>;
    }
  };

  const columns = [
    { title: 'Sno.', render: (_, __, index) => index + 1, width: 60 },
    { title: 'Business Name', dataIndex: 'businessName' },
    { title: 'Contact Name', dataIndex: 'contactName' },
    { title: 'Email Id', dataIndex: 'email' },
    { title: 'Type', dataIndex: 'type', render: typeTag },
    {
      title: 'Latest Note',
      render: (_, record) => {
        const lastNote = record.notes?.at(-1);
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
          <Button icon={<PlusOutlined />} onClick={() => handleOpenFollowUpDrawer(record)} type="link" title="Add Follow-up" />
          <Button icon={<PrinterOutlined />} onClick={() => generateLeadPDF(record)} type="link" title="Download PDF" />
          {!record.isCustomer && (
            <Button
              type="link"
              style={{ color: 'green' }}
              onClick={() => handleConvertToCustomer(record)}
            >
              Convert to Customer
            </Button>
          )}
        </>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Leads</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setCurrentAccount(null);
            setFormVisible(true);
          }}>
            Add Lead
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
          <TabPane tab={`Active (${activeAccounts.length})`} key="active">
            <Table
              columns={columns}
              dataSource={activeAccounts}
              pagination={false}
              rowKey="_id"
              loading={loading}
              locale={{ emptyText: <Empty description="No active leads" /> }}
            />
          </TabPane>
          <TabPane tab={`Inactive (${inactiveAccounts.length})`} key="inactive">
            <Table
              columns={columns}
              dataSource={inactiveAccounts}
              pagination={false}
              rowKey="_id"
              loading={loading}
              locale={{ emptyText: <Empty description="No inactive leads" /> }}
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
        <p>Are you sure you want to change the status of <strong>{accountToUpdate?.businessName}</strong> to <strong>{newStatus}</strong>?</p>
      </Modal>

      <Modal
        title="Confirm Conversion"
        open={isConvertModalVisible}
        onOk={confirmConvertToCustomer}
        onCancel={() => setIsConvertModalVisible(false)}
        okText="Yes, Convert"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <p>Are you sure you want to convert <strong>{accountToConvert?.businessName}</strong> to a customer?</p>
        <p>This action cannot be undone.</p>
      </Modal>

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

      {/* Hidden PDF DOM for each lead */}
      {accounts.map(account => (
        <div key={account._id} id={`lead-${account._id}`} style={{ display: 'none' }}>
          <Card title={`Lead: ${account.businessName}`} bordered={false}>
            <p><strong>Contact Name:</strong> {account.contactName}</p>
            <p><strong>Email:</strong> {account.email}</p>
            <p><strong>Phone:</strong> {account.phone || 'N/A'}</p>
            <p><strong>Type:</strong> {account.type}</p>
            <p><strong>Status:</strong> {account.status}</p>
            <p><strong>Address:</strong><br />{account.addressLines?.join(', ') || 'N/A'}</p>
            <p><strong>Notes:</strong></p>
            {account.notes && account.notes.length > 0 ? (
              account.notes.map((note, idx) => (
                <p key={idx}>
                  <small style={{ color: '#999' }}>{note.timestamp}</small><br />
                  {note.text}
                </p>
              ))
            ) : (
              <em>No notes available</em>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
};

export default Leads;