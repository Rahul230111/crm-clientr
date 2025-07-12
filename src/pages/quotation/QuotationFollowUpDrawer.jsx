import React, { useState, useEffect } from 'react';
import {
  Drawer, Button, Input, DatePicker, List, Typography, Divider, Modal, Spin
} from 'antd';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { UserOutlined, ClockCircleOutlined, MessageOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * QuotationFollowUpDrawer component for managing follow-ups related to a quotation.
 * It allows viewing, adding, editing, and deleting follow-up notes.
 *
 * @param {object} props - The component props.
 * @param {boolean} props.visible - Controls the visibility of the drawer.
 * @param {function} props.onClose - Callback function to close the drawer.
 * @param {object} props.quotation - The quotation object to which follow-ups are associated.
 * @param {function} props.refreshQuotations - Callback to refresh the quotation list after changes.
 */
const QuotationFollowUpDrawer = ({ visible, onClose, quotation, refreshQuotations }) => {
  const [comment, setComment] = useState('');
  const [followupDate, setFollowupDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Function to get the currently logged-in user's email
  const getCurrentUserEmail = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?.email || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  // Effect to fetch follow-ups and users when the drawer becomes visible or quotation changes
  useEffect(() => {
    if (visible && quotation?._id) {
      fetchFollowUps();
      fetchAllUsers();
    } else {
      setFollowUps([]);
      setEditingFollowUp(null);
      setComment('');
      setFollowupDate(null);
      setAllUsers([]);
    }
  }, [visible, quotation]);

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get('/api/users');
      if (Array.isArray(res.data)) {
        setAllUsers(res.data);
      } else {
        console.warn("API for users did not return an array:", res.data);
        setAllUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Could not load user details for display.");
      setAllUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const getUserDisplayName = (userIdOrObject) => {
    if (!userIdOrObject) return 'Unknown User';

    if (typeof userIdOrObject === 'object' && userIdOrObject !== null) {
      return userIdOrObject.name || userIdOrObject.email || 'Unknown User';
    }

    const user = allUsers.find(u => (u._id === userIdOrObject) || (u.id === userIdOrObject));
    return user ? (user.name || user.email || `User ID: ${userIdOrObject}`) : `Unknown User (ID: ${userIdOrObject})`;
  };


  const fetchFollowUps = async () => {
    if (!quotation?._id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/quotations/${quotation._id}/followups`);
      setFollowUps(response.data.sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt))));
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      toast.error('Failed to fetch follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!followupDate || !comment.trim()) {
      toast.error('Please select a date and enter a note for the follow-up.');
      return;
    }
    setLoading(true);
    try {
      let request;
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      const addedByUserId = currentUserData?._id || currentUserData?.id; // Use _id first, then id

      if (!addedByUserId) {
        toast.error('User information not found. Please log in.');
        setLoading(false);
        return;
      }

      const payload = {
        date: moment(followupDate).toISOString(),
        note: comment.trim(),
        addedBy: addedByUserId,
      };

      if (editingFollowUp === null) {
        request = axios.post(`/api/quotations/${quotation._id}/followups`, payload);
      } else {
        request = axios.put(`/api/quotations/${quotation._id}/followups/${editingFollowUp._id}`, payload);
      }

      request
        .then(() => {
          toast.success(editingFollowUp === null ? 'Follow-up added successfully!' : 'Follow-up updated successfully!');
          setComment('');
          setFollowupDate(null);
          setEditingFollowUp(null);
          fetchFollowUps();
          if (typeof refreshQuotations === 'function') {
            refreshQuotations();
          }
        })
        .catch((error) => {
          console.error("Error saving follow-up:", error);
          toast.error(`Error saving follow-up: ${error.response?.data?.message || error.message}`);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error preparing follow-up data:", error);
      toast.error('An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleDelete = (followUpId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this follow-up?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        setLoading(true);
        try {
          await axios.delete(`/api/quotations/${quotation._id}/followups/${followUpId}`);
          toast.success('Follow-up deleted successfully!');
          fetchFollowUps();
          if (typeof refreshQuotations === 'function') {
            refreshQuotations();
          }
        } catch (error) {
          console.error("Error deleting follow-up:", error);
          toast.error('Failed to delete follow-up.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = (item) => {
    setComment(item.note);
    setFollowupDate(moment(item.date));
    setEditingFollowUp(item);
  };

  const renderFollowUpItem = (item) => (
    <List.Item
      // actions={[
      //   <Button key="edit" type="link" onClick={() => handleEdit(item)}>Edit</Button>,
      //   <Button key="delete" type="link" danger onClick={() => handleDelete(item._id)}>Delete</Button>,
      // ]}
      // style={{
      //   borderBottom: 'none',
      //   paddingBottom: '0px',
      //   marginBottom: '15px',
      //   alignItems: 'flex-start',
      // }}
    >
      <div style={{
        backgroundColor: '#f0f2f5',
        borderRadius: '12px',
        padding: '10px 15px',
        maxWidth: 'calc(100% - 80px)',
        flexGrow: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
          <UserOutlined style={{ marginRight: '5px', color: '#888' }} />
          <Text strong style={{ marginRight: '10px', color: '#333' }}>
            {/* Using the helper function to get the user display name from fetched users */}
            {getUserDisplayName(item.addedBy)}
          </Text>
          <ClockCircleOutlined style={{ marginRight: '5px', color: '#888' }} />
          <Text type="secondary" style={{ fontSize: '0.8em' }}>
            {moment(item.createdAt).format('DD/MM/YYYY, h:mm:ss A')}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <MessageOutlined style={{ marginRight: '8px', marginTop: '3px', color: '#555' }} />
            <Text style={{ flexGrow: 1 }}>{item.note}</Text>
        </div>
      </div>
    </List.Item>
  );

  return (
    <Drawer
      title={`Follow-ups for Quotation: ${quotation?.quotationNumber || 'N/A'}`}
      open={visible}
      onClose={() => {
        setEditingFollowUp(null);
        setComment('');
        setFollowupDate(null);
        onClose();
      }}
      width={720}
    >
      <div style={{ marginBottom: 20 }}>
        {/* Display current user's email near the input fields */}
        <Text type="secondary" style={{ marginBottom: 8, display: 'block', fontSize: '0.9em' }}>
            Adding follow-up as: <Text strong>{getCurrentUserEmail()}</Text>
        </Text>
        <DatePicker
          style={{ width: '100%', marginBottom: 8 }}
          format="DD-MM-YYYY"
          value={followupDate}
          onChange={(date) => setFollowupDate(date)}
          placeholder="Select follow-up date"
        />
        <TextArea
          rows={4}
          placeholder="Enter follow-up note"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          type="primary"
          style={{ marginTop: 10, backgroundColor: '#ef7a1b', borderColor: '#ef7a1b', color: 'white' }}
          block
          onClick={handleAddOrUpdate}
          loading={loading}
        >
          {editingFollowUp === null ? 'Add Follow-up' : 'Update Follow-up'}
        </Button>
      </div>

      <Divider>All Follow-ups ({followUps.length})</Divider>
      {(loading || usersLoading) ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" tip="Loading Follow-ups..." />
        </div>
      ) : (
        <List
          dataSource={followUps}
          renderItem={renderFollowUpItem}
          locale={{ emptyText: 'No follow-ups found for this quotation.' }}
          style={{ marginTop: 16 }}
        />
      )}
    </Drawer>
  );
};

export default QuotationFollowUpDrawer;