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

const API_URL = "/api/accounts";

const Leads = () => {
  const [formVisible, setFormVisible] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // Default to 'all' or your desired initial tab
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [accounts, setAccounts] = useState([]); // This will now hold only the paginated data for the current tab
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // State variables for counts, fetched separately
  const [counts, setCounts] = useState({
    all: 0,
    active: 0, // Maps to 'Lead'
    customers: 0, // Maps to 'Converted'
    Pipeline: 0, // Maps to 'Enquiry'
    closed: 0,
    quotations: 0,
  });

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true); // New loading state for table data

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const currentUserId = user?._id;

  const tableRef = useRef(null);

  // Function to fetch all users (for assignedTo dropdown)
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get("/api/accounts/users"); // Corrected API endpoint for users
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users for assignment.");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to fetch ONLY the counts for all tabs from the backend
  const fetchAllTabCounts = async () => {
    try {
      let countsApiUrl = `${API_URL}/counts`;
      // Apply role-based filtering for Employees to counts as well
      if (role === "Employee" && currentUserId) {
        countsApiUrl += `?userId=${currentUserId}&role=${role}`;
      }
      const countsResponse = await axios.get(countsApiUrl);
      setCounts(countsResponse.data);
    } catch (error) {
      toast.error("Failed to fetch tab counts.");
      console.error("Fetch counts error:", error);
    }
  };

  // Function to fetch paginated accounts for the CURRENT active tab
  const fetchPaginatedAccounts = async (params = {}) => {
    setLoadingAccounts(true);
    try {
      const {
        current = pagination.current,
        pageSize = pagination.pageSize,
        searchText = '',
        activeTab = 'all', // Ensure this parameter is used
        sortBy = 'createdAt', // Default sort by creation date
        sortOrder = 'desc', // Default sort order descending
      } = params;

      // Map frontend tab keys to backend status values if they differ
      const statusParam = activeTab === 'all' ? '' : activeTab;
      const searchParam = searchText; // Use searchText directly

      let accountsApiUrl = `${API_URL}/paginated?page=${current}&pageSize=${pageSize}&search=${searchParam}`;

      if (statusParam) {
        accountsApiUrl += `&status=${statusParam}`;
      }
      if (sortBy) {
        accountsApiUrl += `&sortBy=${sortBy}`;
      }
      if (sortOrder) {
        accountsApiUrl += `&sortOrder=${sortOrder}`;
      }

      // Apply role-based filtering for Employees directly in the API call
      if (role === "Employee" && currentUserId) {
        accountsApiUrl += `&userId=${currentUserId}&role=${role}`;
      }

      const accountsResponse = await axios.get(accountsApiUrl);
      setAccounts(accountsResponse.data.data);
      setPagination({
        ...pagination,
        current: accountsResponse.data.page,
        pageSize: accountsResponse.data.pageSize,
        total: accountsResponse.data.total,
      });

    } catch (error) {
      toast.error("Failed to fetch accounts.");
      console.error("Fetch accounts error:", error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  // Effect to fetch initial data and re-fetch paginated data when dependencies change
  useEffect(() => {
    fetchPaginatedAccounts({ // Only fetch paginated data for the current tab
      current: pagination.current,
      pageSize: pagination.pageSize,
      searchText: searchText,
      activeTab: activeTab,
    });
    fetchUsers(); // Fetch users once on component mount
  }, [pagination.current, pagination.pageSize, searchText, activeTab, role, currentUserId]); // Dependencies for re-fetching accounts

  // Effect to fetch all tab counts initially and whenever relevant user/role changes
  useEffect(() => {
    fetchAllTabCounts();
  }, [role, currentUserId]); // Re-fetch all counts if user or role changes


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
        // After saving, re-fetch both paginated accounts (for table refresh) and all tab counts
        fetchPaginatedAccounts({
            current: pagination.current,
            pageSize: pagination.pageSize,
            searchText: searchText,
            activeTab: activeTab,
        });
        fetchAllTabCounts(); // Crucial: Re-fetch all counts to update tab numbers
    } catch (error) {
        if (error.response && error.response.status === 409) {
            // Handle specific conflict error for duplicate business name
            throw error; // Re-throw to be caught by BusinessAccountForm's onError
        } else {
            toast.error("Failed to save account.");
            console.error(
                "Save account error:",
                error.response?.data || error.message
            );
            throw error; // Re-throw general error
        }
    }
};

  const showEditForm = (account) => {
    setCurrentAccount(account);
    setFormVisible(true);
  };

  const handleDeleteAccount = async (id) => {
    try {
      // Backend controller now handles setting status to 'Closed' on DELETE
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Account status set to Closed!");
      // Re-fetch both paginated accounts and all tab counts after status change
      fetchPaginatedAccounts({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
        activeTab: activeTab,
      });
      fetchAllTabCounts(); // Crucial: Re-fetch all counts to update tab numbers
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
      // Re-fetch both paginated accounts and all tab counts after status change
      fetchPaginatedAccounts({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText,
        activeTab: activeTab,
      });
      fetchAllTabCounts(); // Crucial: Re-fetch all counts to update tab numbers
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
    if (accounts.length === 0) { // Use 'accounts' directly, as it now holds the current tab's data
      toast.error("No data to export to Excel.");
      return;
    }

    const dataForExcel = accounts.map((account, index) => {
      const row = {
        "S.No": index + 1 + (pagination.current - 1) * pagination.pageSize, // Correct S.No for pagination
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
      sorter: true, // Enable sorting for this column
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
            onPressEnter={() => confirm()} // Not strictly needed with live search, but good practice
            style={{ marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => confirm()} // Trigger search
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
            onClick={() => clearFilters()} // Clear search text
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </div>
      ),
      // onFilter is handled by backend search, so this might not be needed for server-side filtering
      // onFilter: (value, record) => record.businessName.toLowerCase().includes(value.toLowerCase()),
      responsive: ["xs", "sm", "md", "lg"],
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
      key: "contactName",
      sorter: true, // Enable sorting
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
      filters: [ // These filters will typically be handled by changing the 'activeTab'
        { text: "Active", value: "Active" },
        { text: "Pipeline", value: "Pipeline" },
        { text: "Closed", value: "Closed" },
        { text: "Customer", value: "Customer" },
        { text: "Quotations", value: "Quotations" },
      ],
      // onFilter is handled by 'activeTab' change and backend
      // onFilter: (value, record) => record.status.indexOf(value) === 0,
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

              {/* Conditional menu item for changing status to Customer or Active */}
              {record.status === "Customer" ? (
                <Menu.Item
                  key="change-to-lead"
                  onClick={() => handleStatusChange("Active", record)} // Change to 'Active' lead
                >
                  Change to Lead
                </Menu.Item>
              ) : (
                <Menu.Item
                  key="change-to-customer"
                  onClick={() => handleStatusChange("Customer", record)} // Change to 'Customer'
                >
                  Change to Customer
                </Menu.Item>
              )}
              {/* Conditionally render Close Account based on role */}
              {role === "Superadmin" && ( // Updated condition to show only for 'Superadmin'
                <Menu.Item key="close-account">
                  <Popconfirm
                    title="Are you sure you want to close this account? This will set its status to 'Closed'."
                    onConfirm={() => handleDeleteAccount(record._id)} // This now sets status to 'Closed'
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

  // Handler for table changes (pagination, sorting, filtering)
  const handleTableChange = (newPagination, filters, sorter) => {
    // Update pagination state first
    setPagination(newPagination);

    // Extract sortBy and sortOrder from sorter
    const sortBy = sorter.field;
    const sortOrder = sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : undefined);

    // Call fetchPaginatedAccounts with updated parameters
    fetchPaginatedAccounts({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      searchText: searchText, // Pass current search text
      activeTab: activeTab, // Pass current active tab
      sortBy,
      sortOrder,
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
        defaultActiveKey="all" // Changed default to 'all' to show all data initially
        onChange={(key) => {
          setActiveTab(key);
          setPagination({ ...pagination, current: 1 }); // Reset to first page when tab changes
        }}
      >
        <TabPane tab={`All Leads`} key="all" />
        <TabPane tab={`Lead `} key="Active" /> {/* Key should match backend status */}
        <TabPane tab={`Enquiry `} key="Pipeline" /> {/* Key should match backend status */}
        <TabPane tab={`Quotations Sent `} key="Quotations" /> {/* Key should match backend status */}
        <TabPane tab={`Converted `} key="Customer" /> {/* Key should match backend status */}
        <TabPane tab={`Closed Accounts `} key="Closed" /> {/* Key should match backend status */}
      </Tabs>

      <div ref={tableRef}>
        {loadingAccounts ? (
          <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
        ) : accounts.length > 0 ? (
          <Table
            columns={columns}
            dataSource={accounts}
            rowKey="_id"
            scroll={{ x: "max-content" }}
            pagination={pagination}
            onChange={handleTableChange} // Add this handler for pagination and sorting
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
            refreshAccounts={() => {
              fetchPaginatedAccounts({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText, activeTab: activeTab });
              fetchAllTabCounts();
            }}
          />
          <FollowUpDrawer
            visible={followUpDrawerVisible}
            onClose={() => setFollowUpDrawerVisible(false)}
            account={selectedAccount}
            refreshAccounts={() => {
              fetchPaginatedAccounts({ current: pagination.current, pageSize: pagination.pageSize, searchText: searchText, activeTab: activeTab });
              fetchAllTabCounts();
            }}
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