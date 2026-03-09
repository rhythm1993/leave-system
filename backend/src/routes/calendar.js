import { Router } from 'express';
import dayjs from 'dayjs';
import { LeaveApplicationDAO } from '../dao/leaveApplications.js';

const router = Router();

// Get calendar events
router.get('/events', (req, res) => {
  try {
    const { startDate, endDate, userIds } = req.query;

    // Get all approved applications
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

    // Convert to calendar event format
    const calendarEvents = applications.map((app) => ({
      id: app.id,
      title: `${app.applicant_name || 'Unknown'} - ${getLeaveTypeText(app.leave_type)}`,
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
    console.error('Failed to get calendar events:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Helper function: convert leave type
const getLeaveTypeText = (type) => {
  const types = {
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

export { router as calendarRouter };
