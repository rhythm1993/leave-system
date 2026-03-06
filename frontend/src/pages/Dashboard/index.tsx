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
      title: '待审批申请',
      value: 5,
      icon: <ClockCircleOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      color: '#fff7e6',
    },
    {
      title: '本月请假天数',
      value: 12,
      icon: <FileTextOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      color: '#f6ffed',
    },
    {
      title: '剩余假期',
      value: 13,
      icon: <CheckCircleOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      color: '#e6f7ff',
    },
    {
      title: '团队成员',
      value: 8,
      icon: <UserOutlined style={{ color: '#722ed1', fontSize: 24 }} />,
      color: '#f9f0ff',
    },
  ];

  const pendingApprovals = [
    { id: 1, name: '张三', type: '年假', days: 3, date: '2026-03-15 至 2026-03-17' },
    { id: 2, name: '李四', type: '病假', days: 2, date: '2026-03-18 至 2026-03-19' },
    { id: 3, name: '王五', type: '年假', days: 5, date: '2026-03-20 至 2026-03-24' },
  ];

  return (
    <div>
      <Title level={4}>仪表板</Title>
      
      {/* 统计卡片 */}
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

      {/* 快捷操作 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="快捷操作">
            <Space>
              <Button type="primary" size="large" onClick={() => navigate('/leave/apply')}>
                申请请假
              </Button>
              <Button size="large" onClick={() => navigate('/calendar')}>
                查看日历
              </Button>
              <Button size="large" onClick={() => navigate('/leave/my-applications')}>
                我的申请
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 待审批列表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="待我审批" 
            extra={<Button type="link" onClick={() => navigate('/leave/pending-approval')}>查看全部</Button>}
          >
            <List
              dataSource={pendingApprovals}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small" onClick={() => navigate('/leave/pending-approval')}>通过</Button>,
                    <Button danger size="small" onClick={() => navigate('/leave/pending-approval')}>拒绝</Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color={item.type === '年假' ? 'green' : 'red'}>{item.type}</Tag>
                      </Space>
                    }
                    description={`${item.date} · ${item.days}天`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统公告">
            <List>
              <List.Item>
                <Text>📢 2026年春节放假安排已发布</Text>
              </List.Item>
              <List.Item>
                <Text>📢 请尽快完成本季度请假余额确认</Text>
              </List.Item>
              <List.Item>
                <Text>📢 新功能：支持批量审批已上线</Text>
              </List.Item>
            </List>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
