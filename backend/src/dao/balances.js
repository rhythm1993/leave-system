import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const BalanceDAO = {
  // 获取用户余额
  findByUserId: (userId, year) => {
    const db = getDb();
    const sql = `
      SELECT lb.*, u.full_name, u.department
      FROM leave_balances lb
      LEFT JOIN users u ON lb.user_id = u.id
      WHERE lb.user_id = ? AND lb.year = ?
    `;
    return db.prepare(sql).get(userId, year);
  },

  // 获取所有余额
  findAll: (options = {}) => {
    const db = getDb();
    let sql = `
      SELECT lb.*, u.full_name, u.department
      FROM leave_balances lb
      LEFT JOIN users u ON lb.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (options.year) {
      sql += ` AND lb.year = ?`;
      params.push(options.year);
    }

    if (options.userId) {
      sql += ` AND lb.user_id = ?`;
      params.push(options.userId);
    }

    sql += ` ORDER BY lb.created_at DESC`;

    return db.prepare(sql).all(params);
  },

  // 创建余额记录
  create: (data) => {
    const db = getDb();
    const id = uuidv4();
    const currentYear = data.year || new Date().getFullYear();
    
    const sql = `
      INSERT INTO leave_balances (id, user_id, year, total_days, used_days, pending_days)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      data.userId,
      currentYear,
      data.totalDays || 20,
      data.usedDays || 0,
      data.pendingDays || 0,
    ];

    try {
      db.prepare(sql).run(params);
      return BalanceDAO.findByUserId(data.userId, currentYear);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('该用户本年度已存在余额记录');
      }
      throw error;
    }
  },

  // 更新已用天数
  updateUsedDays: (userId, year, days) => {
    const db = getDb();
    const sql = `
      UPDATE leave_balances 
      SET used_days = used_days + ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year = ?
    `;
    const result = db.prepare(sql).run(days, userId, year);
    return result.changes > 0;
  },

  // 更新待审批天数
  updatePendingDays: (userId, year, days) => {
    const db = getDb();
    const sql = `
      UPDATE leave_balances 
      SET pending_days = pending_days + ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year = ?
    `;
    const result = db.prepare(sql).run(days, userId, year);
    return result.changes > 0;
  },

  // 调整总额度
  adjustTotalDays: (userId, year, days) => {
    const db = getDb();
    const sql = `
      UPDATE leave_balances 
      SET total_days = total_days + ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND year = ?
    `;
    const result = db.prepare(sql).run(days, userId, year);
    return result.changes > 0;
  },

  // 获取或创建余额
  getOrCreate: (userId, year) => {
    let balance = BalanceDAO.findByUserId(userId, year);
    if (!balance) {
      balance = BalanceDAO.create({ userId, year });
    }
    return balance;
  },
};
