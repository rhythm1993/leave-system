import { Router } from 'express';
import dayjs from 'dayjs';
import { LeaveApplicationDAO } from '../dao/leaveApplications.js';

const router = Router();

// 获取日历事件
router.get('/events', (req, res) => {
  try {
    const { startDate, endDate, userIds } = req.query;

    // 获取所有已批准的申请
    let applications = LeaveApplicationDAO.findAll({ status: 'approved' });

    if (startDate && endDate) {
      const start = dayjs(String(startDate));
      const end = dayjs(String(endDate));
      
      applications = applications.filter((app) => {
        const appStart = dayjs(app.start_date);
        const appEnd = dayjs(app.end_date);
        return (
          (appStart.isAfter(start) || appStart.isSame(start)) &&
          (appStart.isBefore(end) || appStart.isSame(end))
        ) || (
          (appEnd.isAfter(start) || appEnd.isSame(start)) &&
          (appEnd.isBefore(end) || appEnd.isSame(end))
        ) || (
          appStart.isBefore(start) && appEnd.isAfter(end)
        );
      });
    }

    if (userIds) {
      const ids = String(userIds).split(',');
      applications = applications.filter((app) => ids.includes(app.applicant_id));
    }

    // 转换为日历事件格式
    const calendarEvents = applications.map((app) => ({
      id: app.id,
      title: `${app.applicant_name || '未知'} - ${getLeaveTypeText(app.leave_type)}`,
      start: app.start_date,
      end: app.end_date,
      days: app.days,
      applicantId: app.applicant_id,
      applicantName: app.applicant_name,
      leaveType: app.leave_type,
      status: app.status,
    }));

    res.json({
      code: 200,
      message: 'success',
      data: calendarEvents,
    });
  } catch (error) {
    console.error('获取日历事件失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 辅助函数：转换请假类型
const getLeaveTypeText = (type) => {
  const types = {
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

export { router as calendarRouter };
