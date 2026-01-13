import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import { sendCaptainCredentials } from '../services/emailService.js';

const router = express.Router();

// @route   GET /api/captains
// @desc    Get all captains
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const captains = await User.find({ role: 'captain' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(captains);
  } catch (error) {
    console.error('Get captains error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   POST /api/captains
// @desc    Create new captain
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    console.log('📝 Create captain request received');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User making request:', req.user?.email, req.user?.role);
    
    const { email, password, full_name, locality, society, phone, upi_id, address } = req.body;

    if (!email || !password || !full_name) {
      console.log('❌ Missing required fields:', { hasEmail: !!email, hasPassword: !!password, hasFullName: !!full_name });
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short:', password.length);
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create captain
    console.log('Creating captain in database...');
    const captain = await User.create({
      email: email.toLowerCase(),
      password,
      full_name,
      locality: locality || '',
      society: society || '',
      phone: phone || '',
      upi_id: upi_id || '',
      address: address || '',
      role: 'captain',
      balance: 0,
    });

    console.log('✅ Captain created successfully:', captain.email);

    // Send credentials email
    try {
      await sendCaptainCredentials(email, password, full_name, locality, society);
      console.log('✅ Credentials email sent');
    } catch (emailError) {
      console.error('⚠️ Failed to send credentials email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({
      id: captain._id,
      email: captain.email,
      full_name: captain.full_name,
      locality: captain.locality,
      society: captain.society,
      phone: captain.phone,
      upi_id: captain.upi_id,
      address: captain.address,
      role: captain.role,
      balance: captain.balance,
    });
  } catch (error) {
    console.error('❌ Create captain error:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   PUT /api/captains/:id
// @desc    Update captain
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { full_name, locality, society, phone, upi_id, address, password } = req.body;
    const captain = await User.findById(req.params.id);

    if (!captain) {
      return res.status(404).json({ error: 'Captain not found' });
    }

    if (captain.role !== 'captain') {
      return res.status(400).json({ error: 'User is not a captain' });
    }

    // Update fields
    if (full_name !== undefined) captain.full_name = full_name;
    if (locality !== undefined) captain.locality = locality || '';
    if (society !== undefined) captain.society = society || '';
    if (phone !== undefined) captain.phone = phone || '';
    if (upi_id !== undefined) captain.upi_id = upi_id || '';
    if (address !== undefined) captain.address = address || '';
    
    // Only update password if provided
    if (password && password.trim() !== '') {
      captain.password = password;
    }

    await captain.save();

    res.json({
      id: captain._id,
      email: captain.email,
      full_name: captain.full_name,
      locality: captain.locality,
      society: captain.society,
      phone: captain.phone,
      upi_id: captain.upi_id,
      address: captain.address,
      role: captain.role,
      balance: captain.balance,
    });
  } catch (error) {
    console.error('Update captain error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/captains/:id
// @desc    Delete captain
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const captain = await User.findById(req.params.id);

    if (!captain) {
      return res.status(404).json({ error: 'Captain not found' });
    }

    if (captain.role !== 'captain') {
      return res.status(400).json({ error: 'User is not a captain' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Captain deleted successfully' });
  } catch (error) {
    console.error('Delete captain error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
