import express from 'express';
import Payment from '../models/Payment.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments (admin) or captain's payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show captain's own payments
    if (req.user.role !== 'admin') {
      query.captain_id = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('captain_id', 'email full_name')
      .populate('ewaste_id', 'description')
      .sort({ createdAt: -1 });

    // Normalize payment data
    const normalizedPayments = payments.map((payment) => ({
      id: payment._id || payment.id,
      captain_id: payment.captain_id?._id || payment.captain_id,
      ewaste_id: payment.ewaste_id?._id || payment.ewaste_id,
      amount: payment.amount,
      description: payment.description || `Payment for e-waste: ${payment.ewaste_id?.description || 'N/A'}`,
      status: payment.status || 'Pending',
      created_at: payment.createdAt || payment.created_at,
      updated_at: payment.updatedAt || payment.updated_at,
    }));

    res.json(normalizedPayments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
