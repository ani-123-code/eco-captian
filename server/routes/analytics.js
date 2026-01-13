import express from 'express';
import EwasteEntry from '../models/EwasteEntry.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics
// @desc    Get analytics data
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [ewasteData, paymentsData, captainsData] = await Promise.all([
      EwasteEntry.find().select('quantity status createdAt'),
      Payment.find().select('amount'),
      User.find({ role: 'captain' }).select('_id'),
    ]);

    const totalEwaste = ewasteData.length;
    const totalPayments = paymentsData.reduce((sum, p) => sum + p.amount, 0);
    const totalCaptains = captainsData.length;
    const totalWeight = ewasteData.reduce((sum, e) => sum + e.quantity, 0);

    // Status breakdown
    const statusBreakdown = ewasteData.reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdownArray = Object.entries(statusBreakdown).map(([status, count]) => ({
      status,
      count,
    }));

    // Last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const recentEntries = last7Days.map((date) => ({
      date,
      count: ewasteData.filter((e) => {
        const entryDate = new Date(e.createdAt).toISOString().split('T')[0];
        return entryDate === date;
      }).length,
    }));

    res.json({
      totalEwaste,
      totalPayments,
      totalCaptains,
      totalWeight,
      recentEntries,
      statusBreakdown: statusBreakdownArray,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
