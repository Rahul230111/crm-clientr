import { Menu } from 'antd';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

import logoCollapsed from '../../assets/Submark Logo 01.png';
import logoExpanded from '../../assets/Primary Logo 01.png';

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Logo Area */}
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
        selectedKeys={[location.pathname]}
        onClick={({ key }) => navigate(key)}
        style={{ height: '100%', borderRight: 0 }}
        items={[
          { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
          { key: '/leads', icon: <UserOutlined />, label: 'Leads' },
          { key: '/invoice', icon: <UserOutlined />, label: 'Leads' },
        ]}
      />
    </>
  );
};

export default Sidebar;
