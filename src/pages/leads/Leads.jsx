    // File: src/components/leads/Leads.jsx

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
    import { useNavigate } from "react-router-dom";
    import { Select } from "antd";
    import { Resizable } from "react-resizable";
    import "react-resizable/css/styles.css";
    const { Title } = Typography;
    const { TabPane } = Tabs;

    const API_URL = "/api/accounts";

    const ResizableTitle = (props) => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
        width={width}
        height={0}
        handle={
            <span
            className="react-resizable-handle"
            onClick={(e) => e.stopPropagation()}
            />
        }
        onResize={onResize}
        draggableOpts={{ enableUserSelectHack: false }}
        >
        <th {...restProps} />
        </Resizable>
    );
};

    const Leads = () => {
        const [formVisible, setFormVisible] = useState(false);
        const [currentAccount, setCurrentAccount] = useState(null);
        const [searchText, setSearchText] = useState("");
        const [activeTab, setActiveTab] = useState("all");
        const [isModalVisible, setIsModalVisible] = useState(false);
        const [accountToUpdate, setAccountToUpdate] = useState(null);
        const [newStatus, setNewStatus] = useState(null);
        const [accounts, setAccounts] = useState([]);
        const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
        const [followUpDrawerVisible, setFollowUpDrawerVisible] = useState(false);
        const [selectedAccount, setSelectedAccount] = useState(null);
        const navigate = useNavigate();
        // New state for filters
        const [tableFilters, setTableFilters] = useState({});
        
        const [pagination, setPagination] = useState({
            current: 1,
            pageSize: 10,
            total: 0,
        });

        const [counts, setCounts] = useState({
            all: 0,
            active: 0,
            customers: 0,
            Pipeline: 0,
            closed: 0,
            quotations: 0,
            TargetLeads: 0, // Added TargetLeads count
        });

        const [users, setUsers] = useState([]);
        const [loadingUsers, setLoadingUsers] = useState(false);
        const [zones, setZones] = useState([]);
        const [loadingZones, setLoadingZones] = useState(false);
        const [loadingAccounts, setLoadingAccounts] = useState(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const role = user?.role;
        const currentUserId = user?._id;
        const [zoneFilter, setZoneFilter] = useState("all");

        const { Option } = Select;
        const tableRef = useRef(null);

        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                let url = "/api/accounts/users";
                if (zoneFilter && zoneFilter !== "all") {
                url += `?zone=${zoneFilter}`;
                }
                
                const response = await axios.get(url);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to load users for assignment.");
            } finally {
                setLoadingUsers(false);
            }
            };
        const fetchZones = async () => {
            setLoadingZones(true);
            try {
                const response = await axios.get("/api/zones");
                setZones(response.data);
            } catch (error) {
                console.error("Error fetching zones:", error);
                toast.error("Failed to load zones.");
            } finally {
                setLoadingZones(false);
            }
        };

        const fetchAllTabCounts = async () => {
            try {
                let countsApiUrl = `${API_URL}/counts`;
                if (role === "Employee" && currentUserId) {
                    countsApiUrl += `?userId=${currentUserId}&role=${role}`;
                } else if (role === "Team Leader" && currentUserId) {
                    countsApiUrl += `?teamLeaderId=${currentUserId}&role=${role}`;
                }
                const countsResponse = await axios.get(countsApiUrl);
                setCounts(countsResponse.data);
            } catch (error) {
                toast.error("Failed to fetch tab counts.");
                console.error("Fetch counts error:", error);
            }
        };

        const fetchPaginatedAccounts = async (params = {}) => {
            setLoadingAccounts(true);
            try {
                const {
                    current = pagination.current,
                    pageSize = pagination.pageSize,
                    searchText = '',
                    activeTab = 'all',
                    sortBy = 'createdAt',
                    sortOrder = 'desc',
                    filters = tableFilters,
                } = params;

                const statusParam = activeTab === 'all' ? '' : activeTab;
                const searchParam = searchText;

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

                // Append filters to the URL
                Object.keys(filters).forEach(key => {
                    if (filters[key] && filters[key].length > 0) {
                        accountsApiUrl += `&${key}=${filters[key].join(',')}`;
                    }
                });

                if (role === "Employee" && currentUserId) {
                    accountsApiUrl += `&userId=${currentUserId}&role=${role}`;
                } else if (role === "Team Leader" && currentUserId) {
                    accountsApiUrl += `&teamLeaderId=${currentUserId}&role=${role}`;
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

        useEffect(() => {
            fetchPaginatedAccounts({
                current: pagination.current,
                pageSize: pagination.pageSize,
                searchText: searchText,
                activeTab: activeTab,
                filters: tableFilters 
            });
            fetchUsers();
            fetchZones();
            }, [pagination.current, pagination.pageSize, searchText, activeTab, role, currentUserId, zoneFilter]);
        useEffect(() => {
            fetchAllTabCounts();
        }, [role, currentUserId]);

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
                fetchPaginatedAccounts({
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    searchText: searchText,
                    activeTab: activeTab,
                    filters: tableFilters
                });
                fetchAllTabCounts();
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    throw error;
                } else {
                    toast.error("Failed to save account.");
                    console.error(
                        "Save account error:",
                        error.response?.data || error.message
                    );
                    throw error;
                }
            }
        };

        const showEditForm = (account) => {
            setCurrentAccount(account);
            setFormVisible(true);
        };

        const handleDeleteAccount = async (id) => {
            try {
                await axios.delete(`${API_URL}/${id}`);
                toast.success("Account status set to Closed!");
                fetchPaginatedAccounts({
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    searchText: searchText,
                    activeTab: activeTab,
                    filters: tableFilters
                });
                fetchAllTabCounts();
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
                fetchPaginatedAccounts({
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    searchText: searchText,
                    activeTab: activeTab,
                    filters: tableFilters
                });
                fetchAllTabCounts();
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
            if (accounts.length === 0) {
                toast.error("No data to export to Excel.");
                return;
            }

            const dataForExcel = accounts.map((account, index) => {
                const row = {
                    "S.No": index + 1 + (pagination.current - 1) * pagination.pageSize,
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
                    "Zone": account.zone?.name || "N/A",
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
                sorter: true,
                width: 250, 
                filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
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
                responsive: ["xs", "sm", "md", "lg"],
                render: (text, record) => (
                record.status === "Pipeline" ? (
                    <a
                    style={{ color: "#45484bff", cursor: "pointer" }}
                    onClick={() => navigate(`/leads/enquiry/${record._id}`)}
                    >
                    {text}
                    </a>
                ) : (
                    text
                )
                ),
            },
            {
                title: "Contact Name",
                dataIndex: "contactName",
                key: "contactName",
                sorter: true,
                responsive: ["md", "lg"],
                width : 200
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                responsive: ["lg"],
                width : 300
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
                width : 150
            },
            {
                title: "Type of Leads",
                dataIndex: "typeOfLead",
                key: "typeOfLead",
                render: (typeOfLead) => (
                    <Space>
                        {typeOfLead && typeOfLead.map(type => (
                            <Tag key={type} color="blue">{type}</Tag>
                        ))}
                    </Space>
                ),
                responsive: ["lg"],
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
                        case "TargetLeads": // Added TargetLeads status
                            color = "gold";
                            break;
                        default:
                            color = "gray";
                    }
                    return <Tag color={color}>{status}</Tag>;
                },
                filters: [
                    { text: "Active", value: "Active" },
                    { text: "Pipeline", value: "Pipeline" },
                    { text: "Closed", value: "Closed" },
                    { text: "Customer", value: "Customer" },
                    { text: "Quotations", value: "Quotations" },
                    { text: "TargetLeads", value: "TargetLeads" }, // Added to filters
                ],
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
                title: "Zone",
                dataIndex: "zone",
                key: "zone",
                render: (zone) => (zone ? zone.name : "N/A"),
                sorter: (a, b) => {
                    const zoneA = a.zone?.name || "";
                    const zoneB = b.zone?.name || "";
                    return zoneA.localeCompare(zoneB);
                },
                responsive: ["lg"],
                filters: zones.map(zone => ({
                    text: zone.name,
                    value: zone._id,
                })),
                onFilter: (value, record) => record.zone?._id === value,
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

        const [cols, setCols] = useState(columns);
        
        const handleResize = (index) => (e, { size }) => {
        const nextColumns = [...cols];
        nextColumns[index] = {
            ...nextColumns[index],
            width: size.width,
        };
        setCols(nextColumns);
        };

        const mergedColumns = cols.map((col, index) => ({
        ...col,
        onHeaderCell: (column) => ({
            width: column.width,
            onResize: handleResize(index),
        }),
        }));

        const handleTableChange = (newPagination, filters, sorter) => {
            setPagination(newPagination);
            const sortBy = sorter.field;
            const sortOrder = sorter.order === 'ascend' ? 'asc' : (sorter.order === 'descend' ? 'desc' : undefined);

            // Update state with new filters
            setTableFilters(filters);

            fetchPaginatedAccounts({
                current: newPagination.current,
                pageSize: newPagination.pageSize,
                searchText: searchText,
                activeTab: activeTab,
                sortBy,
                sortOrder,
                filters: {
                    status: filters.status,
                    sourceType: filters.sourceType,
                    zone: filters.zone,
                },
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
                            setPagination({ ...pagination, current: 1 });
                        }}
                    />
                    <Space> 
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            value={zoneFilter}
                            onChange={(value) => {
                                setZoneFilter(value);
                                setPagination({ ...pagination, current: 1 });
                                
                                // Update the table filters
                                const newFilters = {
                                ...tableFilters,
                                zone: value === "all" ? [] : [value]
                                };
                                
                                setTableFilters(newFilters);
                                
                                // Fetch data with the new filter
                                fetchPaginatedAccounts({
                                current: 1,
                                pageSize: pagination.pageSize,
                                searchText: searchText,
                                activeTab: activeTab,
                                filters: newFilters
                                });
                            }}
                            >
                            <Option value="all">All Zones</Option>
                            {zones.map((zone) => (
                                <Option key={zone._id} value={zone._id}>
                                {zone.name}
                                </Option>
                            ))}
                            </Select>
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
                        setPagination({ ...pagination, current: 1 });
                    }}
                >
                    <TabPane tab={`All Leads`} key="all" />
                    <TabPane tab={`Target Leads `} key="TargetLeads" />
                    <TabPane tab={`Lead `} key="Active" />
                    <TabPane tab={`Enquiry `} key="Pipeline" />
                    <TabPane tab={`Quotations Sent `} key="Quotations" />
                    <TabPane tab={`Converted `} key="Customer" />
                    <TabPane tab={`Closed Accounts `} key="Closed" />
                </Tabs>

                <div ref={tableRef}>
                    {loadingAccounts ? (
                        <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
                    ) : accounts.length > 0 ? (
                        <Table
                            components={{
                                header: {
                                cell: ResizableTitle,
                                },
                            }}
                            columns={mergedColumns}
                            dataSource={accounts}
                            rowKey="_id"
                            scroll={{ x: "max-content" }}
                            pagination={pagination}
                            onChange={handleTableChange}
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
                    allZones={zones}
                    loadingZones={loadingZones}
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