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
  Table,
  Modal,
  Form,
  Input as AntInput,
  DatePicker
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
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import EnquiryForm from "./EnquiryForm";
const { Title, Text } = Typography;
const { TextArea } = AntInput;

const Leads = () => {
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const searchRef = useRef(null);
  const [userAccount, setUserAccount] = useState({});
  const navigate = useNavigate();
  const [formVisible, setFormVisible] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  // Get Params id
  const { id } = useParams();
  const userData = localStorage.getItem("user");
  
  let userName = "";
  let userId = "";
  if (userData) {
    const user = JSON.parse(userData);
    userName = user.name;
    userId = user._id || user.id;
  }

  const fetchUserAcc = async () => {
    try {
      const { data } = await axios.get(`/api/accounts/${id}`);
      setUserAccount(data);
    } catch (err) {
      toast.error("Failed to load account details");
    }
  };

  useEffect(() => {
    if (Object.keys(userAccount).length === 0) {
      fetchUserAcc();
    }
  }, []);

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
    }).format(new Date(date));
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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/product");
        const productsWithId = data.map((product, index) => ({
          ...product,
          uniqueId: product._id || product.id || `product-${index}`
        }));
        setAllProducts(productsWithId);
      } catch (error) {
        message.error("Failed to fetch products");
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch quotations
  const fetchQuotations = async () => {
    try {
      const { data } = await axios.get(`/api/quotations/business/${id}`);
      setQuotations(data);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      message.error("Failed to load quotations");
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [id]);

  // Filter products based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = allProducts.filter(product => 
        product.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
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
    const existingItem = cart.find(item => item.uniqueId === product.uniqueId);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.uniqueId === product.uniqueId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        quantity: 1,
        productId: product._id || product.id,
        description: product.description || product.productName,
        hsnSac: product.hsnSac || "",
        quantityType: product.quantityType || "",
        rate: product.price || 0,
        specifications: product.specifications || []
      }]);
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

  const calculateSubTotal = () => {
    return cart.reduce((total, item) => total + (item.rate * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubTotal(); // No tax calculation
  };

  const handleSendQuotation = () => {
    if (cart.length === 0) {
      message.warning("Please add at least one product to send a quotation");
      return;
    }
    
    setIsModalVisible(true);
  };

  const handleCreateQuotation = async (values) => {
    try {
      // Format customer address from userAccount data
      const customerAddress = `${userAccount.addressLine1 || ''} ${userAccount.addressLine2 || ''}, ${userAccount.city || ''}, ${userAccount.state || ''}, ${userAccount.pincode || ''}, ${userAccount.country || ''}`;
      
      const quotationData = {
        businessId: id,
        businessName: userAccount.businessName,
        businessType: userAccount.type,
        businessInfo: `${userAccount.businessName}\n${userAccount.contactName}\n${userAccount.addressLine1} ${userAccount.addressLine2}`,
        gstin: userAccount.gstNumber || "",
        quotationNumber: `Q-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        date: values.date.format('YYYY-MM-DD'),
        validUntil: values.validUntil.format('YYYY-MM-DD'),
        customerName: userAccount.contactName || userAccount.businessName,
        customerEmail: userAccount.email,
        customerAddress: customerAddress,
        items: cart,
        subTotal: calculateSubTotal(),
        tax: 0, // No tax
        total: calculateTotal(),
        createdDate: new Date().toISOString(),
        notes: values.note ? [{ text: values.note, timestamp: new Date().toLocaleString(), author: userName }] : [],
        gstType: "none", 
        createdBy: userName,
        createdById : userId
      };

      const { data } = await axios.post("/api/quotations", quotationData);
      
      message.success("Quotation created successfully!");
      setIsModalVisible(false);
      form.resetFields();
      setCart([]);
      fetchQuotations(); 
      
    } catch (error) {
      console.error("Error creating quotation:", error);
      message.error("Failed to create quotation");
    }
  };

  // Table columns for quotations - Updated to show Created By instead of Customer Name
  const quotationColumns = [
    {
      title: 'Quotation Number',
      dataIndex: 'quotationNumber',
      key: 'quotationNumber',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDateTime(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    {
      title: 'Amount',
      dataIndex: 'total',
      key: 'total',
      render: (amount) => formatPrice(amount),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'Sent' ? 'success' : 'processing'} 
          text={status || 'Draft'} 
        />
      ),
    },
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{userAccount.businessName || ""}</Title>
          <Button
            type="primary"
            icon={<BackwardFilled />}
            style={{ backgroundColor: "#ef7a1b", borderColor: "#ef7a1b", color: "white" }}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        </div>
      }
    >
      <Row gutter={24}>
        {/* Left side - Product Search and Cart (10/24 width) */}
        <Col xs={24} lg={10}>
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
            
            <div style={{ padding: '16px', background: '#f9f9f9', borderRadius: '8px'}}>
              <Title level={5}>Selected Products</Title>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 10, justifyItems:"center", alignItems:"center" }}>
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
                              <div>{formatPrice(item.rate)} each</div>
                              <div style={{ marginTop: 5 }}>
                                <Text strong>Subtotal: {formatPrice(item.rate * item.quantity)}</Text>
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
                      Create Quotation
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Col>
          
          {/* Right side - Quotations Grid (14/24 width) */}
          <Col xs={24} lg={14}>
            <Card title="Quotations">
              {quotations.length > 0 ? (
                <Table
                  dataSource={quotations}
                  columns={quotationColumns}
                  rowKey="_id"
                  pagination={{ pageSize: 5 }}
                  size="middle"
                  scroll={{ x: true }}
                  onRow={(record) => ({
                    onClick: () => {
                       setSelectedQuotation(record);
                       setFormVisible(true);
                    },
                  })}
                />
              ) : (
                <Empty
                  description="No quotations yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Text type="secondary">
                    Create your first quotation by adding products and clicking "Create Quotation"
                  </Text>
                </Empty>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quotation Creation Modal */}
        <Modal
          title="Create Quotation"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateQuotation}
            initialValues={{
              date: dayjs(),
              validUntil: dayjs().add(7, 'day'),
              customerName: userAccount.contactName || userAccount.businessName,
              customerEmail: userAccount.email,
              customerAddress: `${userAccount.addressLine1 || ''} ${userAccount.addressLine2 || ''}, ${userAccount.city || ''}, ${userAccount.state || ''}, ${userAccount.pincode || ''}`
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="customerName"
                  label="Customer Name"
                >
                  <Input placeholder="Enter customer name" readOnly />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="customerEmail"
                  label="Customer Email"
                >
                  <Input placeholder="Enter customer email" readOnly />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="customerAddress"
              label="Customer Address"
            >
              <TextArea rows={2} placeholder="Enter customer address" readOnly />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Quotation Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="validUntil"
                  label="Valid Until"
                  rules={[{ required: true, message: 'Please select validity date' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="note"
              label="Notes"
              rules={[{ required: true, message: 'Please add notes' }]}
            >
              <TextArea rows={3} placeholder="Add any additional notes (required)" />
            </Form.Item>

            <Divider />
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>Order Summary:</Text>
              <div>Total: {formatPrice(calculateTotal())}</div>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                Forward To Quotation Team
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Modal>

           <EnquiryForm
                visible={formVisible}
                onClose={() => setFormVisible(false)}
                quotation={selectedQuotation}
            />
      </Card>
    );
};

export default Leads;