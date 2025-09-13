// File: src/components/leads/EnquiryForm.jsx
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Radio,
  DatePicker,
  Upload,
  Select,
  Row,
  Col,
  Divider,
  Switch,
  Card,
  Typography,
  message,
  Steps,
  InputNumber
} from "antd";
import {
  UploadOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const EnquiryInnerPage = ({ onClose, quotation }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isHazardousOther, setIsHazardousOther] = useState(false);
  const [isAccessoriesOther, setIsAccessoriesOther] = useState(false);
  const [isValueAddedOther, setIsValueAddedOther] = useState(false);
  const [howKnowUs, setHowKnowUs] = useState(null);
  const [enquiryType, setEnquiryType] = useState(null);
  const [howGetEnquiry, setHowGetEnquiry] = useState(null);
  const [visible, setVisible] = useState(false);

  // Scope questions with switches
  const scopeQuestions = [
    "Stability certification",
    "SFU at Floor level",
    "Ladders, Scaffolding, Platforms",
    "Civil works",
    "Unloading",
    "Provision of Cable upto DSL Level",
    "Third Party inspection & Certification",
    "Chemical Anchoring",
    "Storage & Security",
    "Transportation",
    "Foundation Works",
    "Supervision for Erection & Commissioning",
    "Erection & Commissioning",
    "Mobile crane arrangement for Unloading",
    "Mobile crane arrangement for E&C"
  ];

  const equipmentOptions = [
    "SG EOT Crane", "DG EOT Crane", "SG Gantry Crane", "DG Grantry Crane",
    "SG Semi-Gantry Crane", "DG Semi-Grantry Crane", "SG HOT Crane", "DG Hot Crane",
    "SG Underslung Crane", "Lattice type Gantry Crane", "SG Circular EOT Crane",
    "SG Circular HOT Crane", "Monorail (Straight) Hoist", "Monorail (Curved) Hoist",
    "LCS (Steel) Monorail Hoist", "LCS (Aluminium) Monorail Hoist", "Self-Supported Jib Crane",
    "Wall-mounted Jib Crane", "LCS (Steel) Self-supported Jib Crane", "LCS (Steel) Wall-mounted Jib Crane",
    "LCS (Aluminium) Self-supported Jib Crane", "LCS (Aluminium) Wall-mounted Jib Crane",
    "Goods Lift", "Transfer Trolley", "Portable Crane ('A' Frame)",
    "LCS (Steel) Portable Crane ('A' Frame)", "LCS (Aluminium) Portable Crane ('A' Frame)",
    "KITO Aluminium Portable Crane", "LCS (Steel) XY Crane", "LCS (Aluminium) XY Crane"
  ];

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    onClose();
  };

  const handleSubmit = async (values) => {
    try {
      // Format dates before submission
      const formattedValues = {
        ...values,
        targetDate: values.targetDate ? values.targetDate.format('YYYY-MM-DD') : null,
        enquiryDate: values.enquiryDate ? values.enquiryDate.format('YYYY-MM-DD') : null
      };

      // Submit to Google Sheets via AppScript
      const response = await fetch('YOUR_APPSCRIPT_WEB_APP_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedValues),
      });

      if (response.ok) {
        message.success('Enquiry submitted successfully!');
        handleCancel();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit enquiry. Please try again.');
    }
  };

  const nextStep = () => {
    form.validateFields(steps[currentStep].fields)
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Client Details',
      fields: ['email', 'clientName', 'fullAddress', 'siteLocation', 'businessCard', 
              'contactName1', 'phone1', 'email1', 'contactName2', 'phone2', 'email2',
              'targetDate', 'howKnowUs', 'mutualReference', 'howGetEnquiry', 'enquiryDate', 'enquiryType'],
      content: (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
              >
                <Input placeholder="Client email address" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="clientName"
                label="Client Name"
                rules={[{ required: true, message: 'Please enter client name!' }]}
              >
                <Input placeholder="Full client name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="fullAddress"
            label="Full Address"
            rules={[{ required: true, message: 'Please enter full address!' }]}
          >
            <TextArea rows={3} placeholder="Complete address of the client" />
          </Form.Item>

          <Form.Item
            name="siteLocation"
            label="Site Location"
            rules={[{ required: true, message: 'Please enter site location!' }]}
          >
            <Input placeholder="Location where equipment will be installed" />
          </Form.Item>

          <Form.Item
            name="businessCard"
            label="Upload client's business card"
            valuePropName="fileList"
           
          >
            <Upload
              listType="picture"
              maxCount={1}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                const isLt1M = file.size / 1024 / 1024 < 1;
                
                if (!isImage) {
                  message.error('You can only upload image files!');
                }
                if (!isLt1M) {
                  message.error('Image must be smaller than 1MB!');
                }
                
                return isImage && isLt1M ? false : Upload.LIST_IGNORE;
              }}
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>

          <Divider>Primary Contact Person</Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="contactName1"
                label="Name with Designation"
                rules={[{ required: true, message: 'Please enter contact name!' }]}
              >
                <Input placeholder="Name & designation" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone1"
                label="Mobile/Phone Number"
                rules={[{ required: true, message: 'Please enter phone number!' }]}
              >
                <Input placeholder="Contact number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="email1"
                label="Email ID"
                rules={[{ required: true, type: 'email', message: 'Please enter valid email!' }]}
              >
                <Input placeholder="Contact email" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Secondary Contact Person (Optional)</Divider>
          
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="contactName2" label="Name with Designation">
                <Input placeholder="Name & designation" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="phone2" label="Mobile/Phone Number">
                <Input placeholder="Contact number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                name="email2" 
                label="Email ID"
                rules={[{ type: 'email', message: 'Please enter valid email!' }]}
              >
                <Input placeholder="Contact email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="targetDate"
                label="Target date for submitting quotation"
                rules={[{ required: true, message: 'Please select target date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="howKnowUs"
                label="How do you know us?"
                rules={[{ required: true, message: 'Please select an option!' }]}
              >
                <Radio.Group onChange={(e) => setHowKnowUs(e.target.value)}>
                  <Row>
                    <Col xs={24} md={8}><Radio value="gateCrash">Gate Crash</Radio></Col>
                    <Col xs={24} md={8}><Radio value="website">Website</Radio></Col>
                    <Col xs={24} md={8}><Radio value="exhibition">Exhibition</Radio></Col>
                    <Col xs={24} md={8}><Radio value="referral">Referral</Radio></Col>
                    <Col xs={24} md={8}><Radio value="socialMedia">Social Media</Radio></Col>
                    <Col xs={24} md={8}><Radio value="coldCall">Cold call</Radio></Col>
                  </Row>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="mutualReference" label="Any Mutual Reference">
            <Input placeholder="Enter mutual reference if any" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="howGetEnquiry"
                label="How did you get this enquiry?"
                rules={[{ required: true, message: 'Please select an option!' }]}
              >
                <Radio.Group onChange={(e) => setHowGetEnquiry(e.target.value)}>
                  <Radio value="visit">Visit</Radio>
                  <Radio value="phone">Phone</Radio>
                  <Radio value="mail">Mail</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="enquiryDate"
                label="When did you receive the enquiry?"
                rules={[{ required: true, message: 'Please select date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="enquiryType"
            label="Type of Enquiry"
            rules={[{ required: true, message: 'Please select enquiry type!' }]}
          >
            <Radio.Group onChange={(e) => setEnquiryType(e.target.value)}>
              <Radio value="budgetary">Budgetary</Radio>
              <Radio value="firm">Firm</Radio>
            </Radio.Group>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Equipment Details',
      fields: ['deliveryLeadTime', 'finalizationDate', 'otherCranes', 'isHazardous', 
              'hazardousOther', 'operationLocation', 'equipmentApplication', 
              'liftingTime', 'operationTime', 'dailyOperationTime', 'equipment'],
      content: (
        <>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="deliveryLeadTime" label="Client's expected delivery lead time">
                <Input placeholder="Expected delivery timeline" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="finalizationDate" label="When it will be finalized?">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="otherCranes" label="Do they use any other make cranes? Kindly mention the make">
            <Input placeholder="List other crane makes used" />
          </Form.Item>

          <Form.Item
            name="isHazardous"
            label="Is Hazardous area?"
            rules={[{ required: true, message: 'Please select an option!' }]}
          >
            <Radio.Group onChange={(e) => setIsHazardousOther(e.target.value === 'other')}>
              <Radio value="safe">Safe</Radio>
              <Radio value="flameproof">Flameproof</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          {isHazardousOther && (
            <Form.Item
              name="hazardousOther"
              label="Please specify"
              rules={[{ required: true, message: 'Please specify the hazardous type!' }]}
            >
              <Input placeholder="Specify hazardous type" />
            </Form.Item>
          )}

          <Form.Item
            name="operationLocation"
            label="Equipment operation at"
            rules={[{ required: true, message: 'Please select operation location!' }]}
          >
            <Radio.Group>
              <Radio value="indoor">Indoor</Radio>
              <Radio value="outdoor">Outdoor</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="equipmentApplication"
            label="Application of the equipment"
            rules={[{ required: true, message: 'Please enter equipment application!' }]}
          >
            <TextArea rows={2} placeholder="Describe the equipment's intended use" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="liftingTime"
                label="Lifting/Main motor on time (t1+t3) in sec."
                rules={[{ required: true, message: 'Please enter lifting time!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter time in seconds" 
                />
              </Form.Item>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text type="secondary">[Space for lifting time diagram image]</Text>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="operationTime"
                label="Operation time per cycle in sec. (t1+t2+t3+t4)"
                rules={[{ required: true, message: 'Please enter operation time!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter time in seconds" 
                />
              </Form.Item>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Text type="secondary">[Space for operation cycle diagram image]</Text>
              </div>
            </Col>
          </Row>

          <Form.Item name="dailyOperationTime" label="Total operating time of the equipment per day in hrs.">
            <InputNumber 
              min={0} 
              max={24} 
              style={{ width: '100%' }} 
              placeholder="Enter hours per day" 
            />
          </Form.Item>

          <Form.Item
            name="equipment"
            label="Equipment"
            rules={[{ required: true, message: 'Please select equipment!' }]}
          >
            <Select placeholder="Select equipment type">
              {equipmentOptions.map((equipment, index) => (
                <Option key={index} value={equipment}>{equipment}</Option>
              ))}
            </Select>
          </Form.Item>
        </>
      )
    },
    {
      title: 'Technical Specifications',
      fields: ['accessories', 'accessoriesOther', 'valueAdded', 'valueAddedOther', 
              'scopeQuestions', 'dutyClass', 'capacity', 'quantity', 'tableSize', 
              'travelLength', 'railLevel', 'siteLayout', 'jobType', 'maxWeight', 
              'maxHeight', 'maxLoadingHeight', 'heightConstraints', 'remarks'],
      content: (
        <>
          <Form.Item name="accessories" label="Accessories">
            <Radio.Group onChange={(e) => setIsAccessoriesOther(e.target.value === 'other')}>
              <Radio value="cableReeling">Cable Reeling Drum</Radio>
              <Radio value="rail">Rail</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          {isAccessoriesOther && (
            <Form.Item name="accessoriesOther" label="Please specify">
              <Input placeholder="Specify accessory" />
            </Form.Item>
          )}

          <Form.Item name="valueAdded" label="Value added items">
            <Radio.Group onChange={(e) => setIsValueAddedOther(e.target.value === 'other')}>
              <Radio value="vvvf">VVVF Drive</Radio>
              <Radio value="switchFuse">Switch Fuse Unit</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          {isValueAddedOther && (
            <Form.Item name="valueAddedOther" label="Please specify">
              <Input placeholder="Specify value added item" />
            </Form.Item>
          )}

          <Divider>Scope of Work</Divider>
          <Text strong>What is our scope? (Select MCIPL's Scope or Client's Scope for each)</Text>
          
          <Card size="small" style={{ marginTop: 16, marginBottom: 24 }}>
            {scopeQuestions.map((question, index) => (
              <Form.Item 
                key={index} 
                name={`scope_${index}`}
                label={question}
                style={{ marginBottom: 12 }}
              >
                <Radio.Group>
                  <Radio value="mcipl">MCIPL's Scope</Radio>
                  <Radio value="client">Client's Scope</Radio>
                </Radio.Group>
              </Form.Item>
            ))}
          </Card>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="dutyClass"
                label="Class of Duty"
                rules={[{ required: true, message: 'Please select duty class!' }]}
              >
                <Select placeholder="Select duty class">
                  <Option value="classII">Class-II</Option>
                  <Option value="classIII">Class-III</Option>
                  <Option value="classIV">Class-IV</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="capacity"
                label="Capacity in ton"
                rules={[{ required: true, message: 'Please enter capacity!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter capacity" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="quantity"
                label="Qty in Nos"
                rules={[{ required: true, message: 'Please enter quantity!' }]}
              >
                <InputNumber 
                  min={1} 
                  style={{ width: '100%' }} 
                  placeholder="Enter quantity" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="tableSize" label="Table Size in meter">
                <Input placeholder="Enter table size" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="travelLength" label="Travel length in meter">
                <Input placeholder="Enter travel length" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="railLevel" label="Required level of rail">
            <Select placeholder="Select rail level">
              <Option value="aboveFloor">Above floor</Option>
              <Option value="floorLevel">Floor level</Option>
              <Option value="insideFloor">Inside floor</Option>
              <Option value="notApplicable">Not Applicable</Option>
            </Select>
          </Form.Item>

          <Form.Item name="siteLayout" label="Site Layout">
            <Upload
              multiple
              maxCount={10}
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  message.error('File must be smaller than 10MB!');
                }
                return isLt10M ? false : Upload.LIST_IGNORE;
              }}
            >
              <Button icon={<UploadOutlined />}>Click to upload (Max 10 files, 10MB each)</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="jobType" label="Type of Job">
            <Input placeholder="Enter job type" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="maxWeight"
                label="Maximum weight of job in Kg"
                rules={[{ required: true, message: 'Please enter maximum weight!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter weight" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="maxHeight"
                label="Maximum Height of job in Mtrs"
                rules={[{ required: true, message: 'Please enter maximum height!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter height" 
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="maxLoadingHeight"
                label="Maximum Height of Loading base in Mtrs"
                rules={[{ required: true, message: 'Please enter loading height!' }]}
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter height" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="heightConstraints" label="If any height constrain? Kindly brief it">
            <TextArea rows={2} placeholder="Describe height constraints if any" />
          </Form.Item>

          <Form.Item name="remarks" label="Remarks">
            <TextArea rows={3} placeholder="Any additional remarks" />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <>
    <Button onClick={()=> setVisible(true)}> Click</Button>
    <Modal
      title={
        <div>
          <Title level={4}>Enquiry Form</Title>
          <Steps current={currentStep} size="small" style={{ marginTop: 16 }}>
            {steps.map((step, index) => (
              <Step key={index} title={step.title} />
            ))}
          </Steps>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        currentStep > 0 && (
          <Button key="back" onClick={prevStep} style={{ marginRight: 8 }}>
            <LeftOutlined /> Previous
          </Button>
        ),
        currentStep < steps.length - 1 ? (
          <Button key="next" type="primary" onClick={nextStep}>
            Next <RightOutlined />
          </Button>
        ) : (
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
          >
            Submit
          </Button>
        )
      ].filter(Boolean)}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          // Set initial values if editing an existing quotation
          ...quotation,
          targetDate: quotation?.targetDate ? dayjs(quotation.targetDate) : null,
          enquiryDate: quotation?.enquiryDate ? dayjs(quotation.enquiryDate) : null
        }}
      >
        {steps[currentStep].content}
      </Form>
    </Modal>
    </>
  );
};

export default EnquiryInnerPage;