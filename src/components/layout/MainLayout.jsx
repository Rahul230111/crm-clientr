import { Layout } from 'antd';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useState } from 'react';
import './layout.css';

const { Sider, Content, Header } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="md"
        collapsedWidth="0"
        className="sidebar"
      >
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout>
        <Header className="top-navbar">
          <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
        </Header>
        <Content className="main-content">
          <div className="inner-content">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
