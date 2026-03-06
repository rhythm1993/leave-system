import { Router } from 'express';
import dayjs from 'dayjs';
import { LeaveApplicationDAO } from '../dao/leaveApplications.js';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// 获取请假申请列表
router.get('/', (req, res) => {
  try {
    const { view, status, type, page = 1, size = 20 } = req.query;

    const options = {
      limit: parseInt(size),
      offset: (parseInt(page) - 1) * parseInt(size),
    };

    // 根据视图筛选
    if (view === 'my') {
      // 实际应该从token获取当前用户ID，这里简化处理
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
    console.error('获取申请列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 获取单个申请
router.get('/:id', (req, res) => {
  try {
    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
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
    console.error('获取申请详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 提交请假申请
router.post('/', (req, res) => {
  try {
    const { leaveType, startDate, endDate, days, reason, contactInfo } = req.body;
    const applicantId = 'user-001'; // 实际从token获取
    const currentYear = new Date().getFullYear();

    // 检查余额
    const balance = BalanceDAO.getOrCreate(applicantId, currentYear);
    const available = balance.total_days - balance.used_days - balance.pending_days;
    
    if (available < days) {
      return res.status(409).json({
        code: 409,
        message: `假期余额不足，剩余${available}天`,
      });
    }

    // 创建申请
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

    // 更新待审批占用
    BalanceDAO.updatePendingDays(applicantId, currentYear, days);

    res.status(201).json({
      code: 201,
      message: '申请提交成功',
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
    console.error('提交申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 取消申请
router.post('/:id/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const cancelledBy = 'user-001'; // 实际从token获取
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
      });
    }

    // 已批准的申请需要恢复余额
    if (application.status === 'approved') {
      BalanceDAO.updateUsedDays(application.applicant_id, currentYear, -application.days);
    } else {
      // 待审批的申请释放pending
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    }

    const cancelledApp = LeaveApplicationDAO.cancel(req.params.id, cancelledBy, reason);

    res.json({
      code: 200,
      message: '取消成功',
      data: {
        id: cancelledApp.id,
        status: cancelledApp.status,
      },
    });
  } catch (error) {
    console.error('取消申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// PM背书审批
router.post('/:id/endorse', (req, res) => {
  try {
    const { action, comment } = req.body;
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
      });
    }

    let newStatus;
    if (action === 'reject') {
      newStatus = 'rejected';
      // 释放pending余额
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    } else {
      newStatus = 'endorsed';
    }

    const updatedApp = LeaveApplicationDAO.updateStatus(req.params.id, newStatus);

    res.json({
      code: 200,
      message: action === 'approve' ? '背书成功' : '已拒绝',
      data: {
        id: updatedApp.id,
        status: updatedApp.status,
      },
    });
  } catch (error) {
    console.error('背书审批失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// HR审批
router.post('/:id/hr-approve', (req, res) => {
  try {
    const { action, comment } = req.body;
    const currentYear = new Date().getFullYear();

    const application = LeaveApplicationDAO.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        code: 404,
        message: '申请不存在',
      });
    }

    let newStatus;
    if (action === 'reject') {
      newStatus = 'rejected';
      // 释放pending余额
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
    } else {
      newStatus = 'approved';
      // 扣除余额：先释放pending，再增加used
      BalanceDAO.updatePendingDays(application.applicant_id, currentYear, -application.days);
      BalanceDAO.updateUsedDays(application.applicant_id, currentYear, application.days);
    }

    const updatedApp = LeaveApplicationDAO.updateStatus(req.params.id, newStatus);

    res.json({
      code: 200,
      message: action === 'approve' ? '审批通过' : '已拒绝',
      data: {
        id: updatedApp.id,
        status: updatedApp.status,
      },
    });
  } catch (error) {
    console.error('HR审批失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

export { router as leaveRouter };
