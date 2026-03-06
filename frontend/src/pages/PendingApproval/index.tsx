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

  // 获取待审批列表
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // 查询待背书和待HR审批的申请
      const response1: any = await leaveApi.getApplications({ status: 'pending_endorsement' });
      const response2: any = await leaveApi.getApplications({ status: 'endorsed' });
      
      if (response1.code === 200 && response2.code === 200) {
        const list = [...response1.data.list, ...response2.data.list];
        setApplications(list);
      }
    } catch (error) {
      message.error('获取审批列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending_endorsement: { color: 'processing', text: '待背书' },
      endorsed: { color: 'warning', text: '待HR审批' },
      pending_hr_approval: { color: 'warning', text: '待HR审批' },
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
      
      // 根据状态判断是PM背书还是HR审批
      if (currentRecord.status === 'pending_endorsement') {
        response = await leaveApi.endorse(currentRecord.id, actionType, values.comment);
      } else {
        response = await leaveApi.hrApprove(currentRecord.id, actionType, values.comment);
      }

      if (response.code === 200) {
        message.success(actionType === 'approve' ? '审批通过成功' : '已拒绝该申请');
        setIsModalVisible(false);
        form.resetFields();
        fetchApplications();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '审批失败');
    }
  };

  const columns = [
    {
      title: '申请编号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
    },
    {
      title: '申请人',
      key: 'applicant',
      render: (_: any, record: any) => (
        <div>
          <div>{record.applicantName || record.applicantId}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.department}</div>
        </div>
      ),
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
      render: (date: string) => dayjs(date).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
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
            通过
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => handleReject(record)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>待我审批</Title>
      
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
        title={actionType === 'approve' ? '审批通过' : '拒绝申请'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: actionType === 'reject' }}
      >
        {currentRecord && (
          <>
            <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="申请编号">
                {currentRecord.applicationNo}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {currentRecord.applicantName || currentRecord.applicantId} ({currentRecord.department})
              </Descriptions.Item>
              <Descriptions.Item label="请假类型">
                {getLeaveTypeText(currentRecord.leaveType)}
              </Descriptions.Item>
              <Descriptions.Item label="时间段">
                {currentRecord.startDate} 至 {currentRecord.endDate}（共{currentRecord.days}天）
              </Descriptions.Item>
              <Descriptions.Item label="请假原因">
                {currentRecord.reason}
              </Descriptions.Item>
            </Descriptions>

            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item
                name="comment"
                label={actionType === 'reject' ? '拒绝原因（必填）' : '审批意见（选填）'}
                rules={[
                  {
                    required: actionType === 'reject',
                    message: '请输入拒绝原因',
                  },
                ]}
              >
                <TextArea rows={3} placeholder="请输入审批意见..." />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};
