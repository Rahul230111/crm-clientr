import { Layout } from 'antd';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useState } from 'react';

const { Sider, Content, Header } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0 }}>
          <TopNavbar collapsed={collapsed} />
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
