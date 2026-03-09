import { getDb } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const UserDAO = {
  // 获取所有用户
  findAll: (options = {}) => {
    const db = getDb();
    let users = [...db.users];

    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      users = users.filter(u =>
        u.username.toLowerCase().includes(keyword) ||
        u.full_name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      );
    }

    if (options.role) {
      users = users.filter(u => u.role === options.role);
    }

    if (options.status) {
      users = users.filter(u => u.status === options.status);
    }

    users.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (options.limit) {
      const offset = options.offset || 0;
      users = users.slice(offset, offset + options.limit);
    }

    return users;
  },

  // 统计总数
  count: (options = {}) => {
    const db = getDb();
    let users = [...db.users];

    if (options.keyword) {
      const keyword = options.keyword.toLowerCase();
      users = users.filter(u =>
        u.username.toLowerCase().includes(keyword) ||
        u.full_name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      );
    }

    if (options.role) {
      users = users.filter(u => u.role === options.role);
    }

    return users.length;
  },

  // 根据ID查找用户
  findById: (id) => {
    const db = getDb();
    return db.users.find(u => u.id === id);
  },

  // 根据用户名查找用户
  findByUsername: (username) => {
    const db = getDb();
    return db.users.find(u => u.username === username);
  },

  // 创建用户
  create: (userData) => {
    const db = getDb();
    const id = uuidv4();

    const newUser = {
      id,
      username: userData.username,
      password_hash: userData.passwordHash,
      full_name: userData.fullName,
      email: userData.email,
      phone: userData.phone || null,
      department: userData.department || null,
      role: userData.role || 'STAFF',
      status: userData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    return newUser;
  },

  // 更新用户
  update: (id, userData) => {
    const db = getDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const allowedFields = {
      fullName: 'full_name',
      email: 'email',
      phone: 'phone',
      department: 'department',
      role: 'role',
      status: 'status',
    };

    for (const [key, value] of Object.entries(userData)) {
      const dbField = allowedFields[key];
      if (dbField) {
        db.users[index][dbField] = value;
      }
    }

    db.users[index].updated_at = new Date().toISOString();
    return db.users[index];
  },

  // 删除用户
  delete: (id) => {
    const db = getDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    db.users.splice(index, 1);
    return true;
  },

  // 更新密码
  updatePassword: (id, passwordHash) => {
    const db = getDb();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return false;

    db.users[index].password_hash = passwordHash;
    db.users[index].updated_at = new Date().toISOString();
    return true;
  },
};
