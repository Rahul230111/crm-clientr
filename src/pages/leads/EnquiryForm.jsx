// File: src/components/leads/EnquiryForm.jsx
import React, { useState } from "react";
import { 
  Button, 
  Drawer, 
  Row, 
  Col, 
  Space, 
  Typography, 
  Card, 
  Badge, 
  Avatar, 
  List, 
  Tag,
  Grid,
  Modal
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, PushpinOutlined,
  CalendarOutlined, ClockCircleOutlined, TeamOutlined, ToolOutlined, ThunderboltOutlined,
  InfoCircleOutlined, ApartmentOutlined, ContainerOutlined, FileOutlined,
  CheckCircleOutlined, CloseCircleOutlined, 
  IdcardOutlined
} from '@ant-design/icons';
import dayjs from "dayjs";
import { getImageSrc } from "../../../utils/image";
import Dropzone from "react-dropzone";
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const EnquiryForm = ({ visible, onClose, enquiry, fetchEnquiryData}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = !screens.lg;
  const [files, setFiles] = useState([])
  const formatDate = (date) => dayjs(date).format('DD MMM YYYY');

  const handleModalClose = () => {
    setIsUploadModalOpen(false);
    setFiles([])
  };


  const renderStatusBadge = (status) => {
    const statusConfig = {
      'New': { color: 'blue', text: 'NEW' },
      'In Progress': { color: 'orange', text: 'IN PROGRESS' },
      'Completed': { color: 'green', text: 'COMPLETED' },
      'On Hold': { color: 'red', text: 'ON HOLD' }
    };
    const config = statusConfig[status] || { color: 'default', text: status || 'NEW' };
    return <Badge color={config.color} text={config.text} />;
  };

  const renderPriorityBadge = (priority) => {
    const priorityConfig = {
      'High': { color: 'red', text: 'HIGH PRIORITY' },
      'Medium': { color: 'orange', text: 'MEDIUM PRIORITY' },
      'Low': { color: 'green', text: 'LOW PRIORITY' }
    };
    const config = priorityConfig[priority] || { color: 'default', text: priority || 'MEDIUM PRIORITY' };
    return <Badge status={config.color} text={config.text} />;
  };

  const renderYesNoTag = (value) => {
    if (value?.toLowerCase() === 'yes') {
      return <Tag icon={<CheckCircleOutlined />} color="green">Yes</Tag>;
    } else if (value?.toLowerCase() === 'no') {
      return <Tag icon={<CloseCircleOutlined />} color="red">No</Tag>;
    }
    return <Tag>{value || 'Not specified'}</Tag>;
  };

  const additionalServices = [
    { key: 'stabilityCertification', label: 'Stability Certification', value: enquiry?.stabilityCertification },
    { key: 'sfuAtFloorLevel', label: 'SFU at Floor Level', value: enquiry?.sfuAtFloorLevel },
    { key: 'laddersScaffolding', label: 'Ladders/Scaffolding', value: enquiry?.laddersScaffolding },
    { key: 'civilWorks', label: 'Civil Works', value: enquiry?.civilWorks },
    { key: 'unloading', label: 'Unloading', value: enquiry?.unloading },
    { key: 'cableProvision', label: 'Cable Provision', value: enquiry?.cableProvision },
    { key: 'thirdPartyInspection', label: 'Third Party Inspection', value: enquiry?.thirdPartyInspection },
    { key: 'chemicalAnchoring', label: 'Chemical Anchoring', value: enquiry?.chemicalAnchoring },
    { key: 'storageSecurity', label: 'Storage Security', value: enquiry?.storageSecurity },
    { key: 'transportation', label: 'Transportation', value: enquiry?.transportation },
    { key: 'foundationWorks', label: 'Foundation Works', value: enquiry?.foundationWorks },
    { key: 'supervision', label: 'Supervision', value: enquiry?.supervision },
    { key: 'erectionCommissioning', label: 'Erection & Commissioning', value: enquiry?.erectionCommissioning },
    { key: 'mobileCraneUnloading', label: 'Mobile Crane Unloading', value: enquiry?.mobileCraneUnloading },
    { key: 'mobileCraneEC', label: 'Mobile Crane EC', value: enquiry?.mobileCraneEC }
  ];

  const cardStyle = { 
    marginBottom: 24, 
    borderRadius: 12, 
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  };

  const cardBodyStyle = { padding: isMobile ? '16px' : '20px 24px' };

const handleDownload = async (fileId) => {
  try {
    // Call your API
    const response = await fetch(`https://crmserver-lmg7w.ondigitalocean.app/files/${enquiry._id}/${fileId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Convert response to Blob
    const blob = await response.blob();

    // Create temporary download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Try to get filename from response header
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "download";
    if (contentDisposition && contentDisposition.includes("filename=")) {
      filename = contentDisposition
        .split("filename=")[1]
        .replace(/['"]/g, "")
        .trim();
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
};

const handleQuotationDownload = async (fileId) => {
  try {
    // Call your API
    const response = await fetch(`https://crmserver-lmg7w.ondigitalocean.app/files/quotation/${enquiry._id}/${fileId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    // Convert response to Blob
    const blob = await response.blob();

    // Create temporary download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Try to get filename from response header
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "download";
    if (contentDisposition && contentDisposition.includes("filename=")) {
      filename = contentDisposition
        .split("filename=")[1]
        .replace(/['"]/g, "")
        .trim();
    }

    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Clean up
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
};


  const handleFileDrop = (acceptedFiles) => {
  const mappedFiles = acceptedFiles.map((file) => ({
    name: file.name,
    type: file.type,
    file: file,
    preview: URL.createObjectURL(file),
  }));
  setFiles((prev) => [...prev, ...mappedFiles]);
};

  const handleUploadQuotation = async () => {
  if (files.length === 0) {
    console.log("Please select at least one file.");
    return;
  }

  try {
    const formData = new FormData();

    files.forEach((f) => {
      formData.append("files", f.file); // key must match multer field
    });

    formData.append("createdBy", user._id); 
    
    const response = await fetch(
      `https://crmserver-lmg7w.ondigitalocean.app/enquiries/${enquiry._id}/quotation`,
      {
        method: "PUT",
        body: formData,
      }
    );

    const result = await response.json();
    if (response.ok && result.success) {
        console.log("Quotation updated successfully!");
        setFiles([])
        fetchEnquiryData();
        handleModalClose()
        
    } else {
      throw new Error(result.message || "Failed to update quotation");
    }
  } catch (error) {
    console.error("Error updating quotation:", error);
    console.error("Failed to update quotation. Please try again.");
  }
};



  return (
    <Drawer
      title={
        <Space>
          {/* <UserOutlined style={{ color: '#1890ff', fontSize: isMobile ? 18 : 20 }} /> */}
          <span style={{ fontWeight: 600, fontSize: isMobile ? 16 : 18 }}>Specifications</span>
        </Space>
      }
      width={isMobile ? '100%' : (isTablet ? 700 : 1000)}
      onClose={onClose}
      open={visible}
      bodyStyle={{ 
        padding: isMobile ? '16px 16px 60px 16px' : '30px 30px 50px 30px', 
        background: '#fafafa' 
      }}
     footer={
        <div style={{ textAlign: 'right' }}>
        {user.role === "QTTEAM" && 
          <Button
            type="primary"
            onClick={() => setIsUploadModalOpen(true)} 
            size={isMobile ? 'middle' : 'large'}
            style={{ marginRight: 8 }} 
          >
            Upload Quotation
          </Button>
          }
          <Button
            type="primary"
            onClick={onClose}
            size={isMobile ? 'middle' : 'large'}
          >
            Close
          </Button>
        </div>
      }

      headerStyle={{ 
        borderBottom: '1px solid #f0f0f0', 
        background: '#fff', 
        padding: isMobile ? '12px 16px' : '16px 30px' 
      }}
    >
      {enquiry ? (
        <>
          {/* Header Card */}
          <Card bordered={false} style={{ ...cardStyle, marginBottom: isMobile ? 20 : 30 }} bodyStyle={{ padding: isMobile ? 20 : 30 }}>
            <Row justify="space-between" align="middle" gutter={isMobile ? 16 : 0}>
              <Col xs={24} md={12}>
                <Space size="middle" align="start" direction={isMobile ? "vertical" : "horizontal"}>
                  <div>
                    {/* <Title level={isMobile ? 3 : 2} style={{ margin: 0, fontWeight: 600 }}>{enquiry.clientName || 'Unnamed Client'}</Title>
                    <Text type="secondary" style={{ fontSize: isMobile ? 14 : 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <MailOutlined /> {enquiry.email || 'No email provided'}
                    </Text> */}
                    <Space size="middle" style={{ marginTop: 12 }} wrap>
                      {renderStatusBadge(enquiry.status)}
                      {renderPriorityBadge(enquiry.priority)}
                      <Tag icon={<CalendarOutlined />} color="blue" style={{ borderRadius: 20, padding: '6px 14px', fontWeight: 500 }}>
                    {enquiry.enquiryType || 'General Enquiry'}
                  </Tag>
                    </Space>
                  </div>
                </Space>
              </Col>
              <Col xs={24} md={6}>
                <Space direction="vertical" align={isMobile ? "start" : "end"} style={{ marginTop: isMobile ? 16 : 0 }}>
                  
                  <Text type="secondary" style={{ fontSize: isMobile ? 14 : 15, marginTop: 8 }}>
                    Created on {formatDate(enquiry.createdAt)}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>

          <Row gutter={isMobile ? 0 : 30}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              {/* Client Details */}
              {/* <Card 
                title={<Space><TeamOutlined />Client Details</Space>} 
                bordered={false} 
                style={cardStyle} 
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {[
                    { icon: <UserOutlined />, label: 'Client Name', value: enquiry.clientName },
                    { icon: <MailOutlined />, label: 'Email', value: enquiry.email },
                    { icon: <EnvironmentOutlined />, label: 'Site Location', value: enquiry.siteLocation },
                    { icon: <PushpinOutlined />, label: 'Full Address', value: enquiry.fullAddress }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12 }}>
                      {React.cloneElement(item.icon, { style: { color: '#1890ff', fontSize: 16, marginTop: 4, flexShrink: 0 } })}
                      <div style={{ overflow: 'hidden' }}>
                        <Text strong>{item.label}</Text>
                        <Text style={{ fontSize: 15, display: 'block', wordBreak: 'break-word' }}>{item.value || 'N/A'}</Text>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card> */}

              {/* Contact Info */}
              {/* <Card 
                title={<Space><TeamOutlined />Contact Information</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Row gutter={isMobile ? 0 : 16}>
                  {[
                    { title: 'Primary Contact', name: enquiry.contactName1, phone: enquiry.phone1, email: enquiry.email1 },
                    { title: 'Secondary Contact', name: enquiry.contactName2, phone: enquiry.phone2, email: enquiry.email2 }
                  ].map((contact, i) => (
                    <Col xs={24} md={12} key={i} style={{ marginBottom: isMobile ? 16 : 0 }}>
                      <Card 
                        size="small" 
                        bodyStyle={{ 
                          padding: 16, 
                          background: '#f9f9f9', 
                          borderRadius: 8,
                          height: '100%'
                        }}
                      >
                        <Title level={5}>{contact.title}</Title>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <UserOutlined style={{ color: '#1890ff', flexShrink: 0 }} />
                            <Text strong style={{ wordBreak: 'break-word' }}>{contact.name || 'N/A'}</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <PhoneOutlined style={{ color: '#1890ff', flexShrink: 0 }} />
                            <Text style={{ wordBreak: 'break-word' }}>{contact.phone || 'N/A'}</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <MailOutlined style={{ color: '#1890ff', flexShrink: 0 }} />
                            <Text style={{ wordBreak: 'break-word' }}>{contact.email || 'N/A'}</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card> */}

              {/* Equipment Requirements */}
              <Card 
                title={<Space><ToolOutlined />Equipment Requirements</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {[
                    { icon: <ToolOutlined />, label: 'Equipment', value: enquiry.equipment },
                    { icon: <ThunderboltOutlined />, label: 'Capacity', value: enquiry.capacity },
                    { icon: <ContainerOutlined />, label: 'Quantity', value: enquiry.quantity },
                    { icon: <InfoCircleOutlined />, label: 'Table Size', value: enquiry.tableSize }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {React.cloneElement(item.icon, { style: { color: '#1890ff', fontSize: 16, flexShrink: 0 } })}
                      <div style={{ overflow: 'hidden' }}>
                        <Text strong style={{ display: 'block' }}>{item.label}</Text>
                        {item.label === 'Quantity' ? (
                          <Badge count={item.value || 0} showZero style={{ backgroundColor: '#52c41a' }} />
                        ) : (
                          <Text style={{ wordBreak: 'break-word' }}>{item.value || 'N/A'}</Text>
                        )}
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>

              <Card 
                title={<Space><ApartmentOutlined />Scopes's</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <List
                  size="large"
                  dataSource={additionalServices.filter(s => s.value)}
                  renderItem={item => (
                    <List.Item style={{ padding: 8, border: 'none' }}>
                      <Space wrap>
                        {renderYesNoTag(item.value)}
                        <Text>{item.label}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
              
            </Col>
            

            {/* Right Column */}
            <Col xs={24} lg={12}>
              {/* Enquiry Details */}
              <Card 
                title={<Space><InfoCircleOutlined />Enquiry Details</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {[
                    { icon: <CalendarOutlined />, label: 'Enquiry Date : ', value: enquiry.enquiryDate },
                    { icon: <ClockCircleOutlined />, label: 'Target Date : ', value: enquiry.targetDate },
                    { icon: <CalendarOutlined />, label: 'Finalization Date : ', value: enquiry.finalizationDate },
                    { icon: <ClockCircleOutlined />, label: 'Delivery Lead Time : ', value: enquiry.deliveryLeadTime }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {React.cloneElement(item.icon, { style: { color: '#1890ff', fontSize: 16, flexShrink: 0 } })}
                      <div style={{ overflow: 'hidden' }}>
                        <Text strong>{item.label}</Text>
                        <Text style={{ wordBreak: 'break-word' }}>
                          {item.value ? (item.label.includes('Date') ? formatDate(item.value) : item.value) : 'N/A'}
                        </Text>
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>

              {/* Additional Services */}
              

              {/* Additional Info */}
              <Card 
                title={<Space><InfoCircleOutlined />Additional Information</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <Text strong>Is Hazardous : </Text>
                      {renderYesNoTag(enquiry.isHazardous)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <Text strong>Operation Location : </Text>
                      <Text style={{ wordBreak: 'break-word' }}>{enquiry.operationLocation || 'N/A'}</Text>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <ToolOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <Text strong>Equipment Application : </Text>
                      <Text style={{ wordBreak: 'break-word' }}>{enquiry.equipmentApplication || 'N/A'}</Text>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <FileOutlined style={{ color: '#1890ff', fontSize: 16, marginTop: 4, flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <Text strong>Remarks : </Text>
                      <Text style={{ wordBreak: 'break-word' }}>{enquiry.remarks || 'No remarks provided'}</Text>
                    </div>
                  </div>
                </Space>
              </Card>
              {enquiry.businessCard?.filename &&
              <Card 
                title={<Space><IdcardOutlined />Business Card</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <img 
                      src={getImageSrc(enquiry.businessCard)} 
                      alt={enquiry.businessCard?.filename || "Business Card"} 
                      style={{ maxWidth: "100%", borderRadius: 8 }} 
                    />
                  </div>
                </Space>
              </Card>
              }
              {enquiry.siteLayout.length > 0 &&
                <Card 
                title={<Space><IdcardOutlined />Site Layouts</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                   
                    {enquiry.siteLayout.map((file)=> (
                      <Button onClick={()=> {handleDownload(file._id)}}>{file.filename}</Button>
                    )) }
                  
                  </div>
                </Space>
              </Card>
              }
                {enquiry.quotationFile.length > 0 &&
                <Card 
                title={<Space><IdcardOutlined />Quotation Uploads</Space>} 
                bordered={false} 
                style={cardStyle}
                headStyle={{ 
                  borderBottom: '1px solid #f0f0f0', 
                  fontWeight: 600,
                  padding: isMobile ? '0 16px' : '0 24px'
                }}
                bodyStyle={cardBodyStyle}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                   
                    {enquiry.quotationFile.map((file)=> (
                      <Button onClick={()=> {handleQuotationDownload(file._id)}}>{file.fileName}</Button>
                    )) }
                  
                  </div>
                </Space>
              </Card>
              }
            </Col>
          </Row>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Text type="secondary">No Enquiry data available</Text>
        </div>
      )}
        <Modal
        title="Upload as PDF or Doc"
        open={isUploadModalOpen}
        onCancel={handleModalClose}
        footer={null} // you can add buttons here if needed
        centered
        >
       
       <Dropzone onDrop={handleFileDrop} maxFiles={10}>
          {({ getRootProps, getInputProps }) => (
            <section>
              <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                <input {...getInputProps()} />
                {files.length === 0 && (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button type="dashed">Upload Site Layout Files</Button>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="dz-preview-container">
                    {files.map((file, index) => (
                      <div key={index} className="dz-preview dz-processing dz-file-preview dz-complete">
                        {file.type.startsWith("image/") ? (
                          <img style={{ width: "100px" }} src={file.preview} alt={file.name} />
                        ) : (
                          <div style={{ padding: "5px", border: "1px solid #ddd", borderRadius: "5px", marginTop:"30px" }}>
                            📄 {file.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </Dropzone>

        <Button style={{marginTop:"30px"}} type="primary" onClick={handleUploadQuotation}>
          Submit
        </Button>
      </Modal>
    </Drawer>
    
  );
};

export default EnquiryForm;