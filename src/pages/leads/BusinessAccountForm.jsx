import React from 'react';
import { Form, Input, Button, Drawer, Row, Col, InputNumber, Select } from 'antd';
import { toast } from 'react-hot-toast';

const { TextArea } = Input;
const { Option } = Select;

const BusinessAccountForm = ({ visible, onClose, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue(initialValues);
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
          notes: updatedNotes
        };

        delete dataToSave.noteInput;

        onSave(dataToSave);
        toast.success(`Account ${initialValues ? 'updated' : 'created'} successfully!`);
        setLoading(false);
        onClose();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
        toast.error('Please fill all required fields correctly');
      });
  };

  return (
    <Drawer
      title={initialValues ? "Edit Business Account" : "Add New Business Account"}
      width={720}
      onClose={onClose}
      visible={visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} type="primary" loading={loading}>
            Submit
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="businessName"
              label="Business Name"
              rules={[{ required: true, message: 'Please enter business name' }]}
            >
              <Input placeholder="Business Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gstNumber"
              label="GST Number"
              rules={[
                { required: true, message: 'Please enter GST number' },
                {
                  pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                  message: 'Invalid GST format'
                }
              ]}
            >
              <Input placeholder="22AABCU9603R12X" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactName"
              label="Contact Name"
              rules={[{ required: true, message: 'Please enter contact name' }]}
            >
              <Input placeholder="Contact Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email Id"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Invalid email format' }
              ]}
            >
              <Input placeholder="Email Id" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="phoneNumber" label="Phone Number">
              <Input placeholder="0422 264925" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="mobileNumber"
              label="Mobile Number"
              rules={[{ required: true, message: 'Please enter mobile number' }]}
            >
              <Input placeholder="(123) 456-7890" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="addressLine1"
          label="Address Line 1"
          rules={[{ required: true, message: 'Please enter address' }]}
        >
          <Input placeholder="Address Line 1" />
        </Form.Item>

        <Form.Item name="addressLine2" label="Address Line 2">
          <Input placeholder="Address Line 2" />
        </Form.Item>

        <Form.Item name="addressLine3" label="Address Line 3">
          <Input placeholder="Address Line 3" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="landmark" label="Land Mark">
              <Input placeholder="Land Mark" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'Please enter city' }]}
            >
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[{ required: true, message: 'Please enter pincode' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="Pincode" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="state"
              label="State"
              rules={[{ required: true, message: 'Please enter state' }]}
            >
              <Input placeholder="State" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: 'Please enter country' }]}
            >
              <Input placeholder="Country" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="website"
          label="Website URL"
          rules={[{ type: 'url', message: 'Invalid URL format' }]}
        >
          <Input placeholder="https://www.example.com" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Lead Type"
          rules={[{ required: true, message: 'Please select a lead type' }]}
        >
          <Select placeholder="Select Type">
            <Option value="Hot">Hot</Option>
            <Option value="Warm">Warm</Option>
            <Option value="Cold">Cold</Option>
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