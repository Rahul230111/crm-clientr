// File: src/components/leads/BusinessAccountForm.jsx

import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Drawer, Row, Col, InputNumber, Select, Spin, Space, Typography } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import axios from "../../api/axios";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const API_URL = "/api/product";

const getAllProducts = async () => {
    try {
        const response = await axios.get(`${API_URL}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all products:', error);
        throw error;
    }
};

const BusinessAccountForm = ({ visible, onClose, onSave, initialValues, allUsers, loadingUsers, allZones, loadingZones }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState(allUsers); // Initial state set to allUsers

    const sourceType = Form.useWatch('sourceType', form);
    const selectedZone = Form.useWatch('zone', form);

    useEffect(() => {
        form.resetFields();
        if (initialValues) {
            form.setFieldsValue({
                ...initialValues,
                assignedTo: initialValues.assignedTo?._id || null,
                selectedProduct: initialValues.selectedProduct?._id || null,
                zone: initialValues.zone?._id || null,
                primaryContactPersonName: initialValues.primaryContactPersonName || null,
                typeOfLead: initialValues.typeOfLead || [],
                additionalContactPersons: initialValues.additionalContactPersons || [],
            });
        } else {
            form.setFieldsValue({
                sourceType: 'Direct',
                status: 'Active',
                assignedTo: null,
                selectedProduct: null,
                zone: null,
                primaryContactPersonName: null,
                typeOfLead: [],
                additionalContactPersons: [],
            });
        }
    }, [initialValues, form]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const productData = await getAllProducts();
                setProducts(productData);
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products.');
            } finally {
                setLoadingProducts(false);
            }
        };

        if (visible) {
            fetchProducts();
        }
    }, [visible]);

    // CORRECTED: New useEffect to fetch filtered users from the API
    useEffect(() => {
        const fetchUsersByZone = async () => {
            if (selectedZone) {
                try {
                    // Make API call to the new backend endpoint
                    const response = await axios.get(`/api/users/zone/${selectedZone}`);
                    setFilteredUsers(response.data);

                    // Check if the currently assigned user is still in the new filtered list
                    const currentAssignedTo = form.getFieldValue('assignedTo');
                    if (currentAssignedTo && !response.data.some(user => user._id === currentAssignedTo)) {
                        form.setFieldsValue({ assignedTo: null });
                    }
                } catch (error) {
                    console.error('Failed to fetch users by zone:', error);
                    toast.error('Failed to load users for the selected zone.');
                    setFilteredUsers([]);
                }
            } else {
                // If no zone is selected, show all users
                setFilteredUsers(allUsers);
            }
        };

        fetchUsersByZone();
    }, [selectedZone, allUsers, form]);


    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const timestamp = new Date().toLocaleString();
            const newNote = values.noteInput
                ? { text: values.noteInput, timestamp, author: 'User' }
                : null;

            const existingNotes = initialValues?.notes || [];
            const updatedNotes = newNote ? [...existingNotes, newNote] : existingNotes;

            const dataToSave = {
                ...values,
                notes: updatedNotes,
                assignedTo: values.assignedTo === undefined ? null : values.assignedTo,
                selectedProduct: values.selectedProduct === undefined ? null : values.selectedProduct,
                zone: values.zone === undefined ? null : values.zone,
                primaryContactPersonName: values.primaryContactPersonName,
                typeOfLead: values.typeOfLead,
                additionalContactPersons: values.additionalContactPersons,
            };

            delete dataToSave.noteInput;

            await onSave(dataToSave);

            toast.success(`Account ${initialValues ? 'updated' : 'created'} successfully!`);
            onClose();

        } catch (errorInfo) {
            console.error('Validation Failed or API Error:', errorInfo);

            if (errorInfo && errorInfo.response && errorInfo.response.status === 409 && errorInfo.response.data && errorInfo.response.data.message) {
                toast.error(errorInfo.response.data.message);
            } else if (errorInfo && errorInfo.errorFields) {
                toast.error('Please fill in all required fields correctly.');
            } else {
                toast.error('Failed to save account. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title={initialValues ? 'Edit Business Account' : 'Create New Business Account'}
            width={850}
            onClose={onClose}
            open={visible}
            bodyStyle={{ paddingBottom: 80 }}
            footer={
                <div style={{ textAlign: 'right' }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        type="primary"
                        loading={loading}
                        style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
                    >
                        {initialValues ? 'Update Account' : 'Create Account'}
                    </Button>
                </div>
            }
        >
            <Spin spinning={loadingUsers || loadingProducts || loadingZones}>
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="businessName" label="Business Name" rules={[{ required: true, message: 'Please enter business name' }]}>
                                <Input placeholder="Business Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="gstNumber" label="GST Number" rules={[{ required: false, message: 'Please enter GST Number' }]}>
                                <Input placeholder="GST Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="contactName" label="Customer Name" rules={[{ required: true, message: 'Please enter contact person name' }]}>
                                <Input placeholder="Contact Person Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }]}>
                                <Input placeholder="Email" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="phoneNumber" label="Phone Number">
                                <Input placeholder="Phone Number (Optional)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="mobileNumber" label="Mobile Number" rules={[{ required: true, message: 'Please enter mobile number' }]}>
                                <Input placeholder="Mobile Number" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="primaryContactPersonName"
                                label="Primary Contact Person (Optional)"
                            >
                                <Input placeholder="Primary Contact Person Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="typeOfLead"
                                label="Type of Leads"
                                rules={[{ required: false, message: 'Please select type of leads' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select type(s)"
                                    allowClear
                                >
                                    <Option value="Regular">Regular</Option>
                                    <Option value="Government">Government</Option>
                                    <Option value="Occupational">Occupational</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ marginBottom: 16 }}>
                        <Title level={5} style={{ marginBottom: 8 }}>Additional Contact Persons</Title>
                    </div>
                    <Form.List name="additionalContactPersons">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} style={{ border: '1px solid #d9d9d9', padding: '16px', marginBottom: '16px', borderRadius: '8px' }}>
                                        <Row gutter={16} align="baseline">
                                            <Col span={11}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Contact Name"
                                                    name={[name, 'name']}
                                                    rules={[{ required: true, message: 'Missing contact name' }]}
                                                >
                                                    <Input placeholder="Contact Name" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={11}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Email"
                                                    name={[name, 'email']}
                                                    rules={[{ type: 'email', message: 'Invalid email' }]}
                                                >
                                                    <Input placeholder="Email" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                                <MinusCircleOutlined onClick={() => remove(name)} style={{ fontSize: '20px', color: '#999' }} />
                                            </Col>
                                        </Row>
                                        <Row gutter={16} align="baseline">
                                            <Col span={11}>
                                                <Form.Item
                                                    {...restField}
                                                    label="Phone Number"
                                                    name={[name, 'phoneNumber']}
                                                >
                                                    <Input placeholder="Phone Number" />
                                                </Form.Item>
                                            </Col>
                                            <Col span={13}>
                                            </Col>
                                        </Row>
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Add Additional Contact Person
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="addressLine1" label="Address Line 1" rules={[{ required: true, message: 'Please enter address line 1' }]}>
                                <Input placeholder="Address Line 1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="addressLine2" label="Address Line 2">
                                <Input placeholder="Address Line 2 (Optional)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city' }]}>
                                <Input placeholder="City" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="pincode" label="Pincode" rules={[{ required: true, message: 'Please enter pincode' }]}>
                                <InputNumber style={{ width: '100%' }} placeholder="Pincode" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state' }]}>
                                <Input placeholder="State" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="country" label="Country" rules={[{ required: true, message: 'Please enter country' }]}>
                        <Input placeholder="Country" />
                    </Form.Item>
                    <Form.Item name="website" label="Industry Type" rules={[{  message: '' }]}>
                        <Input placeholder="Enter Industry Type" />
                    </Form.Item>

                    <Form.Item name="type" label="Lead Type" rules={[{ required: true, message: 'Please select a lead type' }]}>
                        <Select placeholder="Select Type">
                            <Option value="Hot">Hot</Option>
                            <Option value="Warm">Warm</Option>
                            <Option value="Cold">Cold</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Account Status"
                        rules={[{ required: true, message: 'Please select an account status' }]}
                    >
                        <Select placeholder="Select Status">
                            <Option value="Active">Lead</Option>
                            <Option value="TargetLeads">Target Leads</Option>
                            <Option value="Pipeline">Enquiry</Option>
                            <Option value="Quotations">Quotations</Option>
                            <Option value="Customer">Converted</Option>
                            <Option value="Closed">Closed</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="sourceType"
                        label="Source Type"
                        rules={[{ required: true, message: 'Please select a source type' }]}
                    >
                        <Select placeholder="How did you hear about us?">
                            <Option value="Direct">Direct</Option>
                            <Option value="socialmedia">Social Media</Option>
                            <Option value="online">Website</Option>
                            <Option value="client">Existing Client</Option>
                            <Option value="tradefair">Tradefair</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="zone" label="Zone">
                        <Select
                            placeholder="Select a zone (optional)"
                            allowClear
                            loading={loadingZones}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => {
                                const childrenText = String(option.children || '');
                                return childrenText.toLowerCase().includes(input.toLowerCase());
                            }}
                        >
                            {allZones && allZones.map(zone => (
                                <Option key={zone._id} value={zone._id}>
                                    {zone.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="assignedTo" label="Assigned To">
                        <Select
                            placeholder="Select a user to assign to (optional)"
                            allowClear
                            loading={loadingUsers}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => {
                                const childrenText = String(option.children || '');
                                return childrenText.toLowerCase().includes(input.toLowerCase());
                            }}
                        >
                            {/* Render based on filteredUsers state */}
                            {filteredUsers && filteredUsers.map(user => (
                                <Option key={user._id} value={user._id}>
                                    {user.name} ({user.role})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="selectedProduct"
                        label="Select Product"
                        rules={[{ required: false, message: 'Please select a product' }]}
                    >
                        <Select
                            placeholder="Select a product (optional)"
                            allowClear
                            loading={loadingProducts}
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) => {
                                const childrenText = String(option.children || '');
                                return childrenText.toLowerCase().includes(input.toLowerCase());
                            }}
                        >
                            {products.map(product => (
                                <Option key={product._id} value={product._id}>
                                    {product.productName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="noteInput" label="Add Note">
                        <TextArea rows={3} placeholder="Add a note (it will be timestamped)" />
                    </Form.Item>
                </Form>
            </Spin>
        </Drawer>
    );
};

export default BusinessAccountForm;