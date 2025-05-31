// NotesDrawer.jsx
import React, { useState, useEffect } from 'react';
import {
  Drawer, List, Typography, Form, Input, Button, Popconfirm,
  Space, Spin, Tag, message
} from 'antd';
import {
  EditOutlined, DeleteOutlined, CheckOutlined,
  CloseOutlined, SendOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const NotesDrawer = ({ visible, onClose, invoice, refreshInvoices }) => {
  const [form] = Form.useForm();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedNote, setEditedNote] = useState('');

  useEffect(() => {
    setNotes(invoice?.notes || []);
  }, [invoice]);

  const handleAddNote = async ({ note }) => {
    const newNote = {
      text: note,
      timestamp: new Date().toISOString(),
      author: 'User'
    };
    const updatedNotes = [...notes, newNote];

    try {
      setLoading(true);
      await fetch(`/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoice, notes: updatedNotes })
      });
      message.success('Note added');
      setNotes(updatedNotes);
      form.resetFields();
      refreshInvoices();
    } catch {
      message.error('Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    const updated = notes.filter((_, i) => i !== index);
    try {
      setLoading(true);
      await fetch(`/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoice, notes: updated })
      });
      message.success('Note deleted');
      setNotes(updated);
      refreshInvoices();
    } catch {
      message.error('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (index) => {
    const updated = [...notes];
    updated[index] = {
      ...updated[index],
      text: editedNote,
      timestamp: new Date().toISOString(),
      updated: true
    };
    try {
      setLoading(true);
      await fetch(`/api/invoices/${invoice._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...invoice, notes: updated })
      });
      message.success('Note updated');
      setNotes(updated);
      setEditingIndex(null);
      refreshInvoices();
    } catch {
      message.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={<><div>Notes for Invoice <Tag color="blue">#{invoice?.invoiceNumber}</Tag></div></>}
      open={visible}
      onClose={onClose}
      width={450}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <List
          dataSource={notes}
          renderItem={(note, index) => (
            <List.Item
              actions={[
                editingIndex === index ? (
                  <Space>
                    <Button icon={<CheckOutlined />} onClick={() => handleSaveEdit(index)} />
                    <Button icon={<CloseOutlined />} onClick={() => setEditingIndex(null)} />
                  </Space>
                ) : (
                  <Space>
                    <Button icon={<EditOutlined />} onClick={() => {
                      setEditedNote(note.text);
                      setEditingIndex(index);
                    }} />
                    <Popconfirm title="Delete note?" onConfirm={() => handleDelete(index)}>
                      <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                  </Space>
                )
              ]}
            >
              <List.Item.Meta
                description={
                  <>
                    <Text type="secondary">{note.author} • {new Date(note.timestamp).toLocaleString()}</Text>
                    {editingIndex === index ? (
                      <TextArea
                        rows={2}
                        value={editedNote}
                        onChange={e => setEditedNote(e.target.value)}
                      />
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{note.text}</div>
                    )}
                  </>
                }
              />
            </List.Item>
          )}
        />
        <Form form={form} layout="vertical" onFinish={handleAddNote} style={{ marginTop: 16 }}>
          <Form.Item name="note" rules={[{ required: true, message: 'Enter note' }]}>
            <TextArea rows={3} placeholder="Type your note here..." />
          </Form.Item>
          <Button htmlType="submit" type="primary" icon={<SendOutlined />} block>Add Note</Button>
        </Form>
      </Spin>
    </Drawer>
  );
};

export default NotesDrawer;
