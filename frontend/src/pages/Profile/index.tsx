import React, { useState } from 'react';
import {
  Card,
  Avatar,
  Button,
  Form,
  Input,
  message,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  Descriptions,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  LockOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Mock current user data
const mockCurrentUser = {
  id: 'user-001',
  username: 'admin',
  fullName: 'System Administrator',
  email: 'admin@company.com',
  phone: '13800138001',
  department: 'IT Department',
  role: 'SYSTEM_ADMIN',
  joinDate: '2024-01-15',
  avatar: null,
};

// Mock leave balance (unified balance)
const mockBalance = {
  total: 20,
  used: 7,
  remaining: 13,
};

export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue({
      fullName: mockCurrentUser.fullName,
      email: mockCurrentUser.email,
      phone: mockCurrentUser.phone,
    });
    setIsEditing(true);
  };

  const handleSave = async (values: any) => {
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    message.info('Change password feature coming soon...');
  };

  return (
    <div>
      <Title level={4}>My Profile</Title>

      <Row gutter={[24, 24]}>
        {/* Left: Basic Info */}
        <Col xs={24} lg={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, backgroundColor: '#1890ff' }}
            />
            <Title level={5} style={{ marginBottom: 8 }}>
              {mockCurrentUser.fullName}
            </Title>
            <Text type="secondary">{mockCurrentUser.department}</Text>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                block
              >
                Edit Profile
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={handleChangePassword}
                block
              >
                Change Password
              </Button>
            </Space>
          </Card>

          {/* Leave Balance Card */}
          <Card title="My Leave Balance" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">Remaining Available Days</Text>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#52c41a', margin: '10px 0' }}>
                  {mockBalance.remaining}
                </div>
                <Text type="secondary">days</Text>
              </div>

              <Divider />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Total Quota</Text>
                  <Text strong>{mockBalance.total} days</Text>
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(mockBalance.used / mockBalance.total) * 100}%`,
                      background: '#1890ff',
                      height: '100%',
                    }}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Used {mockBalance.used} days
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right: Detailed Info */}
        <Col xs={24} lg={16}>
          <Card title="Basic Information">
            {isEditing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  fullName: mockCurrentUser.fullName,
                  email: mockCurrentUser.email,
                  phone: mockCurrentUser.phone,
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fullName"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter full name' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                    >
                      <Input disabled value={mockCurrentUser.username} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter a valid email address' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="Phone"
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Department">
                      <Input disabled value={mockCurrentUser.department} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Role">
                      <Input disabled value={mockCurrentUser.role} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Username">{mockCurrentUser.username}</Descriptions.Item>
                <Descriptions.Item label="Full Name">{mockCurrentUser.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{mockCurrentUser.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{mockCurrentUser.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Department">{mockCurrentUser.department}</Descriptions.Item>
                <Descriptions.Item label="Role">{mockCurrentUser.role}</Descriptions.Item>
                <Descriptions.Item label="Join Date">{mockCurrentUser.joinDate}</Descriptions.Item>
                <Descriptions.Item label="Employee ID">{mockCurrentUser.id}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          {/* Recent Leave Records */}
          <Card title="Recent Leave Records" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="2026-03-10 to 2026-03-12">
                <Space>
                  <span>Annual Leave</span>
                  <span style={{ color: '#52c41a' }}>Approved</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="2026-02-05">
                <Space>
                  <span>Sick Leave</span>
                  <span style={{ color: '#52c41a' }}>Approved</span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
