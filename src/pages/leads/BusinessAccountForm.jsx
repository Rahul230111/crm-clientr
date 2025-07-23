import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Drawer, Row, Col, InputNumber, Select, Spin } from 'antd';
import { toast } from 'react-hot-toast';
import axios from "../../api/axios"; // Assuming your axios instance is here

const { TextArea } = Input;
const { Option } = Select;

// Placeholder for your product API service
// You would typically have a dedicated service file (e.g., src/api/productService.js)
// For this example, we'll define a simple function here.
const API_URL = "/api/product"; // Adjust this to your backend's base URL

const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}`); // Matches productRoutes.js
    return response.data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};


/**
 * BusinessAccountForm Component
 *
 * This component provides a form for creating and editing business accounts.
 * It uses Ant Design components for UI and includes validation, state management,
 * and integration with a toast notification system.
 *
 * Props:
 * @param {boolean} visible - Controls the visibility of the drawer.
 * @param {function} onClose - Callback function to close the drawer.
 * @param {function} onSave - Callback function to save the form data.
 * @param {object} initialValues - Initial data to populate the form (for editing).
 * @param {Array<object>} allUsers - List of all users to populate the "Assigned To" select field.
 * @param {boolean} loadingUsers - Indicates if the users data is currently being loaded.
 */
const BusinessAccountForm = ({ visible, onClose, onSave, initialValues, allUsers, loadingUsers }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]); // State for storing product list
  const [loadingProducts, setLoadingProducts] = useState(false); // State for product loading
  const sourceType = Form.useWatch('sourceType', form);

  useEffect(() => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        assignedTo: initialValues.assignedTo?._id || null,
        // Set the selected product value for editing
        selectedProduct: initialValues.selectedProduct?._id || null,
      });
    } else {
      form.setFieldsValue({
        sourceType: 'Direct',
        status: 'Active', // Changed from 'Lead' to 'Active' based on BusinessAccount.js enum
        assignedTo: null,
        selectedProduct: null, // Default to no product selected
      });
    }
  }, [initialValues, form]);

  // Effect to fetch products when the component mounts or drawer becomes visible
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const productData = await getAllProducts(); // Fetch products from your API
        setProducts(productData); // Assuming the API returns an array of products
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


  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        const timestamp = new Date().toLocaleString();
        const newNote = values.noteInput
          ? { text: values.noteInput, timestamp, author: 'User' } // Assuming a default author or get from context
          : null;

        const existingNotes = initialValues?.notes || [];
        const updatedNotes = newNote ? [...existingNotes, newNote] : existingNotes;

        const dataToSave = {
          ...values,
          notes: updatedNotes,
          assignedTo: values.assignedTo === undefined ? null : values.assignedTo, // Handle undefined for initial render
          selectedProduct: values.selectedProduct === undefined ? null : values.selectedProduct, // Send selected product ID
        };

        delete dataToSave.noteInput;

        onSave(dataToSave);
        toast.success(`Account ${initialValues ? 'updated' : 'created'} successfully!`);
        setLoading(false);
        onClose();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        toast.error('Please fill in all required fields correctly.');
      });
  };

  return (
    <Drawer
      title={initialValues ? 'Edit Business Account' : 'Create New Business Account'}
      width={720}
      onClose={onClose}
      open={visible} // Changed 'visible' to 'open' for Ant Design Drawer v5
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
        <Form.Item name="website" label="Website URL" rules={[{ type: 'url', message: 'Invalid URL format' }]}>
          <Input placeholder="https://www.example.com" />
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
            {/* Updated status options based on BusinessAccount.js enum */}
            <Option value="Active">Lead</Option>
         
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
            {/* Updated sourceType options based on BusinessAccount.js enum */}
            <Option value="Direct">Direct</Option>
            <Option value="socialmedia">Social Media</Option>
            <Option value="online">Online</Option>
            <Option value="client">Client</Option>
            <Option value="tradefair">Tradefair</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Assigned To"
        >
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
            {allUsers && allUsers.map(user => (
              <Option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* NEW PRODUCT SELECTION FIELD */}
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

        {/* Display previous notes if available */}
        {/* {initialValues?.notes?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <label><strong>Previous Notes</strong></label>
            <ul style={{ paddingLeft: 20 }}>
              {initialValues.notes.map((note, index) => (
                <li key={index}><strong>{note.timestamp}:</strong> {note.text}</li>
              ))}
            </ul>
          </div>
        )} */}
      </Form>
    </Drawer>
  );
};

export default BusinessAccountForm;