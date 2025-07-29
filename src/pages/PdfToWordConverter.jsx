import React from 'react';
import { Card, Button, Typography, Space } from 'antd';

const { Title, Text } = Typography;

const PdfToWordConverter = () => {
  return (
    <div
      style={{
        minHeight: '70vh',
        background: 'linear-gradient(to right, #f5f5fa, #f5f5fa)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
      }}
    >
      <Card
        bordered={false}
        style={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderRadius: 12,
        }}
      >
        <Space direction="vertical" size="middle">
          <Title level={2}>Convert PDF to Word</Title>
          <Text>
            Click the button below to use a free online tool for converting your PDF to Word documents.
          </Text>
          <a
            href="https://www.ilovepdf.com/pdf_to_word"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary" size="large">
              Go to PDF to Word Converter
            </Button>
          </a>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            100% Free | No Login Required | Unlimited Use
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default PdfToWordConverter;
