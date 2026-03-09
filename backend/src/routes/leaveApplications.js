import { Router } from 'express';
import dayjs from 'dayjs';
import { LeaveApplicationDAO } from '../dao/leaveApplications.js';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// Get leave application list
router.get('/', (req, res) => {
  try {
    const { view, status, type, page = 1, size = 20 } = req.query;

    const options = {
      limit: parseInt(size),
      offset: (parseInt(page) - 1) * parseInt(size),
    };

    // Filter by view
    if (view === 'my') {
      // Should get current user ID from token, simplified here
      options.applicantId = 'user-001';
    }

    if (status) {
      options.status = status;
    }

    if (type) {
      options.leaveType = type;
    }

    const applications = LeaveApplicationDAO.findAll(options);
    const total = LeaveApplicationDAO.count(options);

    res.json({
      code: 200,
      message: 'success',
      data: {
        list: applications.map(app => ({
          id: app.id,
          applicationNo: app.application_no,
          applicantId: app.applicant_id,
          applicantName: app.applicant_name,
          department: app.department,
          leaveType: app.leave_type,
          startDate: app.start_date,
          endDate: app.end_date,
          days: app.days,
          reason: app.reason,
          status: app.status,
          createdAt: app.created_at,
        })),
        total,
        page: parseInt(page),
        size: parseInt(size),
      },
    });
  } catch (error) {
    console.error('Failed to get application list:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Get single application
router.get('/:id', (req, res) => {
  try {
    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: 'Application not found',
      });
    }

    res.json({
      code: 200,
      message: 'success',
      data: {
        id: application.id,
        applicationNo: application.application_no,
        applicantId: application.applicant_id,
        applicantName: application.applicant_name,
        department: application.department,
        leaveType: application.leave_type,
        startDate: application.start_date,
        endDate: application.end_date,
        days: application.days,
        reason: application.reason,
        contactInfo: application.contact_info,
        status: application.status,
        createdAt: application.created_at,
      },
    });
  } catch (error) {
    console.error('Failed to get application details:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Submit leave application
router.post('/', (req, res) => {
  try {
    const { leaveType, startDate, endDate, days, reason, contactInfo } = req.body;
    const applicantId = 'user-001'; // Should get from token in production
    const currentYear = new Date().getFullYear();

    // Check balance
    const balance = BalanceDAO.getOrCreate(applicantId, currentYear);
    const available = balance.total_days - balance.used_days - balance.pending_days;

    if (available < days) {
      return res.status(409).json({
        code: 409,
        message: `Insufficient leave balance. Remaining: ${available} days`,
      });
    }

    // Create application
    const newApplication = LeaveApplicationDAO.create({
      applicantId,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      contactInfo,
      submittedBy: applicantId,
    });

    // Update pending days
    BalanceDAO.updatePendingDays(applicantId, currentYear, days);

    res.status(201).json({
      code: 201,
      message: 'Application submitted successfully',
      data: {
        id: newApplication.id,
        applicationNo: newApplication.application_no,
        leaveType: newApplication.leave_type,
        startDate: newApplication.start_date,
        endDate: newApplication.end_date,
        days: newApplication.days,
        status: newApplication.status,
      },
    });
  } catch (error) {
    console.error('Failed to submit application:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Cancel application
router.post('/:id/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const cancelledBy = 'user-001'; // Should get from token in production
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: 'Application not found',
      });
    }

    // Restore balance for approved applications
    if (application.status === 'approved') {
      BalanceDAO.updateUsedDays(application.applicant_id, currentYear, -application.days);
    } else {
      // Release pending for non-approved applications
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    }

    const cancelledApp = LeaveApplicationDAO.cancel(req.params.id, cancelledBy, reason);

    res.json({
      code: 200,
      message: 'Cancelled successfully',
      data: {
        id: cancelledApp.id,
        status: cancelledApp.status,
      },
    });
  } catch (error) {
    console.error('Failed to cancel application:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// PM endorsement approval
router.post('/:id/endorse', (req, res) => {
  try {
    const { action, comment } = req.body;
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: 'Application not found',
      });
    }

    let newStatus;
    if (action === 'reject') {
      newStatus = 'rejected';
      // Release pending balance
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    } else {
      newStatus = 'endorsed';
    }

    const updatedApp = LeaveApplicationDAO.updateStatus(req.params.id, newStatus);

    res.json({
      code: 200,
      message: action === 'approve' ? 'Endorsed successfully' : 'Rejected',
      data: {
        id: updatedApp.id,
        status: updatedApp.status,
      },
    });
  } catch (error) {
    console.error('Endorsement failed:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// HR approval
router.post('/:id/hr-approve', (req, res) => {
  try {
    const { action, comment } = req.body;
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: 'Application not found',
      });
    }

    let newStatus;
    if (action === 'reject') {
      newStatus = 'rejected';
      // Release pending balance
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    } else {
      newStatus = 'approved';
      // Deduct balance: release pending first, then add used
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
      BalanceDAO.updateUsedDays(application.applicant_id, currentYear, application.days);
    }

    const updatedApp = LeaveApplicationDAO.updateStatus(req.params.id, newStatus);

    res.json({
      code: 200,
      message: action === 'approve' ? 'Approved successfully' : 'Rejected',
      data: {
        id: updatedApp.id,
        status: updatedApp.status,
      },
    });
  } catch (error) {
    console.error('HR approval failed:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export { router as leaveRouter };
