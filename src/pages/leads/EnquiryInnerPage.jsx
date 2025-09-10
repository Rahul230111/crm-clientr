// File: src/components/leads/Leads.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";
import {
  Card,
  Input,
  Button,
  Typography,
  List,
  Row,
  Col,
  Divider,
  Badge,
  message,
  Spin,
  Empty,
  Table
} from "antd";
import {
  SearchOutlined,
  BackwardFilled,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SendOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Leads = () => {
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Format price as INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Format date and time
  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock data fetch - replace with your API call
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Replace with actual API call
        const { data } = await axios.get("/api/product");
        
        // Make sure each product has a unique identifier
        const productsWithId = data.map((product, index) => ({
          ...product,
          // Use product._id if available from API, otherwise create a unique id
          uniqueId: product._id || product.id || `product-${index}`
        }));
        
        setAllProducts(productsWithId);
      } catch (error) {
        message.error("Failed to fetch products");
        console.error("API Error:", error);
        
        // Fallback to mock data if API fails
        const mockProducts = [
          { uniqueId: 1, productName: "Laptop", description: "High performance laptop", price: 59999 },
          { uniqueId: 2, productName: "Smartphone", description: "Latest smartphone model", price: 25999 },
          { uniqueId: 3, productName: "Headphones", description: "Noise cancelling headphones", price: 4499 },
          { uniqueId: 4, productName: "Monitor", description: "27-inch 4K monitor", price: 27999 },
          { uniqueId: 5, productName: "Keyboard", description: "Mechanical RGB keyboard", price: 3499 },
        ];
        setAllProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    // Load mock quotations data
    const loadQuotations = () => {
      const mockQuotations = [
        {
          id: 1,
          createdAt: new Date('2023-10-15T14:30:00'),
          companyName: "ABC Technologies Pvt. Ltd.",
          createdBy: "John Doe",
          amount: 125999
        },
        {
          id: 2,
          createdAt: new Date('2023-10-16T10:15:00'),
          companyName: "XYZ Solutions",
          createdBy: "Jane Smith",
          amount: 85999
        },
        {
          id: 3,
          createdAt: new Date('2023-10-17T16:45:00'),
          companyName: "Global Enterprises",
          createdBy: "Robert Johnson",
          amount: 210499
        }
      ];
      setQuotations(mockQuotations);
    };

    fetchProducts();
    loadQuotations();
  }, []);

  // Filter products based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = allProducts.filter(product => 
        product.productName.toLowerCase().includes(searchText.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredProducts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchText, allProducts]);

  const addToCart = (product) => {
    // Use uniqueId for comparison instead of id
    const existingItem = cart.find(item => item.uniqueId === product.uniqueId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.uniqueId === product.uniqueId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setSearchText("");
    setShowDropdown(false);
    message.success(`${product.productName} added to cart`);
  };

  const increaseQuantity = (uniqueId) => {
    setCart(cart.map(item => 
      item.uniqueId === uniqueId 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
    ));
  };

  const decreaseQuantity = (uniqueId) => {
    const item = cart.find(item => item.uniqueId === uniqueId);
    if (item.quantity === 1) {
      removeFromCart(uniqueId);
    } else {
      setCart(cart.map(item => 
        item.uniqueId === uniqueId 
          ? { ...item, quantity: item.quantity - 1 } 
        : item
      ));
    }
  };

  const removeFromCart = (uniqueId) => {
    const item = cart.find(item => item.uniqueId === uniqueId);
    setCart(cart.filter(item => item.uniqueId !== uniqueId));
    message.info(`${item.productName} removed from cart`);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSendQuotation = () => {
    if (cart.length === 0) {
      message.warning("Please add at least one product to send a quotation");
      return;
    }
    
    // Create new quotation
    const newQuotation = {
      id: quotations.length + 1,
      createdAt: new Date(),
      companyName: "New Customer", // In a real app, this would come from a form
      createdBy: "Current User",   // In a real app, this would be the logged in user
      amount: calculateTotal()
    };
    
    setQuotations([newQuotation, ...quotations]);
    setCart([]);
    message.success("Quotation sent successfully!");
  };

  // Table columns for quotations
  const quotationColumns = [
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDateTime(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatPrice(amount),
      sorter: (a, b) => a.amount - b.amount,
    },
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Product Quotation</Title>
          <Button
            type="primary"
            icon={<BackwardFilled />}
            style={{ backgroundColor: "#ef7a1b", borderColor: "#ef7a1b", color: "white" }}
            onClick={() => {
              // Handle back navigation
            }}
          >
            Back
          </Button>
        </div>
      }
    >
      <Row gutter={24}>
        {/* Left side - Product Search and Cart (6/12 width) */}
        <Col xs={24} lg={12}>
          <div ref={searchRef} style={{ position: 'relative', marginBottom: 16 }}>
            <Input
              placeholder="Search Product Name or Description"
              prefix={<SearchOutlined />}
              style={{ width: "100%" }}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              onFocus={() => {
                if (searchText) setShowDropdown(true);
              }}
            />
            
            {/* Search Results Dropdown */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin size="small" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="No products found" 
                    style={{ padding: '16px' }}
                  />
                ) : (
                  <List
                    size="small"
                    dataSource={filteredProducts}
                    renderItem={product => (
                      <List.Item
                        style={{ padding: '8px 16px', cursor: 'pointer' }}
                        onClick={() => addToCart(product)}
                      >
                        <List.Item.Meta
                          title={product.productName}
                          description={
                            <div>
                              <div>{product.description}</div>
                              <div style={{ marginTop: 5 }}>
                                <Text strong>{formatPrice(product.price)}</Text>
                              </div>
                            </div>
                          }
                        />
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<PlusOutlined />}
                        >
                          Add
                        </Button>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            )}
          </div>
          
          <Divider />
          
          <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
            <Title level={5}>Selected Products</Title>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 10 }}>
                <ShoppingCartOutlined style={{ fontSize: 24, color: '#ddd' }} />
                <p style={{ color: '#999', marginTop: 5 }}>No products selected</p>
                <Text type="secondary">Search for products above to add them to your quotation</Text>
              </div>
            ) : (
              <>
                <List
                  size="small"
                  dataSource={cart}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button 
                          size="small"
                          icon={<MinusOutlined />}
                          onClick={() => decreaseQuantity(item.uniqueId)}
                        />,
                        <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>,
                        <Button 
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => increaseQuantity(item.uniqueId)}
                        />,
                        <Button 
                          size="small"
                          icon={<DeleteOutlined />} 
                          danger 
                          onClick={() => removeFromCart(item.uniqueId)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        title={item.productName}
                        description={
                          <div>
                            <div>{formatPrice(item.price)} each</div>
                            <div style={{ marginTop: 5 }}>
                              <Text strong>Subtotal: {formatPrice(item.price * item.quantity)}</Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong>Total: {formatPrice(calculateTotal())}</Text>
                  <Button 
                    type="primary" 
                    icon={<SendOutlined />}
                    size="large"
                    style={{ backgroundColor: "#ef7a1b", borderColor: "#ef7a1b" }}
                    onClick={handleSendQuotation}
                  >
                    Send Quotation
                  </Button>
                </div>
              </>
            )}
          </div>
        </Col>
        
        {/* Right side - Quotations Grid (6/12 width) */}
        <Col xs={24} lg={12}>
          <Card title="Quotations">
            {quotations.length > 0 ? (
              <Table
                dataSource={quotations}
                columns={quotationColumns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="middle"
                scroll={{ x: true }}
              />
            ) : (
              <Empty
                description="No quotations yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Text type="secondary">
                  Create your first quotation by adding products and clicking "Send Quotation"
                </Text>
              </Empty>
            )}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default Leads;