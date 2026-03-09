import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const BalanceDAO = {
  // 获取用户余额
  findByUserId: (userId, year) => {
    const db = getDb();
    const balance = db.leave_balances.find(b => b.user_id === userId && b.year === year);
    if (!balance) return null;

    const user = db.users.find(u => u.id === balance.user_id);
    return {
      ...balance,
      full_name: user?.full_name,
      department: user?.department,
    };
  },

  // 获取所有余额
  findAll: (options = {}) => {
    const db = getDb();
    let balances = db.leave_balances.map(b => {
      const user = db.users.find(u => u.id === b.user_id);
      return {
        ...b,
        full_name: user?.full_name,
        department: user?.department,
      };
    });

    if (options.year) {
      balances = balances.filter(b => b.year === options.year);
    }

    if (options.userId) {
      balances = balances.filter(b => b.user_id === options.userId);
    }

    balances.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return balances;
  },

  // 创建余额记录
  create: (data) => {
    const db = getDb();
    const id = uuidv4();
    const currentYear = data.year || new Date().getFullYear();

    const existing = db.leave_balances.find(b => b.user_id === data.userId && b.year === currentYear);
    if (existing) {
      throw new Error('该用户本年度已存在余额记录');
    }

    const newBalance = {
      id,
      user_id: data.userId,
      year: currentYear,
      total_days: data.totalDays || 20,
      used_days: data.usedDays || 0,
      pending_days: data.pendingDays || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.leave_balances.push(newBalance);

    const user = db.users.find(u => u.id === newBalance.user_id);
    return {
      ...newBalance,
      full_name: user?.full_name,
      department: user?.department,
    };
  },

  // 更新已用天数
  updateUsedDays: (userId, year, days) => {
    const db = getDb();
    const index = db.leave_balances.findIndex(b => b.user_id === userId && b.year === year);
    if (index === -1) return false;

    db.leave_balances[index].used_days += days;
    db.leave_balances[index].updated_at = new Date().toISOString();
    return true;
  },

  // 更新待审批天数
  updatePendingDays: (userId, year, days) => {
    const db = getDb();
    const index = db.leave_balances.findIndex(b => b.user_id === userId && b.year === year);
    if (index === -1) return false;

    db.leave_balances[index].pending_days += days;
    db.leave_balances[index].updated_at = new Date().toISOString();
    return true;
  },

  // 调整总额度
  adjustTotalDays: (userId, year, days) => {
    const db = getDb();
    const index = db.leave_balances.findIndex(b => b.user_id === userId && b.year === year);
    if (index === -1) return false;

    db.leave_balances[index].total_days += days;
    db.leave_balances[index].updated_at = new Date().toISOString();
    return true;
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
