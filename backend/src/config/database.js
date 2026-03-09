// In-memory database implementation for demo
// For production, consider using better-sqlite3 or sqlite3

// In-memory data storage
const memoryDb = {
  users: [],
  leave_balances: [],
  leave_applications: [],
  approval_logs: []
};

// Initialization flag
let isInitialized = false;

export const initDatabase = () => {
  if (isInitialized) {
    console.log('✅ Database already initialized');
    return memoryDb;
  }

  try {
    console.log('🔄 Initializing in-memory database...');

    // Initialize default users (password: password123)
    // bcrypt hash for "password123" with salt rounds 10
    const passwordHash = '$2a$10$RL5h.nH8uV0toSRjzVPoTOhyCkkbAd2cLeXzUn2nlbHgblOfbo.q2';
    memoryDb.users = [
      { id: 'user-001', username: 'admin', password_hash: passwordHash, full_name: 'System Administrator', email: 'admin@company.com', phone: '13800138001', department: 'IT Department', role: 'SYSTEM_ADMIN', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'user-002', username: 'wenny', password_hash: passwordHash, full_name: 'Wenny', email: 'wenny@company.com', phone: '13800138002', department: 'Human Resources', role: 'HR', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'user-003', username: 'alex', password_hash: passwordHash, full_name: 'Alex', email: 'alex@company.com', phone: '13800138003', department: 'R&D Department', role: 'STAFF', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'user-004', username: 'lisa', password_hash: passwordHash, full_name: 'Lisa', email: 'lisa@company.com', phone: '13800138004', department: 'R&D Department', role: 'STAFF', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'user-005', username: 'tom', password_hash: passwordHash, full_name: 'Tom', email: 'tom@company.com', phone: '13800138005', department: 'Product Department', role: 'STAFF', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    // Initialize balances
    const currentYear = new Date().getFullYear();
    memoryDb.leave_balances = [
      { id: 'bal-001', user_id: 'user-001', year: currentYear, total_days: 20, used_days: 0, pending_days: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'bal-002', user_id: 'user-002', year: currentYear, total_days: 20, used_days: 3, pending_days: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'bal-003', user_id: 'user-003', year: currentYear, total_days: 20, used_days: 5, pending_days: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'bal-004', user_id: 'user-004', year: currentYear, total_days: 20, used_days: 2, pending_days: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'bal-005', user_id: 'user-005', year: currentYear, total_days: 20, used_days: 0, pending_days: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    // Initialize leave applications
    memoryDb.leave_applications = [
      { id: 'app-001', application_no: 'LA-20260305-001', applicant_id: 'user-003', leave_type: 'annual', start_date: '2026-03-10', end_date: '2026-03-12', days: 3, reason: 'Visiting family', contact_info: '13800138003', attachment_urls: null, status: 'approved', submitted_by: 'user-003', is_proxy_apply: false, cancelled_by: null, cancelled_at: null, cancel_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'app-002', application_no: 'LA-20260305-002', applicant_id: 'user-004', leave_type: 'sick', start_date: '2026-03-06', end_date: '2026-03-07', days: 2, reason: 'Cold and fever', contact_info: '13800138004', attachment_urls: null, status: 'pending_endorsement', submitted_by: 'user-004', is_proxy_apply: false, cancelled_by: null, cancelled_at: null, cancel_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'app-003', application_no: 'LA-20260305-003', applicant_id: 'user-005', leave_type: 'marriage', start_date: '2026-04-01', end_date: '2026-04-10', days: 10, reason: 'Wedding ceremony', contact_info: '13800138005', attachment_urls: null, status: 'approved', submitted_by: 'user-005', is_proxy_apply: false, cancelled_by: null, cancelled_at: null, cancel_reason: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    memoryDb.approval_logs = [];

    isInitialized = true;
    console.log('✅ In-memory database initialized successfully');
    console.log(`   - Users: ${memoryDb.users.length}`);
    console.log(`   - Balances: ${memoryDb.leave_balances.length}`);
    console.log(`   - Applications: ${memoryDb.leave_applications.length}`);

    return memoryDb;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const getDb = () => {
  if (!isInitialized) {
    throw new Error('Database not initialized. Please call initDatabase() first.');
  }
  return memoryDb;
};

export default { initDatabase, getDb };
