import { Layout } from 'antd';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { useState, useCallback, useEffect } from 'react';
import './layout.css';
import MobileNavbar from './MobileNavbar';
import FooterComponent from './FooterComponent'; // 👈 Import the Footer

const { Sider, Content, Header, Footer } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize); // Update on resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCollapse = useCallback((isCollapsed) => {
    setCollapsed(isCollapsed);
  }, []);

  return (
    <>
      <Layout className="main-layout" style={{ minHeight: '100vh' }}>
        {!isMobile && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={handleCollapse}
            breakpoint="lg"
            collapsedWidth="80"
            className="sidebar"
            theme="light"
          >
            <Sidebar collapsed={collapsed} />
          </Sider>
        )}

        <Layout>
          {/* ✅ TopNavbar always visible */}
          <Header className="top-navbar">
            <TopNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
          </Header>

          <Content className="main-content">
            <div className="inner-content">{children}</div>
          </Content>

        <FooterComponent /> {/* 👈 Include the FooterComponent here */}
        </Layout>
      </Layout>

      {/* ✅ Show MobileNavbar only on mobile */}
      {isMobile && <MobileNavbar />}
    </>
  );
};

export default MainLayout;
