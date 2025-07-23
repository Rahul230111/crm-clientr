import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";
import {
  Card,
  Input,
  Button,
  Table,
  Tabs,
  Typography,
  Empty,
  Modal,
  Tag,
  Popconfirm,
  Space,
  Dropdown,
  Menu,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  MessageOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  MoreOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import BusinessAccountForm from "./BusinessAccountForm";
import NotesDrawer from "./NotesDrawer";
import FollowUpDrawer from "./FollowUpDrawer";

const { Title } = Typography;
const { TabPane } = Tabs;

// Change API_URL to point to your backend base URL, assuming '/api/accounts' is correct
const API_URL = "/api/accounts";

const Leads = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [accounts, setAccounts] = useState([]); // This will hold the paginated data
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1, // Current page number
    pageSize: 10, // Items per page
    total: 0, // Total items from server
  });

  // State for counts - these will be dynamically updated based on the current activeTab's total
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    customers: 0,
    Pipeline: 0,
    closed: 0,
    quotations: 0,
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Get user role and ID from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const currentUserId = user?._id;

  const tableRef = useRef(null);

  // Function to fetch accounts from the backend with pagination and filters
  const fetchAccounts = async (params = {}) => {
    setLoadingAccounts(true);
    try {
      const {
        current = pagination.current,
        pageSize = pagination.pageSize,
        searchText = '',
        activeTab = 'all',
        sortBy = 'createdAt', // Default sort by creation date
        sortOrder = 'desc',   // Default sort order descending
      } = params;

      const statusParam = activeTab === 'all' ? '' : activeTab; // Map 'all' to empty for backend
      const searchParam = searchText;

      let apiUrl = `${API_URL}/paginated?page=${current}&pageSize=${pageSize}&search=${searchParam}`;

      if (statusParam) {
        apiUrl += `&status=${statusParam}`;
      }
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
      setAccounts(response.data.data); // Set the accounts for the current page
      setPagination({
        ...pagination,
        current: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total,
      });

      // Update the count for the currently active tab
      setCounts(prevCounts => ({
        ...prevCounts,
        [activeTab]: response.data.total,
      }));

    } catch (error) {
      toast.error("Failed to fetch accounts.");
      console.error("Fetch accounts error:", error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Initial fetch and fetch on filter/tab/pagination changes
  useEffect(() => {
    fetchAccounts({
      current: pagination.current,
      pageSize: pagination.pageSize,
      searchText: searchText,
      activeTab: activeTab,
    });
    fetchUsers(); // Users are fetched once on initial load
  }, [pagination.current, pagination.pageSize, searchText, activeTab, role, currentUserId]); // Dependencies for re-fetching

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users for assignment.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveAccount = async (values) => {
    try {
      const dataToSend = { ...values };

      if (currentAccount) {
        await axios.put(`${API_URL}/${currentAccount._id}`, dataToSend);
        toast.success("Account updated successfully!");
      } else {
        await axios.post(API_URL, dataToSend);
        toast.success("Account created successfully!");
      }
      setFormVisible(false);
      // Re-fetch accounts for the current view after saving
      fetchAccounts({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
        activeTab: activeTab,
      });
    } catch (error) {
      toast.error("Failed to save account.");
      console.error(
        "Save account error:",
        error.response?.data || error.message
      );
    }
  };

  const showEditForm = (account) => {
    setCurrentAccount(account);
    setFormVisible(true);
  };

  const handleDeleteAccount = async (id) => {
    try {
      // Assuming this sets status to 'Closed' via a PUT request
      await axios.put(`${API_URL}/${id}`, { status: 'Closed' });
      toast.success("Account status set to Closed!");
      // Re-fetch accounts for the current view after status change
      fetchAccounts({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
        activeTab: activeTab,
      });
    } catch (error) {
      toast.error("Failed to set account status to Closed.");
      console.error(
        "Delete account error:",
        error.response?.data || error.message
      );
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

  const handleStatusChange = (statusValue, account) => {
    setAccountToUpdate(account);
    setNewStatus(statusValue);
    setIsModalVisible(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      const updatedAccount = { ...accountToUpdate, status: newStatus };
      await axios.put(`${API_URL}/${accountToUpdate._id}`, updatedAccount);
      toast.success(`Account status changed to ${newStatus}!`);
      // Re-fetch accounts for the current view after status change
      fetchAccounts({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
        activeTab: activeTab,
      });
    } catch (error) {
      toast.error("Failed to update account status.");
      console.error(
        "Status update error:",
        error.response?.data || error.message
      );
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

  const exportTableToPdf = async () => {
    const input = tableRef.current;
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
      pdf.save(`Leads_Customers_Details.pdf`);
      toast.success("PDF generated!", { id: "pdf-toast" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    }
  };

  const exportTableToExcel = () => {
    // For Excel export, you might want to fetch ALL data (non-paginated) if it's not too large
    // Or, export only the current page's data, which is 'accounts' state.
    // For this example, it will export the currently displayed 'accounts' (paginated data)
    if (accounts.length === 0) {
      toast.error("No data to export to Excel.");
      return;
    }

    const dataForExcel = accounts.map((account, index) => {
      const row = {
        "S.No": index + 1 + (pagination.current - 1) * pagination.pageSize, // Adjust S.No for current page
        "Business Name": account.businessName,
        "Contact Name": account.contactName,
        Email: account.email,
        "Mobile Number": account.mobileNumber,
        "Lead Type": account.type,
        Status: account.status,
        "Source Type": account.sourceType,
        "Assigned To": account.assignedTo?.name || "Unassigned",
        "GST Number": account.gstNumber,
        "Phone Number": account.phoneNumber,
        "Address Line 1": account.addressLine1,
        "Address Line 2": account.addressLine2,
        "Address Line 3": account.addressLine3,
        Landmark: account.landmark,
        City: account.city,
        Pincode: account.pincode,
        State: account.state,
        Country: account.country,
        Website: account.website,
        "Is Customer": account.isCustomer ? "Yes" : "No",
        "Created At": new Date(account.createdAt).toLocaleString(),
      };
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads & Customers");
    XLSX.writeFile(workbook, "Leads_Customers_Data.xlsx");
    toast.success("Data exported to Excel!");
  };

  const columns = [
    {
      title: "S.No",
      key: "sno",
      render: (text, record, index) => index + 1 + (pagination.current - 1) * pagination.pageSize,
      width: 60,
    },
    {
      title: "Business Name",
      dataIndex: "businessName",
      key: "businessName",
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search Business Name"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
              marginRight: 8,
              backgroundColor: "#ef7a1b",
              borderColor: "#orange",
              color: "white",
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      // Note: onFilter here will only work for client-side filtering if you remove backend filtering for this column
      // With server-side, you'd integrate this into the fetchAccounts 'params'
      onFilter: (value, record) =>
        record.businessName.toLowerCase().includes(value.toLowerCase()),
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
      key: "contactName",
      responsive: ["md", "lg"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["lg"],
    },
    {
      title: "Product",
      dataIndex: "selectedProduct",
      key: "selectedProduct",
      render: (selectedProduct) => (selectedProduct ? selectedProduct.productName : "N/A"),
      responsive: ["md", "lg"],
    },
    {
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      responsive: ["md", "lg"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        switch (status) {
          case "Active":
            color = "green";
            break;
          case "Pipeline":
            color = "orange";
            break;
          case "Closed":
            color = "purple";
            break;
          case "Customer":
            color = "blue";
            break;
          case "Quotations":
            color = "cyan";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status}</Tag>;
      },
      // These filters will now be handled by the activeTab state, not directly by Table's internal filters
      filters: [
        { text: "Active", value: "Active" },
        { text: "Pipeline", value: "Pipeline" },
        { text: "Closed", value: "Closed" },
        { text: "Customer", value: "Customer" },
        { text: "Quotations", value: "Quotations" },
      ],
      // onFilter needs to trigger fetchAccounts with new status parameter
      onFilter: (value, record) => record.status.indexOf(value) === 0, // This is client-side, replace if using server-side filtering
      filterMultiple: true,
      responsive: ["sm", "md", "lg"],
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedTo) => (assignedTo ? assignedTo.name : "Unassigned"),
      responsive: ["md", "lg"],
    },
    {
      title: "Source Type",
      dataIndex: "sourceType",
      key: "sourceType",
      filters: [
        { text: "Direct", value: "Direct" },
        { text: "Facebook", value: "Facebook" },
        { text: "Google Ads", value: "Google Ads" },
        { text: "Website", value: "Website" },
        { text: "Cold Call", value: "Cold Call" },
        { text: "Client", value: "Client" },
        { text: "Tradefair", value: "Tradefair" },
        { text: "Other", value: "Other" },
      ],
      onFilter: (value, record) => record.sourceType?.indexOf(value) === 0,
      responsive: ["lg"],
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (text, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => showEditForm(record)}
              >
                Edit Account
              </Menu.Item>
              <Menu.Item
                key="notes"
                icon={<MessageOutlined />}
                onClick={() => showNotesDrawer(record)}
              >
                View/Add Notes
              </Menu.Item>
              <Menu.Item
                key="followup"
                icon={<CustomerServiceOutlined />}
                onClick={() => showFollowUpDrawer(record)}
              >
                View/Add Follow-ups
              </Menu.Item>

              {record.status === "Customer" ? (
                <Menu.Item
                  key="change-to-lead"
                  onClick={() => handleStatusChange("Active", record)}
                >
                  Change to Lead
                </Menu.Item>
              ) : (
                <Menu.Item
                  key="change-to-customer"
                  onClick={() => handleStatusChange("Customer", record)}
                >
                  Change to Customer
                </Menu.Item>
              )}
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
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Handler for Ant Design Table pagination, sorting, and filtering changes
  const handleTableChange = (newPagination, filters, sorter) => {
    // Update pagination state
    setPagination(newPagination);

    // Prepare sort parameters if sorting is applied
    const sortBy = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : undefined);

    // Re-fetch accounts with updated parameters
    fetchAccounts({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      searchText: searchText,
      activeTab: activeTab,
      sortBy,
      sortOrder,
      // You can also pass column filters here if you want to handle them server-side
      // For example: status: filters.status?.[0]
    });
  };

  return (
    <Card title={<Title level={4}>Manage Leads & Customers</Title>}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Input
          placeholder="Search by business or contact name"
          prefix={<SearchOutlined />}
          style={{ width: "100%", maxWidth: 300 }}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPagination({ ...pagination, current: 1 }); // Reset to first page on search
          }}
        />
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#ef7a1b", borderColor: "#orange", color: "white" }}
            onClick={() => {
              setCurrentAccount(null);
              setFormVisible(true);
            }}
          >
            Add New Account
          </Button>

          <Button icon={<FilePdfOutlined />} onClick={exportTableToPdf} />
          <Button icon={<FileExcelOutlined />} onClick={exportTableToExcel} />
        </Space>
      </div>

      <Tabs
        defaultActiveKey="all"
        onChange={(key) => {
          setActiveTab(key);
          setPagination({ ...pagination, current: 1 }); // Reset to first page on tab change
        }}
      >
        <TabPane tab={`All Leads (${counts.all})`} key="all" />
        <TabPane tab={`Lead (${counts.active})`} key="active" />
        <TabPane tab={`Enquiry (${counts.Pipeline})`} key="Pipeline" />
        <TabPane tab={`Quotations (${counts.quotations})`} key="quotations" />
        <TabPane tab={`Converted (${counts.customers})`} key="customers" />
        <TabPane tab={`Closed (${counts.closed})`} key="closed" />
      </Tabs>

      <div ref={tableRef}>
        {loadingAccounts ? (
          <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
        ) : accounts.length > 0 ? (
          <Table
            columns={columns}
            dataSource={accounts} // Now directly use the paginated 'accounts' state
            rowKey="_id"
            scroll={{ x: "max-content" }}
            pagination={pagination} // Pass the pagination state
            onChange={handleTableChange} // Handle pagination/sort/filter changes
          />
        ) : (
          <Empty description="No accounts found." />
        )}
      </div>

      <BusinessAccountForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSave={handleSaveAccount}
        initialValues={currentAccount}
        allUsers={users}
        loadingUsers={loadingUsers}
      />

      {selectedAccount && (
        <>
          <NotesDrawer
            visible={notesDrawerVisible}
            onClose={() => setNotesDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={() => fetchAccounts({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText, activeTab: activeTab })}
          />
          <FollowUpDrawer
            visible={followUpDrawerVisible}
            onClose={() => setFollowUpDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={() => fetchAccounts({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText, activeTab: activeTab })}
          />
        </>
      )}

      <Modal
        title="Change Account Status"
        open={isModalVisible}
        onOk={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        okText="Yes"
        cancelText="No"
      >
        <p>
          Are you sure you want to change this account's status to{" "}
          **{newStatus}**?
        </p>
      </Modal>
    </Card>
  );
};

export default Leads;