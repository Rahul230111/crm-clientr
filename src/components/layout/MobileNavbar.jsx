import React from "react";
import {
  DashboardOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  UserOutlined,
  FileTextOutlined,
  FileAddOutlined,
  UserSwitchOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import "./MobileTabMenu.css";

const MobileNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Nested menu structure
  const mobileMenuItems = [
    {
      key: "main-menu",
      type: "group",
      label: "MAIN MENU",
      children: [
        {
          key: "/dashboard",
          icon: <DashboardOutlined />,
          label: "Dashboard",
          roles: ["Admin", "Superadmin", "Employee"],
          children: [
            {
              key: "/dashboard/deals",
              icon: <DashboardOutlined />,
              label: "Leads Dashboard",
              roles: ["Admin", "Superadmin"],
            },
          ],
        },
        {
          key: "/application",
          icon: <AppstoreOutlined />,
          label: "Application",
          roles: ["Admin", "Superadmin"],
          children: [
            {
              key: "/leads",
              icon: <SolutionOutlined />,
              label: "Enquiry Leads",
              roles: ["Admin", "Superadmin"],
            },
            {
              key: "/customers",
              icon: <UserOutlined />,
              label: "Customers",
              roles: ["Admin", "Superadmin"],
            },
            {
              key: "/quotation",
              icon: <FileTextOutlined />,
              label: "Quotations",
              roles: ["Admin", "Superadmin"],
            },
            {
              key: "/products",
              icon: <FileAddOutlined />,
              label: "Products",
              roles: ["Admin", "Superadmin"],
            },
          ],
        },
        {
          key: "/super-admin",
          icon: <UserSwitchOutlined />,
          label: "User Management",
          roles: ["Superadmin", "Admin", "Employee"],
          children: [
            {
              key: "/users",
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

  // 🔍 Recursively collect leaf items that match the user's role
  const getLeafMenuItems = (items) => {
    let result = [];
    for (const item of items) {
      if (item.children) {
        result = result.concat(getLeafMenuItems(item.children));
      } else if (item.roles?.includes(role)) {
        result.push(item);
      }
    }
    return result;
  };

  const leafMenuItems = getLeafMenuItems(mobileMenuItems);

  // 💡 Optionally limit to 4 items to keep mobile menu clean
  const visibleItems = leafMenuItems.slice(0, 4);

  return (
    <div className="mobile-tab-menu">
      {visibleItems.map((item) => (
        <div
          key={item.key}
          onClick={() => navigate(item.key)}
          className={location.pathname === item.key ? "active-tab" : ""}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default MobileNavbar;
