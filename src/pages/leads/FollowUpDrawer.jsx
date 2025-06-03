import React, { useState, useEffect } from 'react';
import {
  Drawer, Button, Input, DatePicker, Tabs, List, Typography, Divider, Modal
} from 'antd';
import axios from '../../api/axios';
import { toast } from 'react-hot-toast';
import moment from 'moment';

const { TextArea } = Input;
const { TabPane } = Tabs;

const FollowUpDrawer = ({ visible, onClose, account, refreshAccounts }) => {
  const [comment, setComment] = useState('');
  const [followupDate, setFollowupDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (visible && account?._id) fetchFollowUps();
  }, [visible, account]);

  const fetchFollowUps = async () => {
    try {
      const res = await axios.get(`/api/accounts`);
      const fresh = res.data.find(a => a._id === account._id);
      setFollowUps(fresh.followUps || []);
    } catch {
      toast.error('Failed to fetch follow-ups');
    }
  };

  const handleAddOrUpdate = () => {
    if (!comment || !followupDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const addedBy = JSON.parse(localStorage.getItem('user'))?._id;
    if (!addedBy) {
      toast.error('User not found');
      return;
    }

    setLoading(true);

    const payload = { comment, followupDate, addedBy };

    const request = editingIndex === null
      ? axios.post(`/api/accounts/${account._id}/followups`, payload)
      : axios.put(`/api/accounts/${account._id}/followups/${editingIndex}`, payload);

    request
      .then(() => {
        toast.success(editingIndex === null ? 'Follow-up added' : 'Follow-up updated');
        setComment('');
        setFollowupDate(null);
        setEditingIndex(null);
        fetchFollowUps();
        refreshAccounts();
      })
      .catch(() => toast.error('Failed to save follow-up'))
      .finally(() => setLoading(false));
  };

  const handleEdit = (index) => {
    const f = followUps[index];
    setComment(f.comment);
    setFollowupDate(moment(f.followupDate));
    setEditingIndex(index);
  };

  const handleDelete = (index) => {
    Modal.confirm({
      title: 'Delete Follow-up',
      content: 'Are you sure you want to delete this follow-up?',
      okText: 'Yes',
      onOk: () => {
        axios.delete(`/api/accounts/${account._id}/followups/${index}`)
          .then(() => {
            toast.success('Follow-up deleted');
            fetchFollowUps();
            refreshAccounts();
          })
          .catch(() => toast.error('Failed to delete follow-up'));
      }
    });
  };

  const today = moment().format('YYYY-MM-DD');
  const sorted = [...followUps].sort((a, b) =>
    new Date(b.followupDate) - new Date(a.followupDate)
  );

  const todayFollowUps = sorted.filter(f =>
    moment(f.followupDate).format('YYYY-MM-DD') === today
  );
  const upcoming = sorted.filter(f =>
    moment(f.followupDate).isAfter(today, 'day')
  );
  const past = sorted.filter(f =>
    moment(f.followupDate).isBefore(today, 'day')
  );

  const renderFollowUpItem = (item, index) => (
    <List.Item
      actions={[
        <a key="edit" onClick={() => handleEdit(index)}>Edit</a>,
        <a key="delete" onClick={() => handleDelete(index)}>Delete</a>
      ]}
    >
      <div>
        <Typography.Text strong>
          {moment(item.followupDate).format('DD-MM-YYYY')}
        </Typography.Text><br />
        {item.comment}<br />
        <Typography.Text type="secondary">
          By {item.addedBy?.name || 'Unknown'}
        </Typography.Text>
      </div>
    </List.Item>
  );

  return (
    <Drawer
      title={`Follow-ups: ${account?.businessName}`}
      open={visible}
      onClose={() => {
        setEditingIndex(null);
        setComment('');
        setFollowupDate(null);
        onClose();
      }}
      width={720}
    >
      <div style={{ marginBottom: 20 }}>
        <DatePicker
          style={{ width: '100%', marginBottom: 8 }}
          format="DD-MM-YYYY"
          value={followupDate}
          onChange={(date) => setFollowupDate(date)}
        />
        <TextArea
          rows={4}
          placeholder="Enter follow-up comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <Button
          type="primary"
          block
          onClick={handleAddOrUpdate}
          loading={loading}
          style={{ marginTop: 10 }}
        >
          {editingIndex === null ? 'Add Follow-up' : 'Update Follow-up'}
        </Button>
      </div>

      <Divider />
      <Tabs defaultActiveKey="today">
        <TabPane tab={`Today's Follow-ups (${todayFollowUps.length})`} key="today">
          <List
            dataSource={todayFollowUps}
            renderItem={(item, index) => renderFollowUpItem(item, followUps.indexOf(item))}
            locale={{ emptyText: 'No follow-ups for today' }}
          />
        </TabPane>
        <TabPane tab={`Upcoming Follow-ups (${upcoming.length})`} key="upcoming">
          <List
            dataSource={upcoming}
            renderItem={(item, index) => renderFollowUpItem(item, followUps.indexOf(item))}
            locale={{ emptyText: 'No upcoming follow-ups' }}
          />
        </TabPane>
        <TabPane tab={`Past Follow-ups (${past.length})`} key="past">
          <List
            dataSource={past}
            renderItem={(item, index) => renderFollowUpItem(item, followUps.indexOf(item))}
            locale={{ emptyText: 'No past follow-ups' }}
          />
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default FollowUpDrawer;
