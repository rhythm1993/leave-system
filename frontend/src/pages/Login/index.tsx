import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { authApi } from '../../services/api';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response: any = await authApi.login(values.username, values.password);
      if (response.code === 200) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        message.success('Login successful!');
        navigate('/dashboard');
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: '#1890ff',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 32,
              }}
            >
              L
            </div>
            <Title level={3} style={{ margin: 0 }}>
              Leave Application System
            </Title>
            <Text type="secondary">Employee Leave Management</Text>
          </div>

          <Form
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please enter username' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Login
              </Button>
            </Form.Item>
          </Form>

          <div style={{ background: '#f6ffed', padding: 12, borderRadius: 4 }}>
            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
              Test Accounts:
            </Text>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              <div>Admin: admin / password123</div>
              <div>HR: wenny / password123</div>
              <div>PM: alex / password123</div>
              <div>Staff: lisa / password123</div>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};
