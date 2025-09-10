// File: src/components/leads/EnquiryForm.jsx
import React from "react";
import { 
  Button, 
  Drawer, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Divider,
  List,
  Badge,
  Descriptions,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  ShopOutlined, 
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from "dayjs";

const { Title, Text } = Typography;

const EnquiryForm = ({ visible, onClose, quotation }) => {
  // Format price as INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return dayjs(date).format('DD MMM YYYY');
  };

  return (
    <Drawer
      title='Quotation Details'
      width={850}
      onClose={onClose}
      open={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>Close</Button>
        </div>
      }
    >
      {quotation ? (
        <div>
          {/* Header Section */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                {quotation.quotationNumber}
              </Title>
              <Text type="secondary">Created on {formatDate(quotation.createdAt)}</Text>
            </Col>
            <Col>
              <Badge 
                status={quotation.status === 'Sent' ? 'success' : 'processing'} 
                text={quotation.status || 'Draft'} 
              />
            </Col>
          </Row>

          <Divider />

          {/* Company and Customer Details */}
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}><ShopOutlined /> Company Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Business Name">
                  {quotation.businessName}
                </Descriptions.Item>
                <Descriptions.Item label="Business Type">
                  {quotation.businessType}
                </Descriptions.Item>
                <Descriptions.Item label="GSTIN">
                  {quotation.gstin || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Title level={5}><UserOutlined /> Customer Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Customer Name">
                  {quotation.customerName}
                </Descriptions.Item>
                {/* <Descriptions.Item label="Email">
                  {quotation.customerEmail}
                </Descriptions.Item> */}
                <Descriptions.Item label="Address">
                  {quotation.customerAddress}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          {/* Quotation Dates */}
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}><CalendarOutlined /> Dates</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Quotation Date">
                  {formatDate(quotation.date)}
                </Descriptions.Item>
                <Descriptions.Item label="Valid Until">
                  {formatDate(quotation.validUntil)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            {/* <Col span={12}>
              <Title level={5}>Created By</Title>
              <Text>{quotation.createdBy}</Text>
            </Col> */}
          </Row>

          <Divider />

          {/* Products List */}
          <Title level={5}>Products</Title>
          <List
            size="small"
            dataSource={quotation.items}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  title={`${index + 1}. ${item.productName || item.description}`}
                  description={
                    <div>
                      {item.specifications && item.specifications.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {item.specifications.map((spec, i) => (
                            <Tag key={i} color="blue">{spec.name}: {spec.value}</Tag>
                          ))}
                        </div>
                      )}
                      <div>
                        <Text>HSN/SAC: {item.hsnSac || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text>Quantity: {item.quantity} {item.quantityType}</Text>
                      </div>
                      <div>
                        <Text>Rate: {formatPrice(item.rate)}</Text>
                      </div>
                    </div>
                  }
                />
                <div>
                  <Text strong>{formatPrice(item.rate * item.quantity)}</Text>
                </div>
              </List.Item>
            )}
          />

          <Divider />

          {/* Pricing Summary */}
          <Row justify="end">
            <Col span={8}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Subtotal">
                  {formatPrice(quotation.subTotal)}
                </Descriptions.Item>
                <Descriptions.Item label="Tax">
                  {formatPrice(quotation.tax)}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <Text strong>{formatPrice(quotation.total)}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          {/* Notes */}
          {quotation.notes && quotation.notes.length > 0 && (
            <>
              <Title level={5}><FileTextOutlined /> Notes</Title>
              <List
                size="small"
                dataSource={quotation.notes}
                renderItem={(note, index) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Note ${index + 1} by ${note.author}`}
                      description={
                        <div>
                          <div>{note.text}</div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Added on: {note.timestamp}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="secondary">No quotation data available</Text>
        </div>
      )}
    </Drawer>
  );
};

export default EnquiryForm;