import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import {
  Card, Input, Button, Table, Tabs, Typography, Empty, Tag, Modal, Dropdown, Menu, Popconfirm, Spin, Space // Added Space
} from 'antd';
import {
  SearchOutlined, EditOutlined, MessageOutlined, CustomerServiceOutlined, DeleteOutlined, MoreOutlined, FilePdfOutlined, FileExcelOutlined
} from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import BusinessAccountForm from './BusinessAccountForm';
import NotesDrawer from './NotesDrawer';
import FollowUpDrawer from './FollowUpDrawer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { TabPane } = Tabs;

const API_URL = "/api/accounts";

const Customers = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('customer'); // Default tab for customers
  const [customers, setCustomers] = useState([]); // This will hold the paginated customer data
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formVisible, setFormVisible] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const navigate = useNavigate();
  const tableRef = useRef(null); // Ref for table element to capture for PDF

  // Get user role and ID from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const currentUserId = user?._id;

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch customers with pagination and filters
  const fetchCustomers = async (params = {}) => {
    setLoading(true);
    try {
      const {
        current = pagination.current,
        pageSize = pagination.pageSize,
        searchText = '',
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      let apiUrl = `${API_URL}/paginated?page=${current}&pageSize=${pageSize}&search=${searchText}&status=Customer`; // Always filter by 'Customer' status

      if (sortBy) {
        apiUrl += `&sortBy=${sortBy}`;
      }
      if (sortOrder) {
        apiUrl += `&sortOrder=${sortOrder}`;
      }

      // Add user ID and role for employee-specific filtering on the backend
      if (role === "Employee" && currentUserId) {
        apiUrl += `&userId=${currentUserId}&role=${role}`;
      }

      const response = await axios.get(apiUrl);
      setCustomers(response.data.data);
      setPagination({
        ...pagination,
        current: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total,
      });

    } catch (err) {
      toast.error('Failed to load customers');
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/api/accounts/users/all');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load user list');
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchCustomers({
      current: pagination.current,
      pageSize: pagination.pageSize,
      searchText: searchText,
    });
    fetchAllUsers();
  }, [pagination.current, pagination.pageSize, searchText, role, currentUserId]); // Dependencies for re-fetching

  const handleEdit = (record) => {
    setCurrentCustomer(record);
    setFormVisible(true);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      if (currentCustomer?._id) {
        await axios.put(`${API_URL}/${currentCustomer._id}`, values);
        toast.success(`Customer updated successfully`);
      } else {
        await axios.post(API_URL, values);
        toast.success(`Customer created successfully`);
      }
      fetchCustomers({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
      }); // Re-fetch data after save
    } catch (err) {
      toast.error(`Failed to ${currentCustomer?._id ? 'update' : 'create'} customer`);
      console.error("Save customer error:", err.response?.data || err.message);
    } finally {
      setFormVisible(false);
      setCurrentCustomer(null);
      setLoading(false);
    }
  };

  const handleStatusChange = (statusValue, record) => {
    setAccountToUpdate(record);
    setNewStatus(statusValue);
    setIsModalVisible(true);
  };

  const confirmStatusChange = async () => {
    setLoading(true);
    try {
      const updated = { ...accountToUpdate, status: newStatus };
      await axios.put(`${API_URL}/${accountToUpdate._id}`, updated);
      toast.success(`Status updated to ${newStatus}`);
      fetchCustomers({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
      }); // Re-fetch data after status change
    } catch (err) {
      toast.error('Failed to update status');
      console.error("Status update error:", err.response?.data || err.message);
    } finally {
      setIsModalVisible(false);
      setAccountToUpdate(null);
      setNewStatus(null);
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (recordId) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${recordId}`, { status: 'Closed', isCustomer: false });
      toast.success('Customer status set to Closed');
      fetchCustomers({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
      }); // Re-fetch data after soft delete
    } catch (err) {
      toast.error('Failed to close customer account');
      console.error("Soft delete error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
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

  const exportTableToPdf = async () => {
    const input = document.getElementById('customerTable'); // Get the table element by ID
    if (!input) {
      toast.error("Table content not found for PDF export.");
      return;
    }

    toast.loading("Generating PDF...", { id: "pdf-toast" });

    try {
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Customers_Details.pdf`);
      toast.success("PDF generated!", { id: "pdf-toast" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    }
  };

  const exportTableToExcel = () => {
    if (customers.length === 0) {
      toast.error("No data to export to Excel.");
      return;
    }

    const dataForExcel = customers.map((customer, index) => {
      const row = {
        "S.No": index + 1 + (pagination.current - 1) * pagination.pageSize,
        "Business Name": customer.businessName,
        "Contact Name": customer.contactName,
        Email: customer.email,
        "Mobile Number": customer.mobileNumber,
        "Lead Type": customer.type,
        Status: customer.status,
        "Source Type": customer.sourceType,
        "Assigned To": customer.assignedTo?.name || "Unassigned",
        "GST Number": customer.gstNumber,
        "Phone Number": customer.phoneNumber,
        "Address Line 1": customer.addressLine1,
        "Address Line 2": customer.addressLine2,
        "Address Line 3": customer.addressLine3,
        Landmark: customer.landmark,
        City: customer.city,
        Pincode: customer.pincode,
        State: customer.state,
        Country: customer.country,
        Website: customer.website,
        "Is Customer": customer.isCustomer ? "Yes" : "No",
        "Created At": new Date(customer.createdAt).toLocaleString(),
      };
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers Data");
    XLSX.writeFile(workbook, "Customers_Data.xlsx");
    toast.success("Data exported to Excel!");
  };

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
    { title: 'Sno.', render: (_, __, i) => i + 1 + (pagination.current - 1) * pagination.pageSize, width: 60 },
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
            <small style={{ color: '#888' }}>{new Date(note.timestamp).toLocaleString()}</small><br />
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
              <Menu.Item key="change-to-active" onClick={() => handleStatusChange("Active", record)}>
                Change to Active Lead
              </Menu.Item>

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

  // Handler for Ant Design Table pagination, sorting, and filtering changes
  const handleTableChange = (newPagination, filters, sorter) => {
    // Update pagination state
    setPagination(newPagination);

    // Prepare sort parameters if sorting is applied
    const sortBy = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : undefined);

    // Re-fetch accounts with updated parameters
    fetchCustomers({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      searchText: searchText,
      sortBy,
      sortOrder,
    });
  };

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: '10px' }}>
          <Title level={4}>Customers</Title>
          <Input
            placeholder="Search by Business Name, Contact Name or Email"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPagination({ ...pagination, current: 1 }); // Reset to first page on search
            }}
            style={{ width: '100%', maxWidth: 150 }}
          />
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={exportTableToPdf} style={{ marginBottom: 16, backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
            >
              Export to PDF
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={exportTableToExcel} style={{ marginBottom: 16, backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
            >
              Export to Excel
            </Button>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={`All Customers (${pagination.total})`} key="customer">
            {loading ? (
              <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
            ) : customers.length > 0 ? (
              <div id="customerTable"> {/* Added ID for PDF export */}
                <Table
                  columns={columns}
                  dataSource={customers} // Use the paginated 'customers' state
                  rowKey="_id"
                  pagination={pagination} // Pass the pagination state
                  onChange={handleTableChange} // Handle table changes
                  scroll={{ x: 'max-content' }}
                />
              </div>
            ) : (
              <Empty description="No customers found." />
            )}
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

      {selectedAccount && (
        <>
          <FollowUpDrawer
            visible={followUpDrawerVisible}
            onClose={() => setFollowUpDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={() => fetchCustomers({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText })}
          />
          <NotesDrawer
            visible={notesDrawerVisible}
            onClose={() => setNotesDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={() => fetchCustomers({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText })}
          />
        </>
      )}
    </div>
  );
};

export default Customers;