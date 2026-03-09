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

  // Fetch balance
  const fetchBalance = async () => {
    try {
      const response: any = await balanceApi.getBalances();
      if (response.code === 200 && response.data.length > 0) {
        setBalance(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
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
        message.success('Leave application submitted successfully!');
        form.resetFields();
        fetchBalance(); // Refresh balance
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Title level={4}>Apply for Leave</Title>

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
                label="Leave Type"
                rules={[{ required: true, message: 'Please select leave type' }]}
              >
                <Radio.Group onChange={(e) => setLeaveType(e.target.value)}>
                  <Radio.Button value="annual">Annual Leave</Radio.Button>
                  <Radio.Button value="sick">Sick Leave</Radio.Button>
                  <Radio.Button value="marriage">Marriage Leave</Radio.Button>
                  <Radio.Button value="maternity">Maternity Leave</Radio.Button>
                  <Radio.Button value="paternity">Paternity Leave</Radio.Button>
                  <Radio.Button value="compassionate">Compassionate Leave</Radio.Button>
                  <Radio.Button value="unpaid">Unpaid Leave</Radio.Button>
                  <Radio.Button value="other">Other</Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="Leave Period"
                rules={[{ required: true, message: 'Please select leave period' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder={['Start Date', 'End Date']}
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
                label="Leave Days"
                rules={[{ required: true, message: 'Please enter leave days' }]}
              >
                <InputNumber
                  min={0.5}
                  max={30}
                  step={0.5}
                  style={{ width: '100%' }}
                  placeholder="Enter number of days"
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[
                  { required: true, message: 'Please enter reason' },
                  { min: 5, message: 'At least 5 characters required' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Please describe your leave reason in detail..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              {(leaveType === 'sick' || leaveType === 'maternity' || leaveType === 'paternity') && (
                <Form.Item
                  name="attachments"
                  label="Supporting Documents"
                  extra={`${leaveType === 'sick' ? 'Sick Leave' : leaveType === 'maternity' ? 'Maternity Leave' : 'Paternity Leave'} requires supporting documents. Supported formats: PDF, JPG, PNG`}
                >
                  <Upload
                    accept=".pdf,.jpg,.jpeg,.png"
                    maxCount={3}
                    beforeUpload={() => false}
                  >
                    <Button icon={<UploadOutlined />}>Upload Attachment</Button>
                  </Upload>
                </Form.Item>
              )}

              <Form.Item
                name="contactInfo"
                label="Emergency Contact/Phone"
              >
                <Input placeholder="Contact information during leave" />
              </Form.Item>

              <Form.Item>
                <Space size="large">
                  <Button type="primary" htmlType="submit" loading={submitting} size="large">
                    Submit Application
                  </Button>
                  <Button onClick={() => form.resetFields()} size="large">
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Leave Balance" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">Remaining Available Days</Text>
                <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                  {balance ? balance.remainingDays : '-'} days
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total: {balance ? balance.totalDays : '-'} days · Used: {balance ? balance.usedDays : '-'} days
                </Text>
              </div>
            </Space>
          </Card>

          <Card title="Notes">
            <ul style={{ paddingLeft: 20, color: '#666' }}>
              <li>Annual leave must be applied 3 days in advance</li>
              <li>Sick leave can be supplemented with proof afterwards</li>
              <li>Please keep communication open during leave</li>
              <li>Contact HR for emergencies</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
