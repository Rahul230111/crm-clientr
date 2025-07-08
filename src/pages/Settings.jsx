import { Layout, Tabs, theme } from 'antd';
import React, { useState } from 'react';
import CompanyProfile from './settings/Companyprofile'; 
import CompanyLogo from './settings/CompanyLogo'; 

const { Content } = Layout;

const Settings = () => {
  const [activeTabKey, setActiveTabKey] = useState('companySettings'); // State for active tab

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleTabChange = (key) => {
    setActiveTabKey(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}> 
      <Content
        style={{
  
          background: colorBgContainer,
          borderRadius: borderRadiusLG,
        }}
      >
        <Tabs
          defaultActiveKey="companySettings" // Initial active tab
          activeKey={activeTabKey} // Control active tab with state
          onChange={handleTabChange} // Handle tab change
          tabPosition="top" // You can change to 'left', 'right', 'bottom' if desired
          items={[
            {
              label: 'General Settings',
              key: 'generalSettings',
              children: (
                // Render your GeneralSettings component here
                // For now, a placeholder div:
                <div style={{ padding: '24px' }}>Content for General Settings tab</div>
              ),
            },
            {
              label: 'Company Settings',
              key: 'companySettings',
              children: <CompanyProfile />, // Your CompanyProfile component goes here
            },
            {
              label: 'Company Logo',
              key: 'companyLogo',
              children: <CompanyLogo />, // <--- RENDER YOUR CompanyLogo COMPONENT HERE!
            },
            // You can add a separate tab for signature upload if you have one
            // {
            //   label: 'Signature Upload',
            //   key: 'signatureUpload',
            //   children: <SignatureUploadComponent />,
            // },
            {
              label: 'Currency Settings',
              key: 'currencySettings',
              children: (
                <div style={{ padding: '24px' }}>Content for Currency Settings tab</div>
              ),
            },
            {
              label: 'PDF Settings',
              key: 'pdfSettings',
              children: (
                <div style={{ padding: '24px' }}>Content for PDF Settings tab</div>
              ),
            },
            {
              label: 'Finance Settings',
              key: 'financeSettings',
              children: (
                <div style={{ padding: '24px' }}>Content for Finance Settings tab</div>
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default Settings;