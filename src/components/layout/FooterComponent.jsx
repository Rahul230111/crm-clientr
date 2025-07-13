// FooterComponent.jsx
import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterComponent = () => {
  return (
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: '#f0f2f5',
        padding: '16px 50px',
        position: 'relative',
        bottom: 0,
        width: '100%',
        borderTop: '1px solid #e8e8e8',
        fontSize: '14px',
        color: '#555',
      }}
    >
      © {new Date().getFullYear()} All rights are reserved by <strong>MegaCrane</strong> | 
      Design and developed by <strong>Acculermeda</strong>
    </Footer>
  );
};

export default FooterComponent;
