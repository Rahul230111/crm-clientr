import { Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  FileAddOutlined,
  UsergroupAddOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import './sidebar.css';

import logoCollapsed from "../../assets/megacranesmall.png";
import logoExpanded from "../../assets/megacrane.png";

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = "/" + location.pathname.split("/")[1];

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Define menu structure with role-based access
  const rawMenuItems = [
    {
      key: "main-menu",
      type: "group",
      label: collapsed ? null : "MAIN MENU",
      children: [
        {
          key: "/dashboard",
          icon: <DashboardOutlined />,
          label: collapsed ? null : "Dashboard",
          roles: ["Admin", "Superadmin", "Employee"],
          children: [
            { key: "/dashboard/deals", label: "Leads Dashboard", roles: ["Admin", "Superadmin"] },
            // { key: "/invoicedashboard", label: "Invoice Dashboard", roles: ["Admin", "Superadmin", "Employee"] },
          ],
        },
        {
          key: "/application",
          icon: <AppstoreOutlined />,
          label: collapsed ? null : "Application",
          roles: ["Admin", "Superadmin"],
          children: [
            { key: "/leads", icon: <SolutionOutlined />, label: "Leads", roles: ["Admin", "Superadmin"] },
            { key: "/customers", icon: <UserOutlined />, label: "Customers", roles: ["Admin", "Superadmin"] },
            { key: "/quotation", icon: <FileTextOutlined />, label: "Quotations", roles: ["Admin", "Superadmin"] },
            // { key: "/invoice", icon: <ShoppingOutlined />, label: "Invoices", roles: ["Admin", "Superadmin"] },
            // {
            //   key: "/daily-reports",
            //   icon: <TableOutlined />,
            //   label: "Settings",
            //   roles: ["Superadmin", "Admin", "Employee"],
            // },
            { key: "/products", icon: <FileAddOutlined />, label: "Products", roles: ["Admin", "Superadmin"] },
          ],
        },
        {
          key: "/super-admin",
          icon: <UserSwitchOutlined />,
          label: collapsed ? null : "User Manage",
          roles: ["Superadmin", "Admin", "Employee"],
          children: [
            { 
              key: "/management",
              icon: <UsergroupAddOutlined />,
              label: "User Management",
              roles: ["Superadmin"],
            },
            
            {
              key: "/profile",
              icon: <UserOutlined />,
              label: "Profile",
              roles: ["Superadmin", "Admin", "Employee"],
            },
          ],
        },
      ],
    },
  ];

  // Filter logic to include only allowed menu items
  const filterByRole = (items) => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterByRole(item.children);
          if (filteredChildren.length > 0 && (!item.roles || item.roles.includes(role))) {
            return { ...item, children: filteredChildren };
          }
          return null;
        } else {
          return (!item.roles || item.roles.includes(role)) ? item : null;
        }
      })
      .filter(Boolean);
  };

  const menuItems = filterByRole(rawMenuItems);

  const handleMenuClick = ({ key }) => {
    const isLeafNode = !menuItems.some((group) =>
      group.children?.some((item) => item.key === key && item.children)
    );

    if (isLeafNode) {
      navigate(key);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        height: "100vh",
        overflowY: "auto",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <img
          src={collapsed ? logoCollapsed : logoExpanded}
          alt="Logo"
          style={{
            padding: 10,
            height: "auto", // Fixed height
            width: collapsed ? 59 : 170, // Dynamic width based on 'collapsed'
            transition: "all 0.3s", // Smooth transition for changes
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={["/dashboard", "/application", "/super-admin"]}
        onClick={handleMenuClick}
        style={{
          height: "calc(100% - 64px)",
          borderRight: 0,
        }}
        items={menuItems}
        theme="light"
        inlineCollapsed={collapsed}
      />
    </div>
  );
};

export default Sidebar;
