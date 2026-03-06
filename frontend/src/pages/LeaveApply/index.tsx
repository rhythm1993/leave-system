import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Radio,
  Button,
  Space,
  Typography,
  message,
  Upload,
  Row,
  Col,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { leaveApi, balanceApi } from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

export const LeaveApply: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveType, setLeaveType] = useState('annual');
  const [balance, setBalance] = useState<any>(null);

  // 获取余额
  const fetchBalance = async () => {
    try {
      const response: any = await balanceApi.getBalances();
      if (response.code === 200 && response.data.length > 0) {
        setBalance(response.data[0]);
      }
    } catch (error) {
      console.error('获取余额失败:', error);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const [startDate, endDate] = values.dateRange;
      
      const data = {
        leaveType: values.leaveType,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        days: values.days,
        reason: values.reason,
        contactInfo: values.contactInfo,
      };

      const response: any = await leaveApi.createApplication(data);
      
      if (response.code === 201) {
        message.success('请假申请提交成功！');
        form.resetFields();
        fetchBalance(); // 刷新余额
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Title level={4}>申请请假</Title>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ leaveType: 'annual' }}
            >
              <Form.Item
                name="leaveType"
                label="请假类型"
                rules={[{ required: true, message: '请选择请假类型' }]}
              >
                <Radio.Group onChange={(e) => setLeaveType(e.target.value)}>
                  <Radio.Button value="annual">年假</Radio.Button>
                  <Radio.Button value="sick">病假</Radio.Button>
                  <Radio.Button value="marriage">婚假</Radio.Button>
                  <Radio.Button value="maternity">产假</Radio.Button>
                  <Radio.Button value="paternity">陪产假</Radio.Button>
                  <Radio.Button value="compassionate">恩恤假</Radio.Button>
                  <Radio.Button value="unpaid">无薪假</Radio.Button>
                  <Radio.Button value="other">其他</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="请假时间"
                rules={[{ required: true, message: '请选择请假时间' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder={['开始日期', '结束日期']}
                  disabledDate={(current) => {
                    if (leaveType !== 'sick') {
                      return current && current < dayjs().startOf('day');
                    }
                    return false;
                  }}
                />
              </Form.Item>

              <Form.Item
                name="days"
                label="请假天数"
                rules={[{ required: true, message: '请输入请假天数' }]}
              >
                <InputNumber
                  min={0.5}
                  max={30}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="请输入天数"
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label="请假原因"
                rules={[
                  { required: true, message: '请输入请假原因' },
                  { min: 5, message: '至少输入5个字符' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细说明请假原因..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {(leaveType === 'sick' || leaveType === 'maternity' || leaveType === 'paternity') && (
                <Form.Item
                  name="attachments"
                  label="证明材料"
                  extra={`${leaveType === 'sick' ? '病假' : leaveType === 'maternity' ? '产假' : '陪产假'}需要提供相关证明材料，支持PDF、JPG、PNG格式`}
                >
                  <Upload
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxCount={3}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>上传附件</Button>
                  </Upload>
                </Form.Item>
              )}

              <Form.Item
                name="contactInfo"
                label="紧急联系人/电话"
              >
                <Input placeholder="休假期间的联系方式" />
              </Form.Item>

              <Form.Item>
                <Space size="large">
                  <Button type="primary" htmlType="submit" loading={submitting} size="large">
                    提交申请
                  </Button>
                  <Button onClick={() => form.resetFields()} size="large">
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="假期余额" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">剩余可用天数</Text>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                  {balance ? balance.remainingDays : '-'} 天
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  总额度 {balance ? balance.totalDays : '-'} 天 · 已用 {balance ? balance.usedDays : '-'} 天
                </Text>
              </div>
            </Space>
          </Card>

          <Card title="注意事项">
            <ul style={{ paddingLeft: 20, color: '#666' }}>
              <li>年假需提前3天申请</li>
              <li>病假可事后补交证明</li>
              <li>请假期间请保持通讯畅通</li>
              <li>紧急情况请联系HR</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
