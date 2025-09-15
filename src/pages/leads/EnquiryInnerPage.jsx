// File: src/components/leads/EnquiryForm.jsx
import React, { useEffect, useState } from "react";
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
  Badge,
  Divider,
  Switch,
  Table,
  Card,
  Empty,
  Typography,
  message,
  Steps,
  InputNumber
} from "antd";
import {
  UploadOutlined,
  LeftOutlined,
  BackwardFilled,
  RightOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios"
import myImage from "../../assets/image.png";
import EnquiryForm from "./EnquiryForm";
import Dropzone from "react-dropzone";
import imageCompression from 'browser-image-compression';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const EnquiryInnerPage = ({ quotation }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [isHazardousOther, setIsHazardousOther] = useState(false);
  const [isAccessoriesOther, setIsAccessoriesOther] = useState(false);
  const [isValueAddedOther, setIsValueAddedOther] = useState(false);
  const [howKnowUs, setHowKnowUs] = useState(null);
  const [enquiryType, setEnquiryType] = useState(null);
  const [howGetEnquiry, setHowGetEnquiry] = useState(null);
  const [visible, setVisible] = useState(false);
  const [userAccount, setUserAccount] = useState({});
  const [stepValues, setStepValues] = useState({});
  const [enquiryData, setEnquiryData] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = localStorage.getItem("user");
  const [selectedQuotation, setSelectedQuotation] = useState(null)
  const [formVisible, setFormVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false)
  const [uploadedCardFile, setUploadedCardFile] = useState(null)
  let userName = "";
  let userId = "";
  if (userData) {
    const user = JSON.parse(userData);
    userName = user.name;
    userId = user._id || user.id;
  }

  const [files2, setFiles2] = useState([]);
  const [siteLayoutFiles, setSiteLayoutFiles] = useState([]);
  const fetchUserAcc = async () => {
    try {
      const { data } = await axios.get(`/api/accounts/${id}`);
      setUserAccount(data);
    } catch (err) {
      message.error("Failed to load account details");
    }
  };

  
  const fetchEnquiryData = async () => {
    try {
      const response = await axios.get(`/api/enquiry/${id}`);
      setEnquiryData(response.data.data);
      console.log(response.data.data)
    } catch (err) {
      message.error("Failed to load account details");
    }
  };

    useEffect(() => {
      fetchEnquiryData();
    }, [id]);

  useEffect(() => {
    if (Object.keys(userAccount).length === 0) {
      fetchUserAcc();
    }
  }, []);

  const onClose = () => {
    setVisible(false)
  }

   const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.05, // 50 KB
      maxWidthOrHeight: 1024,
      useWebWorker: true, 
    };
  
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, { type: file.type });
    } catch (error) {
      console.error("Image compression failed:", error);
      throw error; 
    }
  };


  // dropzone
    const handleDropChange = async(acceptedFiles) => {
    
    const file = acceptedFiles[0]
    console.log(file)
    if(!file) return;
    try{
      const compressedFile = await compressImage(file);
      const newFile = {
        name:compressedFile.name,
        type:compressedFile.type,
        file:compressedFile,
        preview: URL.createObjectURL(compressedFile)
      }
      setFiles2([newFile]),
      setUploadedCardFile(newFile)
    }catch(error){
      console.error("Error compressing file:", error);
    }
  }

  const handleSiteLayoutDrop = (acceptedFiles) => {
  const mappedFiles = acceptedFiles.map((file) => ({
    name: file.name,
    type: file.type,
    file: file,
    preview: URL.createObjectURL(file),
  }));
  setSiteLayoutFiles((prev) => [...prev, ...mappedFiles]);
};

  // Scope questions with titles
  const scopeQuestions = [
    { title: "Stability certification", key: "stabilityCertification" },
    { title: "SFU at Floor level", key: "sfuAtFloorLevel" },
    { title: "Ladders, Scaffolding, Platforms", key: "laddersScaffolding" },
    { title: "Civil works", key: "civilWorks" },
    { title: "Unloading", key: "unloading" },
    { title: "Provision of Cable upto DSL Level", key: "cableProvision" },
    { title: "Third Party inspection & Certification", key: "thirdPartyInspection" },
    { title: "Chemical Anchoring", key: "chemicalAnchoring" },
    { title: "Storage & Security", key: "storageSecurity" },
    { title: "Transportation", key: "transportation" },
    { title: "Foundation Works", key: "foundationWorks" },
    { title: "Supervision for Erection & Commissioning", key: "supervision" },
    { title: "Erection & Commissioning", key: "erectionCommissioning" },
    { title: "Mobile crane arrangement for Unloading", key: "mobileCraneUnloading" },
    { title: "Mobile crane arrangement for E&C", key: "mobileCraneEC" }
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
    setStepValues({});
    onClose();
    setVisible(false);
  };

