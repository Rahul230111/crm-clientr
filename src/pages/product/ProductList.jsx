import React, { useState } from 'react';
import { Table, Button, Input, Space, Tag, Popconfirm, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProductForm from './ProductForm';

const ProductList = ({ products, onAdd, onEdit, onDelete }) => {
  const [searchText, setSearchText] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'S.No',
      dataIndex: 'id',
      key: 'id',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => `${quantity} ${quantity > 1 ? 'units' : 'unit'}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `₹${price.toLocaleString('en-IN')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => {
              setCurrentProduct(record);
              setFormVisible(true);
            }}
          />
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-list">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search product by name"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentProduct(null);
            setFormVisible(true);
          }}
        >
          Add Product
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredProducts} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <ProductForm
        visible={formVisible}
        onCancel={() => {
          setFormVisible(false);
          setCurrentProduct(null);
        }}
        onSave={(values) => {
          if (currentProduct) {
            onEdit({ ...values, id: currentProduct.id });
            message.success('Product updated successfully');
          } else {
            onAdd(values);
            message.success('Product added successfully');
          }
          setFormVisible(false);
        }}
        initialValues={currentProduct}
      />
    </div>
  );
};

export default ProductList;