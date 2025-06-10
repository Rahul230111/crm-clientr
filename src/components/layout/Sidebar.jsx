// Sidebar.jsx
import { Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  FileAddOutlined,
  UsergroupAddOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  AppstoreOutlined,
  ProjectOutlined,
  SettingOutlined,
  UserSwitchOutlined,
  // LayoutOutlined, // These icons are imported but not used in the provided menuItems
  // MobileOutlined,
  // DesktopOutlined,
  // TabletOutlined,
  // GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import logoCollapsed from '../../assets/Submark Logo 01.png';
import logoExpanded from '../../assets/Primary Logo 01.png';

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // This logic ensures that if the URL is '/dashboard/deals', selectedKey becomes '/dashboard'
  // for correct highlighting of the parent menu item.
  const selectedKey = '/' + location.pathname.split('/')[1];

  const menuItems = [
    {
      key: 'main-menu',
      type: 'group',
      // The label for the group is hidden when the sidebar is collapsed
      label: collapsed ? null : 'MAIN MENU',
      children: [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: collapsed ? null : 'Dashboard',
          children: [
            { key: '/dashboard/deals', label: 'Deals Dashboard' },
            { key: '/dashboard/leads', label: 'Leads Dashboard' },
            { key: '/dashboard/project', label: 'Project Dashboard' }
          ]
        },
        {
          key: '/application',
          icon: <AppstoreOutlined />,
          label: collapsed ? null : 'Application',
          children: [
            { key: '/leads', icon: <SolutionOutlined />, label: 'Leads' },
            { key: '/customers', icon: <UserOutlined />, label: 'Customers' },
            { key: '/quotation', icon: <FileTextOutlined />, label: 'Quotations' },
            { key: '/invoice', icon: <ShoppingOutlined />, label: 'Invoices' },
            { key: '/products', icon: <FileAddOutlined />, label: 'Products' }
          ]
        },
        {
          key: '/super-admin',
          icon: <UserSwitchOutlined />,
          label: collapsed ? null : 'Super Admin',
          children: [
            { key: '/users', icon: <UsergroupAddOutlined />, label: 'User Management' },
            { key: '/settings', icon: <SettingOutlined />, label: 'Settings' }
          ]
        }
      ]
    }
  ];

  const handleMenuClick = ({ key }) => { // Removed 'keyPath' as it's not used
    // Determine if the clicked item is a leaf node (i.e., has no children)
    // Only navigate if it's a leaf node to avoid navigating when clicking on a parent that expands/collapses.
    const isLeafNode = !menuItems.some(group =>
      group.children?.some(item =>
        item.key === key && item.children
      )
    );

    if (isLeafNode) {
      navigate(key);
    }
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh', // Occupy full viewport height
        overflowY: 'hidden', // Enable scrolling if menu content exceeds viewport height
        background: '#ffffff', // Ensures background color for the sticky element
                  // You might want to define a width here, or rely on a parent layout component (e.g., Ant Design's Sider)
                width: collapsed ? 80 : 200, // Example: adjust width based on collapsed state if not using AntD Sider directly
        }}
    >
      <div
        style={{
          height: 64, // Fixed height for the logo area
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'white',
          borderBottom: '1px solid #f0f0f0'
        }}
      >
        <img
          src={collapsed ? logoCollapsed : logoExpanded}
          alt="Logo"
          style={{
            height: 40,
            width: 'auto',
            transition: 'all 0.3s' // Smooth transition for logo size/visibility
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        // defaultOpenKeys keeps these sections expanded on initial load.
        // You might want to make this dynamic based on selectedKey or user preferences.
        defaultOpenKeys={['/dashboard', '/application', '/super-admin']} // Open all main sections by default
        onClick={handleMenuClick}
        style={{
          // Adjust menu height to fill the remaining space after the logo
          height: 'calc(100% - 64px)',
          borderRight: 0, // Remove default border
          background: '#fafafa'
        }}
        items={menuItems}
        theme="light" // Use light theme for the menu
        inlineCollapsed={collapsed} // Crucial Ant Design prop to collapse/expand the menu
      />
    </div>
  );
};

export default Sidebar;