const handleSubmit = async () => {
  setSubmitting(true);
  try {
    const currentStepValues = await form.validateFields(steps[currentStep].fields);
    const allValues = { ...stepValues, ...currentStepValues };

    // Prepare FormData (instead of JSON)
    const formData = new FormData();

    for (const key of Object.keys(allValues)) {
      const value = allValues[key];
      if (!value) continue;

      if (value instanceof dayjs) {
        formData.append(key, value.format("YYYY-MM-DD"));
      } else if (typeof value === "object" && value.fileList) {
        // Append each file
        value.fileList.forEach((file) => {
          formData.append(key, file.originFileObj);
        });
      } else {
        formData.append(key, value);
      }
    }

    // Add extra values
    scopeQuestions.forEach((q, i) => {
      if (allValues[`scope_${i}`] !== undefined) {
        formData.append(q.key, allValues[`scope_${i}`]);
      }
    });

    formData.append("createdBy", userName);
    formData.append("customerId", userAccount._id);

    if (uploadedCardFile) {
      formData.append("businessCard", uploadedCardFile.file);
    }

      siteLayoutFiles.forEach((f) => {
      formData.append("siteLayout", f.file);
    });

    const response = await fetch(
      "https://crmserver-lmg7w.ondigitalocean.app/submit-to-google-sheet",
      {
        method: "POST",
        body: formData, // no Content-Type, browser sets it
      }
    );

    const result = await response.json();
    if (response.ok && result.success) {
      message.success("Enquiry submitted successfully!");
      onClose();
      fetchEnquiryData();
    } else {
      throw new Error(result.message || "Failed to submit enquiry");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    message.error("Failed to submit enquiry. Please try again.");
  } finally {
    setSubmitting(false);
  }
};


  // Format date and time
  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };


  const nextStep = () => {
    form.validateFields(steps[currentStep].fields)
      .then((values) => {
        // Clean up undefined values before storing
        const cleanedValues = Object.keys(values).reduce((acc, key) => {
          if (values[key] !== undefined && values[key] !== null) {
            acc[key] = values[key];
          }
          return acc;
        }, {});
        
        // Store current step values before moving to next step
        setStepValues(prev => ({ ...prev, ...cleanedValues }));
        setCurrentStep(currentStep + 1);
      })
      .catch((error) => {
        console.error('Validation failed:', error);
      });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

    const quotationColumns = [
   
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDateTime(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    // {
    //   title: 'Amount',
    //   dataIndex: 'total',
    //   key: 'total',
    //   render: (amount) => formatPrice(amount),
    //   sorter: (a, b) => a.total - b.total,
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'Sent' ? 'success' : 'processing'} 
          text={status || 'Draft'} 
        />
      ),
    },
  ];

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
            label=""
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
           <label className="form-label">Upload client's business card</label>
                <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles, setFiles2)} maxFiles={1}>
                  {({ getRootProps, getInputProps }) => (
                    <section>
                      <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                        <input {...getInputProps()} />
                        {files2.length === 0 && (
                          <div style={{textAlign:"center", marginTop:"20px"}}>
                            {/* <span className="dz-message-text">Drag and drop file</span>
                            <span className="dz-message-or">or</span> */}
                            <Button color="primary">SELECT</Button>
                          </div>
                        )}
                        {files2.map((file) => (
                          <div
                            key={file.name}
                            className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
                          >
                            <div >
                              <img style={{width:"150px"}} src={file.preview} alt="preview" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </Dropzone>
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
              <Title level={5} style={{ marginBottom: 16 }}>Enquiry Weightage</Title>
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
      title: 'Equipment & Basic Requirements',
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
              <Form.Item
                name="finalizationDate"
                label="When it will be finalized?"
                rules={[{ required: true, message: 'Please select finalization date!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="otherCranes" label="Do they use any other make cranes? Kindly mention the make">
            <Input placeholder="List other crane makes used" />
          </Form.Item>

          <Title level={5} style={{ marginBottom: 16 }}>Basic Requirement</Title>
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
              rules={[{ required: isHazardousOther, message: 'Please specify the hazardous type!' }]}
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
                <img src={myImage} width="100%" alt="Logo" />
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="operationTime"
                label="Operation time per cycle in sec. (t1+t2+t3+t4)"
              >
                <InputNumber 
                  min={0} 
                  style={{ width: '100%' }} 
                  placeholder="Enter time in seconds" 
                />
              </Form.Item>
               <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <img src={myImage} width="100%" alt="Logo" />
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
      title: 'Technical Specifications & Scope',
      fields: ['accessories', 'accessoriesOther', 'valueAdded', 'valueAddedOther', 
              'dutyClass', 'capacity', 'quantity', 'tableSize', 
              'travelLength', 'railLevel', 'siteLayout', 'jobType', 'maxWeight', 
              'maxHeight', 'maxLoadingHeight', 'heightConstraints', 'remarks',
              ...scopeQuestions.map((_, index) => `scope_${index}`)],
      content: (
        <>
          <Title level={5} style={{ marginBottom: 16 }}>Transfer Trolley - Scope of Supply & Work and Technical Specification</Title>
          <Form.Item name="accessories" label="Accessories">
            <Radio.Group onChange={(e) => setIsAccessoriesOther(e.target.value === 'other')}>
              <Radio value="cableReeling">Cable Reeling Drum</Radio>
              <Radio value="rail">Rail</Radio>
              <Radio value="other">Other</Radio>
            </Radio.Group>
          </Form.Item>

          {isAccessoriesOther && (
            <Form.Item 
              name="accessoriesOther" 
              label="Please specify"
              rules={[{ required: isAccessoriesOther, message: 'Please specify accessory!' }]}
            >
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
            <Form.Item 
              name="valueAddedOther" 
              label="Please specify"
              rules={[{ required: isValueAddedOther, message: 'Please specify value added item!' }]}
            >
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
                label={question.title}
                style={{ marginBottom: 12 }}
                rules={[{ required: true, message: 'Please select scope for this item!' }]}
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

          <Form.Item 
            name="siteLayout" 
            label="Site Layout"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
           <Dropzone onDrop={handleSiteLayoutDrop} maxFiles={10}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()} className="dropzone upload-zone dz-clickable">
                  <input {...getInputProps()} />
                  {siteLayoutFiles.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <Button type="dashed">Upload Site Layout Files</Button>
                    </div>
                  )}
                  {siteLayoutFiles.length > 0 && (
                    <div className="dz-preview-container">
                      {siteLayoutFiles.map((file, index) => (
                        <div key={index} className="dz-preview dz-processing dz-file-preview dz-complete">
                          {file.type.startsWith("image/") ? (
                            <img style={{ width: "100px" }} src={file.preview} alt={file.name} />
                          ) : (
                            <div style={{ padding: "5px", border: "1px solid #ddd", borderRadius: "5px" }}>
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
          </Form.Item>

          <Title level={5} style={{ marginBottom: 16 }}>Additional Details</Title>
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
     <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{userAccount.businessName || "Loading ..."}</Title>
          <Button
            type="primary"
            icon={<BackwardFilled />}
            style={{ backgroundColor: "#ef7a1b", borderColor: "#ef7a1b", color: "white" }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      }
    >
     <Row gutter={24}>
            <Col xs={24} lg={10}>
            <h3>Create Enquiry Section</h3>
            <div style={{textAlign:"center", marginTop:"50px"}}>
              <Button onClick={()=> setVisible(true)}> Enquiry Form</Button> 
            </div>
           
            </Col>
              
            <Col xs={24} lg={14}>
                  <Card title="Enquiry">
              {enquiryData.length > 0 ? (
                <Table
                  dataSource={enquiryData}
                  columns={quotationColumns}
                  rowKey="_id"
                  pagination={{ pageSize: 5 }}
                  size="middle"
                  scroll={{ x: true }}
                  onRow={(record) => ({
                    onClick: () => {
                       setSelectedQuotation(record);
                       setFormVisible(true);
                    },
                  })}
                />
              ) : (
                <Empty
                  description="No Enquiry yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  {/* <Text type="secondary">
                    Create your first quotation by adding products and clicking "Create Quotation"
                  </Text> */}
                </Empty>
              )}
            </Card>
            </Col>
     </Row>
    
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
      maskClosable={false}  
  keyboard={false}  
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
            onClick={handleSubmit}
          >
            {submitting ? "Submitting ..." : "Submit"}
          </Button>
        )
      ].filter(Boolean)}
      width={900}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...quotation,
          targetDate: quotation?.targetDate ? dayjs(quotation.targetDate) : null,
          enquiryDate: quotation?.enquiryDate ? dayjs(quotation.enquiryDate) : null,
          finalizationDate: quotation?.finalizationDate ? dayjs(quotation.finalizationDate) : null
        }}
      >
        {steps[currentStep].content}
      </Form>
    </Modal>
      <EnquiryForm
                visible={formVisible}
                onClose={() => setFormVisible(false)}
                enquiry={selectedQuotation}
            />
          
    </Card>
  );
};

export default EnquiryInnerPage;