import React, { useState, useEffect } from 'react';
import { Button, notification } from 'antd';
import axios from 'axios';
import ProductList from './ProductList';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      notification.error({ message: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product) => {
    try {
      const response = await axios.post('/api/products', product);
      setProducts([...products, response.data]);
      notification.success({ message: 'Product added successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to add product' });
    }
  };

  const handleEditProduct = async (product) => {
    try {
      await axios.put(`/api/products/${product.id}`, product);
      setProducts(products.map(p => (p.id === product.id ? product : p)));
      notification.success({ message: 'Product updated successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to update product' });
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
      notification.success({ message: 'Product deleted successfully' });
    } catch (error) {
      notification.error({ message: 'Failed to delete product' });
    }
  };

  return (
    <div className="product-page">
      <h1>Product Management</h1>
      <ProductList
        products={products}
        onAdd={handleAddProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default ProductPage;