import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Drawer, Row, Col, InputNumber, Select, Spin } from 'antd';
import { toast } from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;

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
  const [form] = Form.useForm(); // Initialize Ant Design form instance
  const [loading, setLoading] = useState(false); // State for form submission loading indicator
  const sourceType = Form.useWatch('sourceType', form); // Watch for changes in sourceType field

  // Effect to reset and set form fields when initialValues or form instance changes
  useEffect(() => {
    form.resetFields(); // Clear all fields
    if (initialValues) {
      // If initialValues are provided (editing an existing account)
      form.setFieldsValue({
        ...initialValues,
        // Ensure assignedTo is just the ID for the Select component
        assignedTo: initialValues.assignedTo?._id || null
      });
    } else {
      // If no initialValues (creating a new account), set default values
      form.setFieldsValue({
        sourceType: 'Direct',
        status: 'Active', // Default status for new accounts
        assignedTo: null // Default to no one assigned
      });
    }
  }, [initialValues, form]); // Re-run effect if initialValues or form instance changes

  /**
   * Handles the form submission.
   * Validates fields, processes data, calls onSave, and shows toast notifications.
   */
  const handleSubmit = () => {
    form.validateFields() // Validate all form fields
      .then(values => {
        setLoading(true); // Start loading indicator
        const timestamp = new Date().toLocaleString(); // Get current timestamp for notes
        const newNote = values.noteInput
          ? { text: values.noteInput, timestamp } // Create new note object if noteInput exists
          : null;

        const existingNotes = initialValues?.notes || []; // Get existing notes or an empty array
        const updatedNotes = newNote ? [...existingNotes, newNote] : existingNotes; // Add new note to existing ones

        // Prepare data to be saved
        const dataToSave = {
          ...values,
          notes: updatedNotes,
          // Ensure assignedTo is null if not selected, otherwise use the selected ID
          assignedTo: values.assignedTo === null ? null : values.assignedTo,
        };

        delete dataToSave.noteInput; // Remove temporary noteInput field from data to save

        onSave(dataToSave); // Call the onSave callback with the prepared data
        toast.success(`Account ${initialValues ? 'updated' : 'created'} successfully!`); // Show success toast
        setLoading(false); // Stop loading indicator
        onClose(); // Close the drawer
      })
      .catch(info => {
        console.log('Validate Failed:', info); // Log validation errors
        toast.error('Please fill in all required fields correctly.'); // Show error toast
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
        form={form} // Bind the form instance to the Ant Design Form
        layout="vertical" // Use vertical layout for form items
      >
        <Row gutter={16}> {/* Row for Business Name and GST Number */}
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
        <Row gutter={16}> {/* Row for Customer Name and Email */}
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
        <Row gutter={16}> {/* Row for Phone Number and Mobile Number */}
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

        <Row gutter={16}> {/* Row for Address Line 1 and Address Line 2 */}
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

        <Row gutter={16}> {/* Row for City, Pincode, and State */}
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
            <Option value="Enquiry">Enquiry</Option> {/* Changed 'Active' to 'Enquiry' for clarity */}
            <Option value="Proposed">Proposed</Option>
            <Option value="Customer">Customer</Option>
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
            <Option value="Client">Client</Option>
            <Option value="Tradefair">Tradefair</Option>
            <Option value="Other">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Assigned To"
        >
          <Select
            placeholder="Select a user to assign to (optional)"
            allowClear // Allows clearing the selection
            loading={loadingUsers} // Show loading spinner if users are being fetched
            showSearch // Enable search functionality
            optionFilterProp="children" // Filter options based on their children (text content)
            filterOption={(input, option) => {
              // Custom filter function for search
              const childrenText = String(option.children || ''); // Ensure children is a string
              return childrenText.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {allUsers && allUsers.map(user => (
              <Option key={user._id} value={user._id}>
                {user.name} ({user.role}) {/* Display user name and role */}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="noteInput" label="Add Note">
          <TextArea rows={3} placeholder="Add a note (it will be timestamped)" />
        </Form.Item>

        {/* Display previous notes if available */}
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
