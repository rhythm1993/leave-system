import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const UserDAO = {
  // 获取所有用户
  findAll: (options = {}) => {
    const db = getDb();
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (options.keyword) {
      sql += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
      const keyword = `%${options.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    if (options.role) {
      sql += ` AND role = ?`;
      params.push(options.role);
    }

    if (options.status) {
      sql += ` AND status = ?`;
      params.push(options.status);
    }

    sql += ` ORDER BY created_at DESC`;

    if (options.limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(options.limit, options.offset || 0);
    }

    return db.prepare(sql).all(params);
  },

  // 统计总数
  count: (options = {}) => {
    const db = getDb();
    let sql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (options.keyword) {
      sql += ` AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)`;
      const keyword = `%${options.keyword}%`;
      params.push(keyword, keyword, keyword);
    }

    if (options.role) {
      sql += ` AND role = ?`;
      params.push(options.role);
    }

    const result = db.prepare(sql).get(params);
    return result.total;
  },

  // 根据ID查找用户
  findById: (id) => {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  // 根据用户名查找用户
  findByUsername: (username) => {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  // 创建用户
  create: (userData) => {
    const db = getDb();
    const id = uuidv4();
    
    const sql = `
      INSERT INTO users (id, username, password_hash, full_name, email, phone, department, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      userData.username,
      userData.passwordHash,
      userData.fullName,
      userData.email,
      userData.phone || null,
      userData.department || null,
      userData.role || 'STAFF',
      userData.status || 'active',
    ];

    db.prepare(sql).run(params);
    return UserDAO.findById(id);
  },

  // 更新用户
  update: (id, userData) => {
    const db = getDb();
    
    const allowedFields = ['full_name', 'email', 'phone', 'department', 'role', 'status'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(userData)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        params.push(value);
      }
    }

    if (updates.length === 0) return null;

    params.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.prepare(sql).run(params);
    return UserDAO.findById(id);
  },

  // 删除用户
  delete: (id) => {
    const db = getDb();
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  },

  // 更新密码
  updatePassword: (id, passwordHash) => {
    const db = getDb();
    const sql = `UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    const result = db.prepare(sql).run(passwordHash, id);
    return result.changes > 0;
  },
};
