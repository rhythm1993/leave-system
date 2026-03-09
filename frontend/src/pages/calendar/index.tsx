import React, { useState, useEffect } from 'react';
import { Card, Calendar, Badge, List, Tag, Select, Space, Typography } from 'antd';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { calendarApi } from '../../services/api';

const { Title } = Typography;
const { Option } = Select;

dayjs.extend(isBetween);

export const LeaveCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch calendar events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
      const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

      const response: any = await calendarApi.getEvents({
        startDate: startOfMonth,
        endDate: endOfMonth,
      });

      if (response.code === 200) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to get calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Get leave data for a specific day
  const getListData = (value: dayjs.Dayjs) => {
    return events.filter((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      return value.isBetween(start, end, 'day', '[]');
    });
  };

  // Date cell render
  const dateCellRender = (value: dayjs.Dayjs) => {
    let listData = getListData(value);

    // Filter
    if (filterType !== 'all') {
      listData = listData.filter(item => item.leaveType === filterType);
    }

    if (listData.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {listData.slice(0, 3).map((item) => (
          <li key={item.id} style={{ marginBottom: 2 }}>
            <Badge
              status={getLeaveTypeStatus(item.leaveType)}
              text={<span style={{ fontSize: 12 }}>{item.applicantName}</span>}
            />
          </li>
        ))}
        {listData.length > 3 && (
          <li style={{ fontSize: 12, color: '#999' }}>+{listData.length - 3} more</li>
        )}
      </ul>
    );
  };

  const getLeaveTypeStatus = (type: string) => {
    const statusMap: Record<string, any> = {
      annual: 'success',
      sick: 'error',
      marriage: 'warning',
      maternity: 'processing',
      paternity: 'default',
      compassionate: 'default',
      unpaid: 'default',
      other: 'default',
    };
    return statusMap[type] || 'default';
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      approved: { color: 'success', text: 'Approved' },
      pending_endorsement: { color: 'processing', text: 'Pending Endorsement' },
      endorsed: { color: 'warning', text: 'Pending HR Approval' },
      pending_hr_approval: { color: 'warning', text: 'Pending HR Approval' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  // Get events for selected date
  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    let list = getListData(selectedDate);
    if (filterType !== 'all') {
      list = list.filter(item => item.leaveType === filterType);
    }
    return list;
  };

  return (
    <div>
      <Title level={4}>Leave Calendar</Title>
      <Space style={{ marginBottom: 16 }}>
        <span>Filter:</span>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 160 }}
        >
          <Option value="all">All</Option>
          <Option value="annual">Annual Leave</Option>
          <Option value="sick">Sick Leave</Option>
          <Option value="marriage">Marriage Leave</Option>
          <Option value="maternity">Maternity Leave</Option>
          <Option value="paternity">Paternity Leave</Option>
          <Option value="compassionate">Compassionate Leave</Option>
          <Option value="unpaid">Unpaid Leave</Option>
          <Option value="other">Other</Option>
        </Select>
      </Space>

      <div style={{ display: 'flex', gap: 24 }}>
        <Card style={{ flex: 1 }} loading={loading}>
          <Calendar
            dateCellRender={dateCellRender}
            onSelect={(date) => setSelectedDate(date)}
            value={selectedDate || undefined}
          />
        </Card>

        <Card style={{ width: 350 }} title={selectedDate?.format('YYYY-MM-DD') || 'Select a date'}>
          <List
            dataSource={getSelectedDateEvents()}
            renderItem={(item: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: getLeaveTypeColor(item.leaveType),
                      }}
                    />
                  }
                  title={
                    <Space>
                      {item.applicantName}
                      {getStatusTag(item.status)}
                    </Space>
                  }
                  description={`${item.start} to ${item.end} · ${item.days} days`}
                />
              </List.Item>
            )}
            locale={{ emptyText: 'No leave records for this date' }}
          />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Space>
          <Badge status="success" text="Annual Leave" />
          <Badge status="error" text="Sick Leave" />
          <Badge status="warning" text="Marriage Leave" />
          <Badge status="processing" text="Maternity Leave" />
          <Badge status="default" text="Other" />
        </Space>
      </div>
    </div>
  );
};

const getLeaveTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    annual: '#52c41a',
    sick: '#ff4d4f',
    marriage: '#faad14',
    maternity: '#1890ff',
    paternity: '#722ed1',
    compassionate: '#13c2c2',
    unpaid: '#595959',
    other: '#bfbfbf',
  };
  return colors[type] || '#bfbfbf';
};
