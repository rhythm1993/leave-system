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

  // Fetch application list
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
      message.error('Failed to get application list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending_endorsement: { color: 'processing', text: 'Pending Endorsement' },
      endorsed: { color: 'warning', text: 'Pending HR Approval' },
      pending_hr_approval: { color: 'warning', text: 'Pending HR Approval' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'error', text: 'Rejected' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getLeaveTypeText = (type: string) => {
    const types: Record<string, string> = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      marriage: 'Marriage Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave',
      compassionate: 'Compassionate Leave',
      unpaid: 'Unpaid Leave',
      other: 'Other',
    };
    return types[type] || type;
  };

  const handleViewDetail = (record: any) => {
    setCurrentRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCancel = (record: any) => {
    Modal.confirm({
      title: 'Confirm Cancellation',
      content: `Are you sure you want to cancel application "${record.applicationNo}"?`,
      onOk: async () => {
        try {
          const response: any = await leaveApi.cancelApplication(record.id, 'User initiated cancellation');
          if (response.code === 200) {
            message.success('Application cancelled');
            fetchApplications(pagination.current);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Cancellation failed');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Application No.',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
    },
    {
      title: 'Leave Type',
      dataIndex: 'leaveType',
      key: 'leaveType',
      render: getLeaveTypeText,
    },
    {
      title: 'Period',
      key: 'dateRange',
      render: (_: any, record: any) => `${record.startDate} to ${record.endDate}`,
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
    },
    {
      title: 'Submitted At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
          {(record.status === 'pending_endorsement') && (
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
            >
              Edit
            </Button>
          )}
          {(record.status === 'pending_endorsement' || record.status === 'endorsed') && (
            <Button
              icon={<CloseCircleOutlined />}
              size="small"
              danger
              onClick={() => handleCancel(record)}
            >
              Cancel
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
          <Title level={4}>My Applications</Title>
        </Col>
        <Col>
          <Space>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 160 }}
              placeholder="Filter by status"
            >
              <Option value="all">All</Option>
              <Option value="pending_endorsement">Pending Endorsement</Option>
              <Option value="endorsed">Pending HR Approval</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="cancelled">Cancelled</Option>
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
        title="Application Details"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {currentRecord && (
          <div style={{ padding: '20px 0' }}>
            <p><strong>Application No.:</strong>{currentRecord.applicationNo}</p>
            <p><strong>Leave Type:</strong>{getLeaveTypeText(currentRecord.leaveType)}</p>
            <p><strong>Start Date:</strong>{currentRecord.startDate}</p>
            <p><strong>End Date:</strong>{currentRecord.endDate}</p>
            <p><strong>Leave Days:</strong>{currentRecord.days} days</p>
            <p><strong>Reason:</strong>{currentRecord.reason}</p>
            <p><strong>Current Status:</strong>{getStatusTag(currentRecord.status)}</p>
            <p><strong>Submitted At:</strong>{dayjs(currentRecord.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
