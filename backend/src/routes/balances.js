import { Router } from 'express';
import { BalanceDAO } from '../dao/balances.js';

const router = Router();

// Get leave balances
router.get('/', (req, res) => {
  try {
    const { userId, year = new Date().getFullYear() } = req.query;

    let balances;
    if (userId) {
      // Query specific user's balance
      const balance = BalanceDAO.findByUserId(userId, parseInt(year));
      balances = balance ? [balance] : [];
    } else {
      // Query all balances
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
    console.error('Failed to query balance:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

// Adjust balance (HR permission)
router.post('/adjust', (req, res) => {
  try {
    const { userId, year, adjustDays, reason } = req.body;
    const currentYear = year || new Date().getFullYear();

    const success = BalanceDAO.adjustTotalDays(userId, currentYear, adjustDays);

    if (!success) {
      return res.status(404).json({
        code: 404,
        message: 'Balance record not found',
      });
    }

    const updatedBalance = BalanceDAO.findByUserId(userId, currentYear);

    res.json({
      code: 200,
      message: 'Adjusted successfully',
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
    console.error('Failed to adjust balance:', error);
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  }
});

export { router as balancesRouter };
