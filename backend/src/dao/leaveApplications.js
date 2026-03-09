import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

// 生成申请编号
const generateApplicationNo = () => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LA-${date}-${random}`;
};

export const LeaveApplicationDAO = {
  // 获取所有申请
  findAll: (options = {}) => {
    const db = getDb();
    let applications = db.leave_applications.map(app => {
      const user = db.users.find(u => u.id === app.applicant_id);
      return {
        ...app,
        applicant_name: user?.full_name,
        department: user?.department,
      };
    });

    if (options.applicantId) {
      applications = applications.filter(a => a.applicant_id === options.applicantId);
    }

    if (options.status) {
      applications = applications.filter(a => a.status === options.status);
    }

    if (options.leaveType) {
      applications = applications.filter(a => a.leave_type === options.leaveType);
    }

    applications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (options.limit) {
      const offset = options.offset || 0;
      applications = applications.slice(offset, offset + options.limit);
    }

    return applications;
  },

  // 统计总数
  count: (options = {}) => {
    const db = getDb();
    let applications = [...db.leave_applications];

    if (options.applicantId) {
      applications = applications.filter(a => a.applicant_id === options.applicantId);
    }

    if (options.status) {
      applications = applications.filter(a => a.status === options.status);
    }

    return applications.length;
  },

  // 根据ID查找
  findById: (id) => {
    const db = getDb();
    const app = db.leave_applications.find(a => a.id === id);
    if (!app) return null;

    const user = db.users.find(u => u.id === app.applicant_id);
    return {
      ...app,
      applicant_name: user?.full_name,
      department: user?.department,
    };
  },

  // 创建申请
  create: (data) => {
    const db = getDb();
    const id = uuidv4();

    const newApp = {
      id,
      application_no: generateApplicationNo(),
      applicant_id: data.applicantId,
      leave_type: data.leaveType,
      start_date: data.startDate,
      end_date: data.endDate,
      days: data.days,
      reason: data.reason,
      contact_info: data.contactInfo || null,
      attachment_urls: null,
      status: 'pending_endorsement',
      submitted_by: data.submittedBy || data.applicantId,
      is_proxy_apply: false,
      cancelled_by: null,
      cancelled_at: null,
      cancel_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.leave_applications.push(newApp);

    const user = db.users.find(u => u.id === newApp.applicant_id);
    return {
      ...newApp,
      applicant_name: user?.full_name,
      department: user?.department,
    };
  },

  // 更新状态
  updateStatus: (id, status, additionalData = {}) => {
    const db = getDb();
    const index = db.leave_applications.findIndex(a => a.id === id);
    if (index === -1) return null;

    db.leave_applications[index].status = status;
    db.leave_applications[index].updated_at = new Date().toISOString();

    if (additionalData.cancelledBy !== undefined) {
      db.leave_applications[index].cancelled_by = additionalData.cancelledBy;
    }
    if (additionalData.cancelledAt !== undefined) {
      db.leave_applications[index].cancelled_at = additionalData.cancelledAt;
    }
    if (additionalData.cancelReason !== undefined) {
      db.leave_applications[index].cancel_reason = additionalData.cancelReason;
    }

    const user = db.users.find(u => u.id === db.leave_applications[index].applicant_id);
    return {
      ...db.leave_applications[index],
      applicant_name: user?.full_name,
      department: user?.department,
    };
  },

  // 取消申请
  cancel: (id, cancelledBy, reason) => {
    return LeaveApplicationDAO.updateStatus(id, 'cancelled', {
      cancelledBy,
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    });
  },
};
