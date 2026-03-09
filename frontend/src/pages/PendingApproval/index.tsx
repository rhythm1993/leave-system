import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Descriptions,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { leaveApi } from '../../services/api';

const { Title } = Typography;
const { TextArea } = Input;

export const PendingApproval: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();

  // Fetch pending approval list
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Query pending endorsement and pending HR approval applications
      const response1: any = await leaveApi.getApplications({ status: 'pending_endorsement' });
      const response2: any = await leaveApi.getApplications({ status: 'endorsed' });

      if (response1.code === 200 && response2.code === 200) {
        const list = [...response1.data.list, ...response2.data.list];
        setApplications(list);
      }
    } catch (error) {
      message.error('Failed to get approval list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending_endorsement: { color: 'processing', text: 'Pending Endorsement' },
      endorsed: { color: 'warning', text: 'Pending HR Approval' },
      pending_hr_approval: { color: 'warning', text: 'Pending HR Approval' },
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

  const handleApprove = (record: any) => {
    setCurrentRecord(record);
    setActionType('approve');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleReject = (record: any) => {
    setCurrentRecord(record);
    setActionType('reject');
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    if (!currentRecord) return;

    try {
      let response;

      // Determine if PM endorsement or HR approval based on status
      if (currentRecord.status === 'pending_endorsement') {
        response = await leaveApi.endorse(currentRecord.id, actionType, values.comment);
      } else {
        response = await leaveApi.hrApprove(currentRecord.id, actionType, values.comment);
      }

      if (response.code === 200) {
        message.success(actionType === 'approve' ? 'Approved successfully' : 'Application rejected');
        setIsModalVisible(false);
        form.resetFields();
        fetchApplications();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Approval failed');
    }
  };

  const columns = [
    {
      title: 'Application No.',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
    },
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_: any, record: any) => (
        <div>
          <div>{record.applicantName || record.applicantId}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.department}</div>
        </div>
      ),
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
      render: (date: string) => dayjs(date).format('MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            size="small"
            onClick={() => handleApprove(record)}
          >
            Approve
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => handleReject(record)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Pending My Approval</Title>

      <Card>
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="Confirm"
        cancelText="Cancel"
        okButtonProps={{ danger: actionType === 'reject' }}
      >
        {currentRecord && (
          <>
            <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Application No.">
                {currentRecord.applicationNo}
              </Descriptions.Item>
              <Descriptions.Item label="Applicant">
                {currentRecord.applicantName || currentRecord.applicantId} ({currentRecord.department})
              </Descriptions.Item>
              <Descriptions.Item label="Leave Type">
                {getLeaveTypeText(currentRecord.leaveType)}
              </Descriptions.Item>
              <Descriptions.Item label="Period">
                {currentRecord.startDate} to {currentRecord.endDate} ({currentRecord.days} days)
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {currentRecord.reason}
              </Descriptions.Item>
            </Descriptions>

            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="comment"
                label={actionType === 'reject' ? 'Rejection Reason (Required)' : 'Approval Comment (Optional)'}
                rules={[
                  {
                    required: actionType === 'reject',
                    message: 'Please enter rejection reason',
                  },
                ]}
              >
                <TextArea rows={3} placeholder="Enter approval comment..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};
