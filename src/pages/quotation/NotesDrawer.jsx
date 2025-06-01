import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  Typography,
  Form,
  Input,
  Button,
  Popconfirm,
  Space,
  Spin
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined
} from '@ant-design/icons';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const { TextArea } = Input;
const { Text } = Typography;

const NotesDrawer = ({ visible, onClose, quotation, refreshQuotations }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedNote, setEditedNote] = useState('');
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    setNotes(quotation?.notes || []);
  }, [quotation]);

  const handleAddNote = async (values) => {
    try {
      setLoading(true);
      const toastId = toast.loading('Adding note...');
      const newNote = {
        text: values.note,
        timestamp: new Date().toLocaleString()
      };
      const updatedNotes = [...notes, newNote];
      await axios.put(`/api/quotations/${quotation._id}`, {
        notes: updatedNotes
      });
      setNotes(updatedNotes);
      toast.success('Note added successfully', { id: toastId });
      form.resetFields();
      refreshQuotations();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      setLoading(true);
      const toastId = toast.loading('Deleting note...');
      const updatedNotes = [...notes];
      updatedNotes.splice(index, 1);
      await axios.put(`/api/quotations/${quotation._id}`, {
        notes: updatedNotes
      });
      setNotes(updatedNotes);
      toast.success('Note deleted successfully', { id: toastId });
      refreshQuotations();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (note, index) => {
    setEditingIndex(index);
    setEditedNote(note.text);
  };

  const handleSaveEdit = async (index) => {
    try {
      setLoading(true);
      const toastId = toast.loading('Updating note...');
      const updatedNotes = [...notes];
      updatedNotes[index] = {
        ...updatedNotes[index],
        text: editedNote,
        timestamp: new Date().toLocaleString()
      };
      await axios.put(`/api/quotations/${quotation._id}`, {
        notes: updatedNotes
      });
      setNotes(updatedNotes);
      toast.success('Note updated successfully', { id: toastId });
      setEditingIndex(null);
      refreshQuotations();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedNote('');
  };

  return (
    <Drawer
      title={`Notes for Quotation #${quotation?.quotationNumber}`}
      open={visible}
      onClose={onClose}
      width={400}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div style={{ maxHeight: '496px', overflowY: 'auto' }}>
          <List
            size="small"
            dataSource={notes}
            locale={{ emptyText: 'No notes added yet' }}
            renderItem={(note, index) => (
              <List.Item
                key={index}
                style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                actions={[
                  editingIndex === index ? (
                    <Space>
                      <Button
                        size="small"
                        icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                        onClick={() => handleSaveEdit(index)}
                        type="text"
                      />
                      <Button
                        size="small"
                        icon={<CloseOutlined style={{ color: '#ff4d4f' }} />}
                        onClick={handleCancelEdit}
                        type="text"
                      />
                    </Space>
                  ) : (
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => handleStartEdit(note, index)}
                        type="text"
                      />
                      <Popconfirm
                        title="Are you sure to delete this note?"
                        onConfirm={() => handleDeleteNote(index)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          size="small"
                          icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />}
                          type="text"
                        />
                      </Popconfirm>
                    </Space>
                  )
                ]}
              >
                <List.Item.Meta
                  description={
                    <>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {note.timestamp}
                      </Text>
                      {editingIndex === index ? (
                        <TextArea
                          value={editedNote}
                          onChange={(e) => setEditedNote(e.target.value)}
                          rows={2}
                          style={{ marginTop: 8 }}
                          autoFocus
                        />
                      ) : (
                        <div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          onFinish={handleAddNote}
        >
          <Form.Item
            name="note"
            rules={[{ required: true, message: 'Please enter a note' }]}
          >
            <TextArea rows={3} placeholder="Type your note here" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            icon={<SendOutlined />}
          >
            Add Note
          </Button>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default NotesDrawer;
