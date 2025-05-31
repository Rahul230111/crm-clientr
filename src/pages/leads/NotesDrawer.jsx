import React, { useState } from 'react';
import { Drawer, List, Typography, Form, Input, Button, Popconfirm, Space, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Title } = Typography;

const NotesDrawer = ({ visible, onClose, account, refreshAccounts }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedNote, setEditedNote] = useState('');

  const handleAddNote = async () => {
    try {
      const { note } = await form.validateFields();
      setLoading(true);
      
      const newNote = {
        text: note,
        timestamp: new Date().toLocaleString()
      };

      const updatedNotes = [...(account.notes || []), newNote];

      await axios.put(`/api/accounts/${account._id}`, {
        ...account,
        notes: updatedNotes
      });

      toast.success('Note added successfully!');
      form.resetFields();
      refreshAccounts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      setLoading(true);
      const updatedNotes = [...account.notes];
      updatedNotes.splice(index, 1);

      await axios.put(`/api/accounts/${account._id}`, {
        ...account,
        notes: updatedNotes
      });

      toast.success('Note deleted successfully!');
      refreshAccounts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete note. Please try again.');
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
      const updatedNotes = [...account.notes];
      updatedNotes[index] = { ...updatedNotes[index], text: editedNote };

      await axios.put(`/api/accounts/${account._id}`, {
        ...account,
        notes: updatedNotes
      });

      toast.success('Note updated successfully!');
      setEditingIndex(null);
      setEditedNote('');
      refreshAccounts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update note. Please try again.');
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
      title={<Title level={4} style={{ margin: 0 }}>Notes for {account.businessName}</Title>}
      open={visible}
      onClose={onClose}
      width={420}
      bodyStyle={{ padding: '24px' }}
    >
      {account.notes && account.notes.length > 0 ? (
        <List
          size="small"
          bordered
          dataSource={account.notes}
          renderItem={(note, index) => (
            <List.Item
              key={index}
              style={{
                padding: '12px 16px',
                borderRadius: 4,
                backgroundColor: '#fafafa',
                marginBottom: 8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{note.timestamp}</Text>
                <Space size="middle">
                  {editingIndex === index ? (
                    <>
                      <Button
                        icon={<CheckOutlined />}
                        type="link"
                        onClick={() => handleSaveEdit(index)}
                        loading={loading}
                      />
                      <Button
                        icon={<CloseOutlined />}
                        type="link"
                        onClick={handleCancelEdit}
                        disabled={loading}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        icon={<EditOutlined />}
                        type="link"
                        onClick={() => handleStartEdit(note, index)}
                        disabled={loading}
                      />
                      <Popconfirm
                        title="Delete this note?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDeleteNote(index)}
                        disabled={loading}
                      >
                        <Button icon={<DeleteOutlined />} type="link" danger disabled={loading} />
                      </Popconfirm>
                    </>
                  )}
                </Space>
              </div>
              {editingIndex === index ? (
                <TextArea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  rows={2}
                  style={{ marginTop: 4 }}
                  disabled={loading}
                />
              ) : (
                <div style={{ marginTop: 4 }}>{note.text}</div>
              )}
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">No notes to show</Text>
      )}

      <Divider />

      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="note"
          label="Add Note"
          rules={[{ required: true, message: 'Please enter a note' }]}
        >
          <TextArea rows={3} placeholder="Type your note here..." disabled={loading} />
        </Form.Item>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNote}
          loading={loading}
          block
        >
          Add Note
        </Button>
      </Form>
    </Drawer>
  );
};

export default NotesDrawer;