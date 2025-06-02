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
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import logoCollapsed from '../../assets/Submark Logo 01.png';
import logoExpanded from '../../assets/Primary Logo 01.png';

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = '/' + location.pathname.split('/')[1];

  return (
    <>
      <div style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white'
      }}>
        <img
          src={collapsed ? logoCollapsed : logoExpanded}
          alt="Logo"
          style={{
            height: 40,
            width: 'auto',
            transition: 'all 0.3s'
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => navigate(key)}
        style={{ height: '100%', borderRight: 0 }}
        items={[
          { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
          { key: '/leads', icon: <SolutionOutlined />, label: 'Leads' },
          { key: '/customers', icon: <UserOutlined />, label: 'Customers' }, // ✅ ADDED
          { key: '/quotation', icon: <FileTextOutlined />, label: 'Quotations' },
          { key: '/invoice', icon: <ShoppingOutlined />, label: 'Invoices' },
          { key: '/users', icon: <UsergroupAddOutlined />, label: 'User Management' }
        ]}
      />
    </>
  );
};

export default Sidebar;
