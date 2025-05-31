import React, { useEffect, useState } from 'react';
import {
  Table, Button, Drawer, Form, Input, Select, Space, Popconfirm
} from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isSuperadmin = currentUser?.role === 'Superadmin';

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDrawerForCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, values);
        toast.success('User updated successfully');
      } else {
        await axios.post(`/api/users`, values);
        toast.success('User created successfully');
      }

      setDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to submit user');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Mobile', dataIndex: 'mobile' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openDrawerForEdit(record)} />
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record._id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>User Management</h2>
        <Button type="primary" icon={<UserAddOutlined />} onClick={openDrawerForCreate}>
          Create User
        </Button>
      </div>

      <Table columns={columns} dataSource={users} rowKey="_id" bordered />

      <Drawer
        title={editingUser ? 'Edit User' : 'Create User'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button type="primary" onClick={handleDrawerSubmit}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile">
            <Input />
          </Form.Item>

          {/* Password only when creating OR if Superadmin */}
          {(!editingUser || isSuperadmin) && (
            <Form.Item name="password" label="Password" rules={[{ required: !editingUser }]}>
              <Input.Password placeholder={editingUser ? "Leave blank to keep existing" : ""} />
            </Form.Item>
          )}

          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Superadmin">Superadmin</Select.Option>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="Employee">Employee</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default UserManagement;
