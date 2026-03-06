import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 模拟用户数据
const mockUser = {
  id: 'user-001',
  username: 'admin',
  fullName: '系统管理员',
  role: 'SYSTEM_ADMIN',
};

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/leave',
      icon: <FileTextOutlined />,
      label: '请假管理',
      children: [
        { key: '/leave/apply', label: '申请请假' },
        { key: '/leave/my-applications', label: '我的申请' },
        { key: '/leave/pending-approval', label: '待我审批' },
      ],
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: '请假日历',
    },
    ...(mockUser.role === 'SYSTEM_ADMIN' || mockUser.role === 'HR'
      ? [
          {
            key: '/users',
            icon: <TeamOutlined />,
            label: '用户管理',
          },
        ]
      : []),
    // 系统设置暂不开放（MVP2阶段实现）
    // {
    //   key: '/settings',
    //   icon: <SettingOutlined />,
    //   label: '系统设置',
    // },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        theme="light"
        style={{
          boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                background: '#1890ff',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              L
            </div>
            <Text strong style={{ fontSize: 18 }}>
              请假系统
            </Text>
          </Space>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/leave']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            zIndex: 9,
          }}
        >
          <Space size={24}>
            <Badge count={5} size="small">
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleMenuClick }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontWeight: 500 }}>{mockUser.fullName}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{mockUser.role}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
