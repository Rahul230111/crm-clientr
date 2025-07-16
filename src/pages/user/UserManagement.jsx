import React, { useEffect, useState } from 'react';
import {
  Table, Button, Drawer, Form, Input, Select, Space, Popconfirm
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SwapOutlined // New icon for transfer
} from '@ant-design/icons';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]); // State for departments
  const [teams, setTeams] = useState([]); // State for teams
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // New states for transfer functionality
  const [transferDrawerOpen, setTransferDrawerOpen] = useState(false);
  const [transferringUser, setTransferringUser] = useState(null);
  const [transferForm] = Form.useForm(); // Separate form for transfer drawer

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isSuperadmin = currentUser?.role === 'Superadmin';
  const isAdmin = currentUser?.role === 'Admin';
  const isTeamLeader = currentUser?.role === 'Team Leader';

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users'); // Fetch all users
      let filteredUsers = res.data;

      // If current user is a Team Leader, filter users to show only their team members + self
      if (isTeamLeader && currentUser.team) {
        filteredUsers = res.data.filter(user =>
          user.team?._id === currentUser.team || user._id === currentUser._id
        );
      }
      setUsers(filteredUsers);
    } catch {
      toast.error('Failed to load users');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data);
    } catch {
      toast.error('Failed to load departments');
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get('/api/teams');
      setTeams(res.data);
    } catch {
      toast.error('Failed to load teams');
    }
  };

  useEffect(() => {
    fetchUsers();
    // Fetch departments and teams only if the current user is Superadmin or Admin
    if (isSuperadmin || isAdmin) {
      fetchDepartments();
      fetchTeams();
    }
  }, [isSuperadmin, isAdmin, isTeamLeader, currentUser?.team]); // Re-fetch if roles or team changes

  const openDrawerForCreate = () => {
    setEditingUser(null);
    form.resetFields();
    // Pre-fill default values for new user creation
    form.setFieldsValue({
      role: 'Employee', // Default role
      status: 'Active', // Default status
    });
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
      // Ensure department and team are set correctly, handling populated objects
      department: user.department?._id,
      team: user.team?._id,
    });
    setDrawerOpen(true);
  };

  const handleDrawerSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Omit password if left empty when editing
      if (editingUser && !values.password) {
        delete values.password;
      }

      // If a Team Leader is editing, ensure they cannot change role, department, or team
      if (isTeamLeader && editingUser) {
        if (values.role !== editingUser.role) {
          toast.error('Team Leaders cannot change user roles.');
          return;
        }
        if (values.department !== editingUser.department?._id) {
          toast.error('Team Leaders cannot change user departments.');
          return;
        }
        if (values.team !== editingUser.team?._id) {
          toast.error('Team Leaders cannot change user teams.');
          return;
        }
      }

      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, values);
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/users', values);
        toast.success('User created successfully');
      }

      setDrawerOpen(false);
      fetchUsers();
      // Re-fetch teams and departments if current user is admin/superadmin to update lists
      if (isSuperadmin || isAdmin) {
        fetchTeams();
        fetchDepartments();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to submit user');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Prevent Superadmin/Admin from deleting themselves
      if ((isSuperadmin || isAdmin) && currentUser._id === id) {
        toast.error('You cannot delete your own account.');
        return;
      }
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
      // Re-fetch teams and departments if current user is admin/superadmin to update lists
      if (isSuperadmin || isAdmin) {
        fetchTeams();
        fetchDepartments();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  // --- New Transfer Functionality ---
  const openTransferDrawer = (user) => {
    setTransferringUser(user);
    transferForm.setFieldsValue({
      currentDepartment: user.department?.name,
      currentTeam: user.team?.name,
      newDepartment: user.department?._id, // Pre-select current department
      newTeam: user.team?._id, // Pre-select current team
    });
    setTransferDrawerOpen(true);
  };

  const handleTransferSubmit = async () => {
    try {
      const values = await transferForm.validateFields();
      const { newDepartment, newTeam } = values;

      // API call to transfer user - this endpoint needs to be implemented in the backend (e.g., in userController.js)
      // The backend logic should handle removing the user from the old team/department
      // and adding them to the new team/department, updating their user document.
      await axios.put(`/api/users/transfer/${transferringUser._id}`, {
        newDepartmentId: newDepartment,
        newTeamId: newTeam,
      });

      toast.success(`${transferringUser.name} transferred successfully`);
      setTransferDrawerOpen(false);
      fetchUsers(); // Refresh user list to reflect changes
      fetchTeams(); // Refresh teams to ensure member lists are updated
      fetchDepartments(); // Refresh departments if department changes affect team counts etc.
    } catch (err) {
      console.error("Transfer error:", err);
      toast.error(err?.response?.data?.message || 'Failed to transfer user');
    }
  };
  // --- End New Transfer Functionality ---


  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Mobile', dataIndex: 'mobile', key: 'mobile' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    // {
    //   title: 'Department',
    //   dataIndex: 'department',
    //   key: 'department',
    //   render: (department) => department?.name || 'N/A' // Display department name
    // },21
    // {
    //   title: 'Team',
    //   dataIndex: 'team',
    //   key: 'team',
    //   render: (team) => team?.name || 'N/A' // Display team name
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* Edit button: Superadmin/Admin can edit any user. Team Leader can edit their team members (excluding self if not allowed by business logic) */}
          {(isSuperadmin || isAdmin || (isTeamLeader && currentUser.team === record.team?._id)) && (
            <Button icon={<EditOutlined />} onClick={() => openDrawerForEdit(record)} />
          )}
          {/* Transfer button: Only Superadmin/Admin can transfer users */}
          {(isSuperadmin || isAdmin) && (
             <Button
               icon={<SwapOutlined />}
               onClick={() => openTransferDrawer(record)}
               title="Transfer User to another Team/Department"
             />
          )}
          {/* Delete button: Only Superadmin/Admin can delete users, and not themselves */}
          {(isSuperadmin || isAdmin) && (
            <Popconfirm
              title="Delete this user?"
              onConfirm={() => handleDelete(record._id)}
              disabled={currentUser._id === record._id} // Prevent deleting self
            >
              <Button danger icon={<DeleteOutlined />} disabled={currentUser._id === record._id} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>User Management</h2>
        {(isSuperadmin || isAdmin) && ( // Only Superadmin/Admin can create users
          <Button
            type="primary"
            style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
            icon={<UserAddOutlined />}
            onClick={openDrawerForCreate}
          >
            Create User
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        bordered
      />

      <Drawer
        title={editingUser ? 'Edit User' : 'Create User'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        destroyOnClose
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
              onClick={handleDrawerSubmit}
            >
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input disabled={isTeamLeader && editingUser && currentUser._id !== editingUser._id} />
          </Form.Item>

          <Form.Item name="email" label="Email" rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Invalid email format' }
          ]}>
            <Input disabled={isTeamLeader && editingUser && currentUser._id !== editingUser._id} />
          </Form.Item>

          <Form.Item name="mobile" label="Mobile">
            <Input disabled={isTeamLeader && editingUser && currentUser._id !== editingUser._id} />
          </Form.Item>

          {/* Password only for creation or if Superadmin/Admin wants to reset */}
          {((!editingUser && (isSuperadmin || isAdmin)) || (editingUser && (isSuperadmin || isAdmin))) && (
            <Form.Item
              name="password"
              label="Password"
              rules={!editingUser ? [{ required: true, message: 'Password is required' }] : []}
            >
              <Input.Password placeholder={editingUser ? 'Leave blank to keep current password' : ''} />
            </Form.Item>
          )}

          <Form.Item name="role" label="Role" rules={[{ required: true, message: 'Please select a role' }]}>
            <Select
              placeholder="Select role"
              // Disable role change for Team Leaders unless they are editing their own profile
              disabled={isTeamLeader && editingUser && currentUser._id !== editingUser._id}
            >
              <Option value="Superadmin" disabled={!isSuperadmin}>Superadmin</Option>
              <Option value="Admin" disabled={!isSuperadmin}>Admin</Option> {/* Admin cannot promote to Superadmin */}
              <Option value="Team Leader">Team Leader</Option>
              <Option value="Employee">Employee</Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Please select status' }]}>
            <Select
              placeholder="Select status"
              disabled={isTeamLeader && editingUser && currentUser._id !== editingUser._id}
            >
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {/* Department Selection - Only visible and editable by Superadmin/Admin */}
          {(isSuperadmin || isAdmin) && (
            <Form.Item name="department" label="Department">
              <Select placeholder="Select department" allowClear>
                {departments.map(dept => (
                  <Option key={dept._id} value={dept._id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Team Selection - Only visible and editable by Superadmin/Admin */}
          {(isSuperadmin || isAdmin) && (
            <Form.Item name="team" label="Team">
              <Select placeholder="Select team" allowClear>
                {teams.map(team => (
                  <Option key={team._id} value={team._id}>{team.name} ({team.department?.name || 'N/A'})</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Drawer>

      {/* New Drawer for User Transfer */}
      <Drawer
        title={`Transfer User: ${transferringUser?.name}`}
        open={transferDrawerOpen}
        onClose={() => setTransferDrawerOpen(false)}
        width={420}
        destroyOnClose
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setTransferDrawerOpen(false)} style={{ marginRight: 8 }}>Cancel</Button>
            <Button
              type="primary"
              style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
              onClick={handleTransferSubmit}
            >
              Transfer
            </Button>
          </div>
        }
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item label="Current Department">
            <Input value={transferringUser?.department?.name || 'N/A'} disabled />
          </Form.Item>
          <Form.Item label="Current Team">
            <Input value={transferringUser?.team?.name || 'N/A'} disabled />
          </Form.Item>

          <Form.Item name="newDepartment" label="New Department (Optional)">
            <Select placeholder="Select new department" allowClear>
              {departments.map(dept => (
                <Option key={dept._id} value={dept._id}>{dept.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="newTeam" label="New Team (Optional)">
            <Select placeholder="Select new team" allowClear>
              {teams.map(team => (
                <Option key={team._id} value={team._id}>{team.name} ({team.department?.name || 'N/A'})</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default UserManagement;