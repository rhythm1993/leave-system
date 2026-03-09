import React from 'react';
import { Card, Row, Col, Statistic, Button, List, Tag, Space, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Pending Approvals',
      value: 5,
      icon: <ClockCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      color: '#fff7e6',
    },
    {
      title: 'Leave Days This Month',
      value: 12,
      icon: <FileTextOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      color: '#f6ffed',
    },
    {
      title: 'Remaining Leave',
      value: 13,
      icon: <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      color: '#e6f7ff',
    },
    {
      title: 'Team Members',
      value: 8,
      icon: <UserOutlined style={{ color: '#722ed1', fontSize: 24 }} />,
      color: '#f9f0ff',
    },
  ];

  const pendingApprovals = [
    { id: 1, name: 'Zhang San', type: 'Annual Leave', days: 3, date: '2026-03-15 to 2026-03-17' },
    { id: 2, name: 'Li Si', type: 'Sick Leave', days: 2, date: '2026-03-18 to 2026-03-19' },
    { id: 3, name: 'Wang Wu', type: 'Annual Leave', days: 5, date: '2026-03-20 to 2026-03-24' },
  ];

  return (
    <div>
      <Title level={4}>Dashboard</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card style={{ background: stat.color, border: 'none' }}>
              <Space size="large">
                {stat.icon}
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  valueStyle={{ fontSize: 28, fontWeight: 'bold' }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions">
            <Space>
              <Button type="primary" size="large" onClick={() => navigate('/leave/apply')}>
                Apply for Leave
              </Button>
              <Button size="large" onClick={() => navigate('/calendar')}>
                View Calendar
              </Button>
              <Button size="large" onClick={() => navigate('/leave/my-applications')}>
                My Applications
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Pending My Approval"
            extra={<Button type="link" onClick={() => navigate('/leave/pending-approval')}>View All</Button>}
          >
            <List
              dataSource={pendingApprovals}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small" onClick={() => navigate('/leave/pending-approval')}>Approve</Button>,
                    <Button danger size="small" onClick={() => navigate('/leave/pending-approval')}>Reject</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color={item.type === 'Annual Leave' ? 'green' : 'red'}>{item.type}</Tag>
                      </Space>
                    }
                    description={`${item.date} · ${item.days} days`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="System Announcements">
            <List>
              <List.Item>
                <Text>📢 2026 Spring Festival holiday schedule has been released</Text>
              </List.Item>
              <List.Item>
                <Text>📢 Please confirm your leave balance for this quarter</Text>
              </List.Item>
              <List.Item>
                <Text>📢 New feature: Batch approval is now available</Text>
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
