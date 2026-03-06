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

// 模拟当前用户数据
const mockCurrentUser = {
  id: 'user-001',
  username: 'admin',
  fullName: '系统管理员',
  email: 'admin@company.com',
  phone: '13800138001',
  department: 'IT部',
  role: 'SYSTEM_ADMIN',
  joinDate: '2024-01-15',
  avatar: null,
};

// 模拟请假余额（统一余额）
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
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('个人资料更新成功');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    message.info('修改密码功能开发中...');
  };

  return (
    <div>
      <Title level={4}>个人资料</Title>

      <Row gutter={[24, 24]}>
        {/* 左侧：基本信息 */}
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
                编辑资料
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={handleChangePassword}
                block
              >
                修改密码
              </Button>
            </Space>
          </Card>

          {/* 假期余额卡片 */}
          <Card title="我的假期余额" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">剩余可用天数</Text>
                <div style={{ fontSize: 48, fontWeight: 'bold', color: '#52c41a', margin: '10px 0' }}>
                  {mockBalance.remaining}
                </div>
                <Text type="secondary">天</Text>
              </div>

              <Divider />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>总额度</Text>
                  <Text strong>{mockBalance.total} 天</Text>
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
                  已用 {mockBalance.used} 天
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 右侧：详细信息 */}
        <Col xs={24} lg={16}>
          <Card title="基本信息">
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
                      label="姓名"
                      rules={[{ required: true, message: '请输入姓名' }]}
                    >
                      <Input prefix={<UserOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="username"
                      label="用户名"
                    >
                      <Input disabled value={mockCurrentUser.username} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' },
                      ]}
                    >
                      <Input prefix={<MailOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label="电话"
                    >
                      <Input prefix={<PhoneOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="部门">
                      <Input disabled value={mockCurrentUser.department} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="角色">
                      <Input disabled value={mockCurrentUser.role} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存
                    </Button>
                    <Button onClick={() => setIsEditing(false)}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="用户名">{mockCurrentUser.username}</Descriptions.Item>
                <Descriptions.Item label="姓名">{mockCurrentUser.fullName}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{mockCurrentUser.email}</Descriptions.Item>
                <Descriptions.Item label="电话">{mockCurrentUser.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="部门">{mockCurrentUser.department}</Descriptions.Item>
                <Descriptions.Item label="角色">{mockCurrentUser.role}</Descriptions.Item>
                <Descriptions.Item label="入职日期">{mockCurrentUser.joinDate}</Descriptions.Item>
                <Descriptions.Item label="员工ID">{mockCurrentUser.id}</Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          {/* 最近请假记录 */}
          <Card title="最近请假记录" style={{ marginTop: 24 }}>
            <Descriptions column={1}>
              <Descriptions.Item label="2026-03-10 至 2026-03-12">
                <Space>
                  <span>年假</span>
                  <span style={{ color: '#52c41a' }}>已通过</span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="2026-02-05">
                <Space>
                  <span>病假</span>
                  <span style={{ color: '#52c41a' }}>已通过</span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
