import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/profile/upi
// @desc    Update UPI ID
// @access  Private
router.put('/upi', protect, async (req, res) => {
  try {
    const { upi_id } = req.body;

    if (!upi_id || upi_id.trim() === '') {
      return res.status(400).json({ error: 'UPI ID is required' });
    }

    // Basic UPI ID validation (format: xyz@paytm, xyz@upi, etc.)
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiPattern.test(upi_id.trim())) {
      return res.status(400).json({ error: 'Invalid UPI ID format. Example: yourname@paytm' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { upi_id: upi_id.trim() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      upi_id: user.upi_id,
      locality: user.locality,
      society: user.society,
      phone: user.phone,
      address: user.address,
      balance: user.balance,
    });
  } catch (error) {
    console.error('Update UPI ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
