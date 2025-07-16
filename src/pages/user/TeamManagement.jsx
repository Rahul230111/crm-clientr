  import React, { useEffect, useState } from 'react';
  import {
    Table, Button, Drawer, Form, Input, Select, Space, Popconfirm, Collapse, List, Tag
  } from 'antd';
  import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    TeamOutlined,
    ApartmentOutlined, // For department icon
    SwapOutlined // For transfer icon
  } from '@ant-design/icons';
  import axios from '../../api/axios';
  import toast from 'react-hot-toast';

  const { Option } = Select;
  const { Panel } = Collapse;

  // This component now receives data and fetch functions as props from CombinedManagement
  const TeamManagement = ({ teams, departments, allUsers, fetchTeams, fetchDepartments, fetchUsers }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [form] = Form.useForm();

    // State for user transfer functionality
    const [transferDrawerOpen, setTransferDrawerOpen] = useState(false);
    const [userToTransfer, setUserToTransfer] = useState(null);
    const [transferForm] = Form.useForm();
    const [filteredTeamsByDepartment, setFilteredTeamsByDepartment] = useState([]);


    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isSuperadmin = currentUser?.role === 'Superadmin';
    const isAdmin = currentUser?.role === 'Admin';

    const unassignedTeamLeaders = allUsers.filter(user => user.role === 'Team Leader' && !user.team);
    const unassignedEmployees = allUsers.filter(user => user.role === 'Employee' && !user.team);

    const getAvailableTeamLeaders = () => {
      const currentLeader = editingTeam?.teamLeader;
      const leaders = [...unassignedTeamLeaders];

      if (currentLeader && !leaders.some(tl => tl._id === currentLeader._id)) {
        leaders.push(currentLeader);
      }
      return leaders;
    };

    const getAvailableEmployees = () => {
      const currentMembers = editingTeam?.members || [];
      const members = [...unassignedEmployees];

      currentMembers.forEach(cm => {
        if (!members.some(emp => emp._id === cm._id)) {
          members.push(cm);
        }
      });
      return members;
    };

    const openDrawerForCreate = () => {
      setEditingTeam(null);
      form.resetFields();
      setDrawerOpen(true);
    };

    const openDrawerForEdit = (team) => {
      setEditingTeam(team);
      form.setFieldsValue({
        name: team.name,
        department: team.department?._id,
        teamLeader: team.teamLeader?._id,
        members: team.members.map(member => member._id),
      });
      setDrawerOpen(true);
    };

    const handleDrawerSubmit = async () => {
      try {
        const values = await form.validateFields();

        if (editingTeam) {
          await axios.put(`/api/teams/${editingTeam._id}`, values);
          toast.success('Team updated successfully');
        } else {
          await axios.post('/api/teams', values);
          toast.success('Team created successfully');
        }

        setDrawerOpen(false);
        fetchTeams();
        fetchUsers();
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to submit team');
      }
    };

    const handleDelete = async (id) => {
      try {
        await axios.delete(`/api/teams/${id}`);
        toast.success('Team deleted');
        fetchTeams();
        fetchUsers();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Delete failed');
      }
    };

    const teamsByDepartment = departments.reduce((acc, dept) => {
      acc[dept._id] = {
        ...dept,
        teams: teams.filter(team => team.department?._id === dept._id)
      };
      return acc;
    }, {});

    // --- User Transfer Functionality ---

    const openTransferDrawer = (user) => {
      setUserToTransfer(user);
      transferForm.resetFields(); // Clear previous transfer form data
      setFilteredTeamsByDepartment([]); // Clear filtered teams initially
      setTransferDrawerOpen(true);
    };

    const handleDepartmentChangeForTransfer = (departmentId) => {
      transferForm.setFieldsValue({ newTeamId: undefined }); // Clear team selection if department changes
      if (departmentId) {
        const teamsInDept = teams.filter(team => team.department?._id === departmentId);
        setFilteredTeamsByDepartment(teamsInDept);
      } else {
        setFilteredTeamsByDepartment([]);
      }
    };

    const handleTransferSubmit = async () => {
      try {
        const values = await transferForm.validateFields();
        const { newDepartmentId, newTeamId } = values;

        if (!userToTransfer) {
          toast.error('No user selected for transfer.');
          return;
        }

        // If neither a new department nor a new team is selected, it's an invalid operation for transfer.
        // Or if a department is selected but no team, it might mean transferring to a department without a specific team.
        // The backend handles the logic for unassigning from old team/department based on these values.
        if (!newDepartmentId && !newTeamId) {
          toast.error('Please select a new department or team for transfer.');
          return;
        }

        await axios.put(`/api/users/${userToTransfer._id}/transfer`, {
          newDepartmentId: newDepartmentId || null, // Pass null if not selected
          newTeamId: newTeamId || null, // Pass null if not selected
        });

        toast.success(`${userToTransfer.name} transferred successfully.`);
        setTransferDrawerOpen(false);
        setUserToTransfer(null);
        fetchUsers(); // Re-fetch users to update their team/department assignments
        fetchTeams(); // Re-fetch teams to update their member lists
      } catch (err) {
        console.error("Transfer failed:", err);
        toast.error(err?.response?.data?.message || 'Failed to transfer user.');
      }
    };


    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Team Management</h2>
          {(isSuperadmin || isAdmin) && (
            <Button
              type="primary"
              style={{ backgroundColor: '#ef7a1b', borderColor: '#orange', color: 'white' }}
              icon={<PlusOutlined />}
              onClick={openDrawerForCreate}
            >
              Create Team
            </Button>
          )}
        </div>

        <Collapse accordion bordered={false} defaultActiveKey={Object.keys(teamsByDepartment)[0]}>
          {Object.values(teamsByDepartment).map(dept => (
            <Panel
              header={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ApartmentOutlined style={{ marginRight: 8, fontSize: '1.2em' }} />
                  <h3>{dept.name} ({dept.teams.length} Teams)</h3>
                </div>
              }
              key={dept._id}
              style={{ marginBottom: 10, borderRadius: 8, overflow: 'hidden', border: '1px solid #d9d9d9' }}
            >
              {dept.teams.length === 0 ? (
                <p>No teams in this department.</p>
              ) : (
                <Collapse accordion bordered={false} style={{ background: '#f0f2f5' }}>
                  {dept.teams.map(team => (
                    <Panel
                      header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TeamOutlined style={{ marginRight: 8 }} />
                            <strong>{team.name}</strong>
                            {team.teamLeader && (
                              <span style={{ marginLeft: 15, fontSize: '0.9em', color: '#555' }}>
                                (Leader: {team.teamLeader.name})
                              </span>
                            )}
                          </div>
                          {(isSuperadmin || isAdmin) && (
                            <Space onClick={e => e.stopPropagation()}>
                              <Button
                                icon={<EditOutlined />}
                                onClick={() => openDrawerForEdit(team)}
                                size="small"
                              />
                              <Popconfirm title="Delete this team?" onConfirm={() => handleDelete(team._id)}>
                                <Button danger icon={<DeleteOutlined />} size="small" />
                              </Popconfirm>
                            </Space>
                          )}
                        </div>
                      }
                      key={team._id}
                      style={{ marginBottom: 5, borderRadius: 6, border: '1px solid #e8e8e8' }}
                    >
                      <div style={{ paddingLeft: 20 }}>
                        <h4>Team Members:</h4>
                        {team.members.length === 0 ? (
                          <p>No members in this team.</p>
                        ) : (
                          <List
                            size="small"
                            dataSource={team.members}
                            renderItem={member => (
                              <List.Item
                                actions={[
                                  (isSuperadmin || isAdmin) && (
                                    <Button
                                      type="link"
                                      icon={<SwapOutlined />}
                                      onClick={() => openTransferDrawer(member)}
                                      size="small"
                                      title="Transfer User"
                                    >
                                      Transfer
                                    </Button>
                                  ),
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={<UserOutlined />}
                                  title={member.name}
                                  description={member.email}
                                />
                              </List.Item>
                            )}
                          />
                        )}
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Panel>
          ))}
        </Collapse>

        {/* Drawer component for creating or editing team details */}
        <Drawer
          title={editingTeam ? 'Edit Team' : 'Create Team'}
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
                {editingTeam ? 'Update' : 'Create'}
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Team Name" rules={[{ required: true, message: 'Team name is required' }]}>
              <Input />
            </Form.Item>

            <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please select a department' }]}>
              <Select placeholder="Select department">
                {departments.map(dept => (
                  <Option key={dept._id} value={dept._id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="teamLeader" label="Team Leader">
              <Select
                placeholder="Select team leader (optional)"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {getAvailableTeamLeaders().map(leader => (
                  <Option key={leader._id} value={leader._id}>{leader.name} ({leader.email})</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="members" label="Team Members">
              <Select
                mode="multiple"
                placeholder="Select team members (optional)"
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {getAvailableEmployees().map(employee => (
                  <Option key={employee._id} value={employee._id}>{employee.name} ({employee.email})</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Drawer>

        {/* Drawer for transferring a user */}
        <Drawer
          title={`Transfer ${userToTransfer ? userToTransfer.name : 'User'}`}
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
            <Form.Item name="newDepartmentId" label="New Department">
              <Select
                placeholder="Select new department (optional)"
                allowClear
                onChange={handleDepartmentChangeForTransfer}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {departments.map(dept => (
                  <Option key={dept._id} value={dept._id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="newTeamId" label="New Team">
              <Select
                placeholder="Select new team (optional)"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                // Disable if no department is selected, or if no teams are available for the selected department
                disabled={!transferForm.getFieldValue('newDepartmentId') || filteredTeamsByDepartment.length === 0}
              >
                {filteredTeamsByDepartment.map(team => (
                  <Option key={team._id} value={team._id}>{team.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Drawer>
      </>
    );
  };

  export default TeamManagement;