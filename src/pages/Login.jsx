import React from 'react';
import { Form, Input, Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../css/Login.css'; // Custom styles
import loginImage from '../assets/side.png'; // Ensure this image exists

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await axios.post('/api/auth/login', {
        username: values.email,
        password: values.password
      });

      const { user, token } = res.data;

      // Save login data with 2-day expiry
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('token_expiry', Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

      toast.success(`Welcome ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <Card className="login-card" bordered={false}>
          <h2 className="login-title">Log In</h2>
          <p className="login-subtitle">Welcome back! Please enter your details</p>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <div className="forgot-password-wrapper">
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className="login-button">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      <div className="login-right">
        <img src={loginImage} alt="Login visual" />
      </div>
    </div>
  );
};

export default Login;
