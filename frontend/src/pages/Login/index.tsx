import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store';
import { mockUsers } from '../../mock/data';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    
    // 模拟登录验证
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === values.username && u.password === values.password
      );

      if (user) {
        setUser(user);
        message.success('登录成功！');
        navigate('/dashboard');
      } else {
        message.error('用户名或密码错误');
      }
      setLoading(false);
    }, 500);
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
              请假申请系统
            </Title>
            <Text type="secondary">Leave Application System</Text>
          </div>

          <Form
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <div style={{ background: '#f6ffed', padding: 12, borderRadius: 4 }}>
            <Text strong style={{ fontSize: 12, color: '#52c41a' }}>
              测试账号：
            </Text>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              <div>管理员: admin / password123</div>
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
