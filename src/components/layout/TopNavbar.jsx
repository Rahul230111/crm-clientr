import { Avatar, Dropdown, Menu, Space, Badge, List, Divider } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logoExpanded from "../../assets/megacrane.png";
import './TopNavbar.css';
import axios from "../../api/axios"
import { useEffect, useState } from 'react';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"


const TopNavbar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [notificationData, setNotificationData] = useState([]);


  dayjs.extend(relativeTime);
  // fetch notification
// fetch notification
const fetchNotification = async () => {
  try {
    const response = await axios.get("/api/notification");
    if (response.status === 200) {
      let data = response.data.data;

      if (user?.role === "QTTEAM") {
        // QTTEAM → only QT notifications
        data = data.filter(item => item.notificationType === "QT");
      } else {
        // Others → exclude QT notifications
        data = data.filter(item => item.notificationType !== "QT");
      }

      setNotificationData(data);
    }
  } catch (err) {
    console.log(err);
  }
};


  useEffect(()=> {
    if(notificationData.length === 0){
      fetchNotification()
    }
  },[])

  // Sample notification data
  const notifications = [
    {
      id: 1,
      title: 'New Enquiry Arrived',
      description: 'New Enquiry Arrived to Qt team',
      time: '2 minutes ago',
      read: false
    },
    // {
    //   id: 2,
    //   title: 'Project Update',
    //   description: 'Your project has been approved by the team',
    //   time: '1 hour ago',
    //   read: false
    // },
    // {
    //   id: 3,
    //   title: 'Meeting Reminder',
    //   description: 'Team meeting starts in 30 minutes',
    //   time: '3 hours ago',
    //   read: true
    // },
    // {
    //   id: 4,
    //   title: 'System Alert',
    //   description: 'System maintenance scheduled for tomorrow',
    //   time: '5 hours ago',
    //   read: true
    // }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleNotificationClick = (id) => {
    // Handle notification click - mark as read, navigate, etc.
    console.log("Notification clicked:", id);
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  const handleMarkAllAsRead = () => {
    // Logic to mark all notifications as read
    console.log("Mark all as read");
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={handleProfile}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Notification dropdown content
  const notificationMenu = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h4>Notifications</h4>
        <a onClick={handleMarkAllAsRead}>Mark all as read</a>
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className="notification-list">
        <List
          itemLayout="horizontal"
          dataSource={notificationData}
          renderItem={item => (
            <List.Item 
              className={item.read ? 'notification-item read' : 'notification-item unread'}
              onClick={() => handleNotificationClick(item._id)}
            >
              <List.Item.Meta
                title={<span className="notification-title">{item.title}</span>}
                description={
                  <div className="notification-content">
                    <p className="notification-description">{item.message}</p>
                    <span className="notification-time">{dayjs(item.createdAt).fromNow()}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div className="notification-footer">
        <a onClick={handleViewAllNotifications}>View all notifications</a>
      </div>
    </div>
  );

  const getInitial = () => {
    if (!user) return 'U';
    return user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="top-navbar-container">
      {/* Show logo only on mobile */}
      <div className="mobile-logo-wrapper" onClick={() => setCollapsed(!collapsed)}>
        <img src={logoExpanded} alt="logo" className="moblelogo" />
      </div>

      {/* Notification bell and user avatar */}
      <Space>
        <Dropdown 
          overlay={notificationMenu} 
          placement="bottomRight" 
          trigger={['click']}
          overlayClassName="notification-dropdown-overlay"
        >
          <div style={{cursor: 'pointer'}}>
            <Badge count={notificationData?.length} size="small" offset={[-5, 5]}>
              <BellOutlined style={{ fontSize: '18px' }} />
            </Badge>
          </div>
        </Dropdown>
        
        <Dropdown overlay={profileMenu} placement="bottomRight" arrow>
          <Avatar
            style={{
              backgroundColor: '#1677ff',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {getInitial()}
          </Avatar>
        </Dropdown>
      </Space>
    </div>
  );
};

export default TopNavbar;