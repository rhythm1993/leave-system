import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径
const DB_PATH = path.join(__dirname, '../../data/leave_system.db');

// 创建数据库连接
let db;

export const initDatabase = () => {
  try {
    db = new Database(DB_PATH);
    console.log('✅ SQLite数据库连接成功');
    
    // 启用外键约束
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // 创建表
    createTables();
    
    // 初始化默认数据
    seedDefaultData();
    
    return db;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  }
};

export const getDb = () => {
  if (!db) {
    throw new Error('数据库未初始化，请先调用initDatabase()');
  }
  return db;
};

// 创建表结构
const createTables = () => {
  // 用户表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      department TEXT,
      role TEXT NOT NULL DEFAULT 'STAFF',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 请假余额表（统一余额）
  db.exec(`
    CREATE TABLE IF NOT EXISTS leave_balances (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      year INTEGER NOT NULL,
      total_days DECIMAL(5,1) DEFAULT 20,
      used_days DECIMAL(5,1) DEFAULT 0,
      pending_days DECIMAL(5,1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, year)
    )
  `);

  // 请假申请表
  db.exec(`
    CREATE TABLE IF NOT EXISTS leave_applications (
      id TEXT PRIMARY KEY,
      application_no TEXT UNIQUE NOT NULL,
      applicant_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      days DECIMAL(4,1) NOT NULL,
      reason TEXT NOT NULL,
      contact_info TEXT,
      attachment_urls TEXT,
      status TEXT DEFAULT 'pending_endorsement',
      submitted_by TEXT,
      is_proxy_apply BOOLEAN DEFAULT 0,
      cancelled_by TEXT,
      cancelled_at DATETIME,
      cancel_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicant_id) REFERENCES users(id),
      FOREIGN KEY (submitted_by) REFERENCES users(id),
      FOREIGN KEY (cancelled_by) REFERENCES users(id)
    )
  `);

  // 审批记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS approval_logs (
      id TEXT PRIMARY KEY,
      leave_application_id TEXT NOT NULL,
      approver_id TEXT NOT NULL,
      approval_type TEXT NOT NULL,
      action TEXT NOT NULL,
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leave_application_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
      FOREIGN KEY (approver_id) REFERENCES users(id)
    )
  `);

  console.log('✅ 数据库表创建完成');
};

// 初始化默认数据
const seedDefaultData = () => {
  // 检查是否已有数据
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    console.log('🌱 初始化默认数据...');
    
    // 插入默认用户
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password_hash, full_name, email, phone, department, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const users = [
      ['user-001', 'admin', '$2a$12$hashedpassword', '系统管理员', 'admin@company.com', '13800138001', 'IT部', 'SYSTEM_ADMIN', 'active'],
      ['user-002', 'wenny', '$2a$12$hashedpassword', 'Wenny', 'wenny@company.com', '13800138002', '人力资源部', 'HR', 'active'],
      ['user-003', 'alex', '$2a$12$hashedpassword', 'Alex', 'alex@company.com', '13800138003', '研发部', 'STAFF', 'active'],
      ['user-004', 'lisa', '$2a$12$hashedpassword', 'Lisa', 'lisa@company.com', '13800138004', '研发部', 'STAFF', 'active'],
      ['user-005', 'tom', '$2a$12$hashedpassword', 'Tom', 'tom@company.com', '13800138005', '产品部', 'STAFF', 'active'],
    ];

    users.forEach(user => insertUser.run(user));

    // 初始化余额
    const insertBalance = db.prepare(`
      INSERT INTO leave_balances (id, user_id, year, total_days, used_days, pending_days)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const currentYear = new Date().getFullYear();
    const balances = [
      ['bal-001', 'user-001', currentYear, 20, 0, 0],
      ['bal-002', 'user-002', currentYear, 20, 3, 0],
      ['bal-003', 'user-003', currentYear, 20, 5, 2],
      ['bal-004', 'user-004', currentYear, 20, 2, 0],
      ['bal-005', 'user-005', currentYear, 20, 0, 0],
    ];

    balances.forEach(balance => insertBalance.run(balance));

    // 插入示例请假申请
    const insertApplication = db.prepare(`
      INSERT INTO leave_applications 
      (id, application_no, applicant_id, leave_type, start_date, end_date, days, reason, contact_info, status, submitted_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const applications = [
      ['app-001', 'LA-20260305-001', 'user-003', 'annual', '2026-03-10', '2026-03-12', 3, '回家探亲', '13800138003', 'approved', 'user-003'],
      ['app-002', 'LA-20260305-002', 'user-004', 'sick', '2026-03-06', '2026-03-07', 2, '感冒发烧', '13800138004', 'pending_endorsement', 'user-004'],
      ['app-003', 'LA-20260305-003', 'user-005', 'marriage', '2026-04-01', '2026-04-10', 10, '结婚典礼', '13800138005', 'approved', 'user-005'],
    ];

    applications.forEach(app => insertApplication.run(app));

    console.log('✅ 默认数据初始化完成');
  }
};

export default { initDatabase, getDb };
