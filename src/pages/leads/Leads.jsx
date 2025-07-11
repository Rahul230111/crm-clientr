import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";
import {
  Card,
  Input,
  Button,
  Table,
  Tabs,
  Switch,
  Typography,
  Empty,
  Modal,
  Tag,
  Popconfirm,
  Space,
  Dropdown,
  Menu,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  MessageOutlined,
  PrinterOutlined,
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
  const [activeTab, setActiveTab] = useState("active");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [accountToUpdate, setAccountToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null); // This will now hold string status 'Active' or 'Customer'
  const [accounts, setAccounts] = useState([]);
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // State variables for counts
  const [activeLeadsCount, setActiveLeadsCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [pipelineLeadsCount, setPipelineLeadsCount] = useState(0); // Renamed from waitingLeadsCount
  const [closedAccountsCount, setClosedAccountsCount] = useState(0);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const tableRef = useRef(null);

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, [activeTab]);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      const allAccounts = response.data;

      // Filter based on the 'status' field primarily
      const activeLeadsData = allAccounts.filter(
        (account) => account.status === "Active"
      );
      const customersData = allAccounts.filter(
        (account) => account.status === "Customer"
      );
      const pipelineLeadsData = allAccounts.filter(
        (account) => account.status === "Pipeline"
      );
      const closedAccountsData = allAccounts.filter(
        (account) => account.status === "Closed"
      );

      setActiveLeadsCount(activeLeadsData.length);
      setCustomersCount(customersData.length);
      setPipelineLeadsCount(pipelineLeadsData.length);
      setClosedAccountsCount(closedAccountsData.length);

      if (activeTab === "active") {
        setAccounts(activeLeadsData);
      } else if (activeTab === "customers") {
        setAccounts(customersData);
      } else if (activeTab === "Pipeline") { // Corrected key to "Pipeline"
        setAccounts(pipelineLeadsData);
      } else if (activeTab === "closed") {
        setAccounts(closedAccountsData);
      } else {
        setAccounts(allAccounts);
      }
    } catch (error) {
      toast.error("Failed to fetch accounts.");
      console.error("Fetch accounts error:", error);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users for assignment.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveAccount = async (values) => {
    try {
      const dataToSend = {
        ...values,
        // The assignedTo logic is now handled in BusinessAccountForm.jsx via default or selected value
        // The backend will also derive isCustomer from the status.
      };

      if (currentAccount) {
        await axios.put(`${API_URL}/${currentAccount._id}`, dataToSend);
        toast.success("Account updated successfully!");
      } else {
        await axios.post(API_URL, dataToSend);
        toast.success("Account created successfully!");
      }
      setFormVisible(false);
      fetchAccounts();
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
      await axios.delete(`${API_URL}/${id}`);
      toast.success("Account status set to Closed!"); // Changed message for soft delete
      fetchAccounts();
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

  // Modified handleStatusChange to set the 'status' string value
  const handleStatusChange = (statusValue, account) => {
    setAccountToUpdate(account);
    setNewStatus(statusValue); // 'Customer' or 'Active' (or 'Pipeline')
    setIsModalVisible(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      // Send the new status (e.g., 'Customer' or 'Active') to the backend
      const updatedAccount = { ...accountToUpdate, status: newStatus };
      await axios.put(`${API_URL}/${accountToUpdate._id}`, updatedAccount);
      toast.success(
        `Account status changed to ${newStatus}!`
      );
      fetchAccounts();
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
      // You don't have 'account' here, so use a generic name or pass it if exporting single
      pdf.save(`Leads_Customers_Details.pdf`);
      toast.success("PDF generated!", { id: "pdf-toast" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    }
  };

  const exportTableToExcel = () => {
    if (filteredAccounts.length === 0) {
      toast.error("No data to export to Excel.");
      return;
    }

    const dataForExcel = filteredAccounts.map((account, index) => {
      const row = {
        "S.No": index + 1,
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
        "Is Customer": account.isCustomer ? "Yes" : "No", // Still show this if useful for historical data
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
      render: (text, record, index) => index + 1,
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
            style={{  width: 90, marginRight: 8,backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
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
      title: "Mobile Number",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
      responsive: ["md", "lg"],
    },
    {
      title: "Lead Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Hot", value: "Hot" },
        { text: "Warm", value: "Warm" },
        { text: "Cold", value: "Cold" },
      ],
      onFilter: (value, record) => record.type.indexOf(value) === 0,
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
          case "Inactive":
            color = "red";
            break;
          case "Pipeline":
            color = "orange";
            break;
          case "Closed":
            color = "purple";
            break;
          case "Customer": // New case for 'Customer' status
            color = "blue";
            break;
          default:
            color = "gray";
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: "Active", value: "Active" },
        { text: "Inactive", value: "Inactive" },
        { text: "Pipeline", value: "Pipeline" },
        { text: "Closed", value: "Closed" },
        { text: "Customer", value: "Customer" }, // Added 'Customer' filter
      ],
      onFilter: (value, record) => record.status.indexOf(value) === 0,
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
              <Menu.Item
                key="generate-pdf-single"
                icon={<PrinterOutlined />}
                onClick={() => generatePdfSingleAccount(record)}
              >
                Generate PDF (Single)
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
              <Menu.Item>
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
            </Menu>
          }
          trigger={["click"]}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const generatePdfSingleAccount = async (account) => {
    // You might need to adjust how you get the content for a single account PDF
    // If you render a separate component for a single account's details, use its ref
    // For now, assuming you have a hidden div with id `lead-${account._id}`
    const input = document.getElementById(`lead-${account._id}`);
    if (!input) {
      toast.error("PDF content not found for this account.");
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
      pdf.save(`${account.businessName}-details.pdf`);
      toast.success("PDF generated!", { id: "pdf-toast" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF.", { id: "pdf-toast" });
    }
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.businessName.toLowerCase().includes(searchText.toLowerCase()) ||
      account.contactName.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Card title={<Title level={2}>Manage Leads & Customers</Title>}>
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
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
            onClick={() => {
              setCurrentAccount(null);
              setFormVisible(true);
            }}
          >
            Add New Account
          </Button>

          <Button icon={<FilePdfOutlined />} onClick={exportTableToPdf}>
            Export to PDF
          </Button>
          <Button icon={<FileExcelOutlined />} onClick={exportTableToExcel}>
            Export to Excel
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="active" onChange={setActiveTab}>
        <TabPane tab={`Enquiry (${activeLeadsCount})`} key="active" />
        <TabPane tab={`Propesed (${pipelineLeadsCount})`} key="Pipeline" /> {/* Corrected label */}

        <TabPane tab={`Customers (${customersCount})`} key="customers" />
        <TabPane
          tab={`Closed Accounts (${closedAccountsCount})`}
          key="closed"
        />
      </Tabs>

      <div ref={tableRef}>
        {filteredAccounts.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredAccounts}
            rowKey="_id"
            scroll={{ x: "max-content" }}
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
        open={isModalVisible}
        onOk={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
        okText="Yes"
        cancelText="No"
      >
        <p>
          Are you sure you want to change this account's status to{" "}
          {newStatus}?
        </p>
      </Modal>
    </Card>
  );
};

export default Leads;