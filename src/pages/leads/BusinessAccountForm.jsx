// BusinessAccountForm.jsx
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Drawer, Row, Col, InputNumber, Select, Spin } from 'antd';
import { toast } from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;

const BusinessAccountForm = ({ visible, onClose, onSave, initialValues, allUsers, loadingUsers }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const sourceType = Form.useWatch('sourceType', form);

  useEffect(() => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        assignedTo: initialValues.assignedTo?._id || null
      });
    } else {
      form.setFieldsValue({
        sourceType: 'Direct',
        status: 'Active',
        assignedTo: null
      });
    }
  }, [initialValues, form]);

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        const timestamp = new Date().toLocaleString();
        const newNote = values.noteInput
          ? { text: values.noteInput, timestamp }
          : null;

        const existingNotes = initialValues?.notes || [];
        const updatedNotes = newNote ? [...existingNotes, newNote] : existingNotes;

        const dataToSave = {
          ...values,
          notes: updatedNotes,
          assignedTo: values.assignedTo === null ? null : values.assignedTo,
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
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>Cancel</Button>
          <Button onClick={handleSubmit} type="primary" loading={loading}
           style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}>
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
            <Form.Item name="gstNumber" label="GST Number" rules={[{ required: true, message: 'Please enter GST Number' }]}>
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
        <Form.Item name="addressLine1" label="Address Line 1" rules={[{ required: true, message: 'Please enter address line 1' }]}>
          <Input placeholder="Address Line 1" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="addressLine2" label="Address Line 2">
              <Input placeholder="Address Line 2 (Optional)" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="addressLine3" label="Address Line 3">
              <Input placeholder="Address Line 3 (Optional)" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="landmark" label="Landmark">
          <Input placeholder="Landmark (Optional)" />
        </Form.Item>
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
            <Option value="Active">Enquiry</Option>
            {/* <Option value="Inactive">Inactive</Option> */}
            <Option value="Pipeline">Proposed</Option>
                        <Option value="Customer">Customer</Option> {/* Added Customer option */}

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
            
            <Option value="online">Online</Option>
            
            <Option value="Client">Client</Option> {/* Added Client */}
            <Option value="Tradefair">Tradefair</Option> {/* Added Tradefair */}
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
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {allUsers && allUsers.map(user => (
              <Option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="noteInput" label="Add Note">
          <TextArea rows={3} placeholder="Add a note (it will be timestamped)" />
        </Form.Item>

        {initialValues?.notes?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <label><strong>Previous Notes</strong></label>
            <ul style={{ paddingLeft: 20 }}>
              {initialValues.notes.map((note, index) => (
                <li key={index}><strong>{note.timestamp}:</strong> {note.text}</li>
              ))}
            </ul>
          </div>
        )}
      </Form>
    </Drawer>
  );
};

export default BusinessAccountForm;