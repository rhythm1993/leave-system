import { Router } from 'express';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// 获取请假余额
router.get('/', (req, res) => {
  try {
    const { userId, year = new Date().getFullYear() } = req.query;

    let balances;
    if (userId) {
      // 查询指定用户的余额
      const balance = BalanceDAO.findByUserId(userId, parseInt(year));
      balances = balance ? [balance] : [];
    } else {
      // 查询所有余额
      balances = BalanceDAO.findAll({ year: parseInt(year) });
    }

    res.json({
      code: 200,
      message: 'success',
      data: balances.map(b => ({
        id: b.id,
        userId: b.user_id,
        userName: b.full_name,
        department: b.department,
        year: b.year,
        totalDays: b.total_days,
        usedDays: b.used_days,
        pendingDays: b.pending_days,
        remainingDays: b.total_days - b.used_days - b.pending_days,
      })),
    });
  } catch (error) {
    console.error('查询余额失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

// 调整余额（HR权限）
router.post('/adjust', (req, res) => {
  try {
    const { userId, year, adjustDays, reason } = req.body;
    const currentYear = year || new Date().getFullYear();

    const success = BalanceDAO.adjustTotalDays(userId, currentYear, adjustDays);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: '余额记录不存在',
      });
    }

    const updatedBalance = BalanceDAO.findByUserId(userId, currentYear);

    res.json({
      code: 200,
      message: '调整成功',
      data: {
        id: updatedBalance.id,
        userId: updatedBalance.user_id,
        year: updatedBalance.year,
        totalDays: updatedBalance.total_days,
        usedDays: updatedBalance.used_days,
        pendingDays: updatedBalance.pending_days,
        remainingDays: updatedBalance.total_days - updatedBalance.used_days - updatedBalance.pending_days,
      },
    });
  } catch (error) {
    console.error('调整余额失败:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    });
  }
});

export { router as balancesRouter };
