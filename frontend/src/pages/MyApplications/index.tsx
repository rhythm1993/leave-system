import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  message,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { leaveApi } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // 获取申请列表
  const fetchApplications = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = {
        view: 'my',
        page,
        size: pageSize,
      };
      
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }

      const response: any = await leaveApi.getApplications(params);
      if (response.code === 200) {
        setApplications(response.data.list);
        setPagination({
          current: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
        });
      }
    } catch (error) {
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending_endorsement: { color: 'processing', text: '待背书' },
      endorsed: { color: 'warning', text: '待HR审批' },
      pending_hr_approval: { color: 'warning', text: '待HR审批' },
      approved: { color: 'success', text: '已通过' },
      rejected: { color: 'error', text: '已拒绝' },
      cancelled: { color: 'default', text: '已取消' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getLeaveTypeText = (type: string) => {
    const types: Record<string, string> = {
      annual: '年假',
      sick: '病假',
      marriage: '婚假',
      maternity: '产假',
      paternity: '陪产假',
      compassionate: '恩恤假',
      unpaid: '无薪假',
      other: '其他',
    };
    return types[type] || type;
  };

  const handleViewDetail = (record: any) => {
    setCurrentRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCancel = (record: any) => {
    Modal.confirm({
      title: '确认取消',
      content: `确定要取消申请 "${record.applicationNo}" 吗？`,
      onOk: async () => {
        try {
          const response: any = await leaveApi.cancelApplication(record.id, '用户主动取消');
          if (response.code === 200) {
            message.success('申请已取消');
            fetchApplications(pagination.current);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || '取消失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '申请编号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
    },
    {
      title: '请假类型',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: getLeaveTypeText,
    },
    {
      title: '时间段',
      key: 'dateRange',
      render: (_: any, record: any) => `${record.startDate} 至 ${record.endDate}`,
    },
    {
      title: '天数',
      dataIndex: 'days',
      key: 'days',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {(record.status === 'pending_endorsement') && (
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
            >
              编辑
            </Button>
          )}
          {(record.status === 'pending_endorsement' || record.status === 'endorsed') && (
            <Button
              icon={<CloseCircleOutlined />}
              size="small"
              danger
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4}>我的申请</Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              placeholder="筛选状态"
            >
              <Option value="all">全部</Option>
              <Option value="pending_endorsement">待背书</Option>
              <Option value="endorsed">待HR审批</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
            <RangePicker style={{ width: 220 }} />
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => fetchApplications(page, pageSize),
          }}
        />
      </Card>

      <Modal
        title="申请详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <div style={{ padding: '20px 0' }}>
            <p><strong>申请编号：</strong>{currentRecord.applicationNo}</p>
            <p><strong>请假类型：</strong>{getLeaveTypeText(currentRecord.leaveType)}</p>
            <p><strong>开始日期：</strong>{currentRecord.startDate}</p>
            <p><strong>结束日期：</strong>{currentRecord.endDate}</p>
            <p><strong>请假天数：</strong>{currentRecord.days} 天</p>
            <p><strong>请假原因：</strong>{currentRecord.reason}</p>
            <p><strong>当前状态：</strong>{getStatusTag(currentRecord.status)}</p>
            <p><strong>提交时间：</strong>{dayjs(currentRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
