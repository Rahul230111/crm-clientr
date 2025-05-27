import { Table, Space, Button, Card, Tag } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const InvoiceList = ({ onAddNew, invoices, onView, onEdit, onDelete }) => {
  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total, record) => (
        `${record.currency === 'usd' ? '$' : record.currency === 'eur' ? '€' : '£'} ${total.toFixed(2)}`
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'paid' ? 'green' : 
          status === 'sent' ? 'blue' : 'orange'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => onView(record)} />
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => onDelete(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="Invoice List" 
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddNew}>
          New Invoice
        </Button>
      }
    >
      <Table 
        columns={columns} 
        dataSource={invoices} 
        rowKey="id"
        locale={{ emptyText: 'No invoices found' }}
      />
    </Card>
  );
};

export default InvoiceList;