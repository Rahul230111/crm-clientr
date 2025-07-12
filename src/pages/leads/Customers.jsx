import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import {
  Card, Input, Button, Table, Tabs, Typography, Empty, Tag, Modal, Dropdown, Menu, Popconfirm
} from 'antd';
import {
  SearchOutlined, EditOutlined, MessageOutlined, EyeOutlined,
  PrinterOutlined, CustomerServiceOutlined, DeleteOutlined, MoreOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import BusinessAccountForm from './BusinessAccountForm';
import NotesDrawer from './NotesDrawer';
import FollowUpDrawer from './FollowUpDrawer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { Title } = Typography;
const { TabPane } = Tabs;

const Customers = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null); // This will now hold string status 'Active' or 'Inactive'

  // Removed: deleteModalVisible and customerToDelete state variables
  // const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // const [customerToDelete, setCustomerToDelete] = useState(null);

  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate();

  // Fetch only accounts with status 'Customer'
  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get('/api/accounts/customers')
      .then((res) => {
        const allFetchedCustomers = Array.isArray(res.data) ? res.data : [];
        setCustomers(allFetchedCustomers);
      })
      .catch((err) => {
        toast.error('Failed to load customers');
        console.error("Error fetching customers:", err);
      })
      .finally(() => setLoading(false));
  };

  const fetchAllUsers = () => {
    setLoadingUsers(true);
    axios
      .get('/api/accounts/users/all')
      .then((res) => {
        setUsers(res.data);
      })
      .catch(() => {
        toast.error('Failed to load user list');
      })
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    fetchCustomers();
    fetchAllUsers();
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
      .catch((err) => {
        toast.error(`Failed to ${currentCustomer?._id ? 'update' : 'create'} customer`);
        console.error("Save customer error:", err.response?.data || err.message);
      })
      .finally(() => {
        setFormVisible(false);
        setCurrentCustomer(null);
        setLoading(false);
      });
  };

  const handleStatusChange = (statusValue, record) => {
    setAccountToUpdate(record);
    setNewStatus(statusValue ? 'Active' : 'Inactive');
    setIsModalVisible(true);
  };

  const confirmStatusChange = () => {
    setLoading(true);
    const updated = { ...accountToUpdate, status: newStatus };
    axios
      .put(`/api/accounts/${accountToUpdate._id}`, updated)
      .then(() => {
        toast.success(`Status updated to ${newStatus}`);
        fetchCustomers();
      })
      .catch((err) => {
        toast.error('Failed to update status');
        console.error("Status update error:", err.response?.data || err.message);
      })
      .finally(() => {
        setIsModalVisible(false);
        setAccountToUpdate(null);
        setNewStatus(null);
        setLoading(false);
      });
  };

  // Modified handleDeleteAccount to perform a soft delete (set status to 'Closed')
  const handleDeleteAccount = (recordId) => {
    setLoading(true);
    axios
      .put(`/api/accounts/${recordId}`, { status: 'Closed', isCustomer: false })
      .then(() => {
        toast.success('Customer status set to Closed');
        fetchCustomers();
      })
      .catch((err) => {
        toast.error('Failed to close customer account');
        console.error("Soft delete error:", err.response?.data || err.message);
      })
      .finally(() => {
        // Removed: setDeleteModalVisible(false) and setCustomerToDelete(null) as they are no longer needed here
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

  const generatePdf = async (account) => {
    const input = document.createElement('div');
    input.innerHTML = `
      <h1>${account.businessName} Details</h1>
      <p><strong>Contact Name:</strong> ${account.contactName}</p>
      <p><strong>Email:</strong> ${account.email}</p>
      <p><strong>Mobile:</strong> ${account.mobileNumber}</p>
      <p><strong>Address:</strong> ${account.addressLine1}, ${account.city}, ${account.state}, ${account.pincode}</p>
      <p><strong>Status:</strong> ${account.status}</p>
      <p><strong>Assigned To:</strong> ${account.assignedTo?.name || 'Unassigned'}</p>
      ${account.notes && account.notes.length > 0 ? `
        <h2>Notes:</h2>
        <ul>
          ${account.notes.map(note => `<li><strong>${note.timestamp}:</strong> ${note.text}</li>`).join('')}
        </ul>
      ` : '<p>No notes available.</p>'}
      ${account.followUps && account.followUps.length > 0 ? `
        <h2>Follow-ups:</h2>
        <ul>
          ${account.followUps.map(fu => `<li><strong>${new Date(fu.date).toLocaleDateString()}:</strong> ${fu.note} (${fu.status})</li>`).join('')}
        </ul>
      ` : '<p>No follow-ups available.</p>'}
    `;
    input.style.width = '210mm'; // A4 width
    input.style.padding = '10mm';
    document.body.appendChild(input);

    toast.loading('Generating PDF...', { id: 'pdf-toast' });

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
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
      toast.error('Failed to generate PDF.', { id: 'pdf-toast' });
      console.error("PDF generation error:", error);
    } finally {
      document.body.removeChild(input);
    }
  };

  const filtered = customers.filter((account) => {
    const search = searchText.toLowerCase();
    return (
      account.status === 'Customer' &&
      (account.businessName?.toLowerCase().includes(search) ||
        account.contactName?.toLowerCase().includes(search) ||
        account.email?.toLowerCase().includes(search))
    );
  });

  const activeCustomers = filtered.filter((a) => a.status === 'Customer');
  const inactiveCustomers = [];

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

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role; // Get the user's role

  const columns = [
    { title: 'Sno.', render: (_, __, i) => i + 1, width: 60 },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      render: (text, record) => (
        <a onClick={() => goToCustomerProfile(record)} style={{ cursor: 'pointer', color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    { title: 'Contact Name', dataIndex: 'contactName' },
    { title: 'Email Id', dataIndex: 'email' },
    { title: 'Type', dataIndex: 'type', render: typeTag },
    {
      title: 'Assigned To',
      render: (_, record) =>
        record.assignedTo ? (
          <span>{record.assignedTo.name} ({record.assignedTo.role})</span>
        ) : (
          <em>Unassigned</em>
        )
    },
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
        <Tag color={record.status === 'Customer' ? 'blue' : 'gray'}>
          {record.status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Edit Customer</Menu.Item>
              <Menu.Item key="notes" icon={<MessageOutlined />} onClick={() => handleOpenNotesDrawer(record)}>View/Add Notes</Menu.Item>
              <Menu.Item key="followups" icon={<CustomerServiceOutlined />} onClick={() => handleOpenFollowUpDrawer(record)}>View/Add Follow-ups</Menu.Item>
              {/* <Menu.Item key="view-profile" icon={<EyeOutlined />} onClick={() => goToCustomerProfile(record)}>View Profile</Menu.Item> */}

              {role === "Superadmin" && (
                <Menu.Item key="close-account">
                  <Popconfirm
                    title="Are you sure you want to close this account? This will set its status to 'Closed'."
                    onConfirm={() => handleDeleteAccount(record._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <DeleteOutlined />
                    Close Account
                  </Popconfirm>
                </Menu.Item>
              )}
            </Menu>
          }
          trigger={['click']}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
          <Title level={4}>Customers</Title>
          <Input
            placeholder="Search by Business Name, Contact Name or Email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`All Customers (${activeCustomers.length})`} key="active">
            <Table columns={columns} dataSource={activeCustomers} rowKey="_id" pagination={{ pageSize: 10 }} loading={loading} scroll={{ x: 'max-content' }} />
          </TabPane>
        </Tabs>
      </Card>

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        initialValues={currentCustomer}
        allUsers={users}
        loadingUsers={loadingUsers}
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

      {/* Removed the redundant delete confirmation Modal */}
      {/* <Modal
        title="Confirm Account Closure"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Close Account"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <p>Are you sure you want to change the status of <strong>{customerToDelete?.businessName}</strong> to 'Closed'?</p>
      </Modal> */}

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