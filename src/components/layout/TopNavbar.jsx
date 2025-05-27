import { Avatar, Dropdown, Menu, Space } from 'antd';
import { LogoutOutlined, SettingOutlined, UserOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  // Dropdown Menu for Avatar
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleProfile}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={handleSettings}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 64,
      padding: '0 16px',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,21,41,.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Sidebar Toggle Button */}
      <div
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        
      </div>

      {/* Avatar with Dropdown */}
      <Space>
        <Dropdown overlay={menu} placement="bottomRight" arrow>
          <Avatar
            style={{
              backgroundColor: '#fde3cf',
              color: '#f56a00',
              cursor: 'pointer'
            }}
          >
            S
          </Avatar>
        </Dropdown>
      </Space>
    </div>
  );
};

export default TopNavbar;
