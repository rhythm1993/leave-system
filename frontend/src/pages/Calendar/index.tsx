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

  // 获取日历事件
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
      console.error('获取日历事件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 获取某天的请假数据
  const getListData = (value: dayjs.Dayjs) => {
    return events.filter((event) => {
      const start = dayjs(event.start);
      const end = dayjs(event.end);
      return value.isBetween(start, end, 'day', '[]');
    });
  };

  // 日期单元格渲染
  const dateCellRender = (value: dayjs.Dayjs) => {
    let listData = getListData(value);
    
    // 筛选
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
          <li style={{ fontSize: 12, color: '#999' }}>+{listData.length - 3} 人</li>
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
      approved: { color: 'success', text: '已批准' },
      pending_endorsement: { color: 'processing', text: '待背书' },
      endorsed: { color: 'warning', text: '待HR审批' },
      pending_hr_approval: { color: 'warning', text: '待HR审批' },
    };
    const { color, text } = config[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  // 获取选中日期的事件
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
      <Title level={4}>请假日历</Title>
      <Space style={{ marginBottom: 16 }}>
        <span>筛选：</span>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 140 }}
        >
          <Option value="all">全部</Option>
          <Option value="annual">年假</Option>
          <Option value="sick">病假</Option>
          <Option value="marriage">婚假</Option>
          <Option value="maternity">产假</Option>
          <Option value="paternity">陪产假</Option>
          <Option value="compassionate">恩恤假</Option>
          <Option value="unpaid">无薪假</Option>
          <Option value="other">其他</Option>
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

        <Card style={{ width: 350 }} title={selectedDate?.format('YYYY年MM月DD日') || '请选择日期'}>
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
                  description={`${item.start} 至 ${item.end} · ${item.days}天`}
                />
              </List.Item>
            )}
            locale={{ emptyText: '该日期无请假记录' }}
          />
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Space>
          <Badge status="success" text="年假" />
          <Badge status="error" text="病假" />
          <Badge status="warning" text="婚假" />
          <Badge status="processing" text="产假" />
          <Badge status="default" text="其他" />
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
