import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { leaveRouter } from './routes/leaveApplications.js';
import { calendarRouter } from './routes/calendar.js';
import { balancesRouter } from './routes/balances.js';

dotenv.config();

// 初始化数据库
initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/leave-applications', leaveRouter);
app.use('/api/v1/calendar', calendarRouter);
app.use('/api/v1/balances', balancesRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
});
