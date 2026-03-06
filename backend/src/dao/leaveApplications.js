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
    let sql = `
      SELECT la.*, u.full_name as applicant_name, u.department
      FROM leave_applications la
      LEFT JOIN users u ON la.applicant_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (options.applicantId) {
      sql += ` AND la.applicant_id = ?`;
      params.push(options.applicantId);
    }

    if (options.status) {
      sql += ` AND la.status = ?`;
      params.push(options.status);
    }

    if (options.leaveType) {
      sql += ` AND la.leave_type = ?`;
      params.push(options.leaveType);
    }

    sql += ` ORDER BY la.created_at DESC`;

    if (options.limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(options.limit, options.offset || 0);
    }

    return db.prepare(sql).all(params);
  },

  // 统计总数
  count: (options = {}) => {
    const db = getDb();
    let sql = 'SELECT COUNT(*) as total FROM leave_applications WHERE 1=1';
    const params = [];

    if (options.applicantId) {
      sql += ` AND applicant_id = ?`;
      params.push(options.applicantId);
    }

    if (options.status) {
      sql += ` AND status = ?`;
      params.push(options.status);
    }

    const result = db.prepare(sql).get(params);
    return result.total;
  },

  // 根据ID查找
  findById: (id) => {
    const db = getDb();
    const sql = `
      SELECT la.*, u.full_name as applicant_name, u.department
      FROM leave_applications la
      LEFT JOIN users u ON la.applicant_id = u.id
      WHERE la.id = ?
    `;
    return db.prepare(sql).get(id);
  },

  // 创建申请
  create: (data) => {
    const db = getDb();
    const id = uuidv4();
    
    const sql = `
      INSERT INTO leave_applications 
      (id, application_no, applicant_id, leave_type, start_date, end_date, days, reason, contact_info, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      generateApplicationNo(),
      data.applicantId,
      data.leaveType,
      data.startDate,
      data.endDate,
      data.days,
      data.reason,
      data.contactInfo || null,
      data.submittedBy || data.applicantId,
    ];

    db.prepare(sql).run(params);
    return LeaveApplicationDAO.findById(id);
  },

  // 更新状态
  updateStatus: (id, status, additionalData = {}) => {
    const db = getDb();
    
    const allowedFields = ['status', 'cancelled_by', 'cancelled_at', 'cancel_reason'];
    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];

    updates.push(`status = ?`);
    params.push(status);

    for (const [key, value] of Object.entries(additionalData)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        params.push(value);
      }
    }

    params.push(id);
    const sql = `UPDATE leave_applications SET ${updates.join(', ')} WHERE id = ?`;
    
    db.prepare(sql).run(params);
    return LeaveApplicationDAO.findById(id);
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
