import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { 
      email, 
      hasPassword: !!password, 
      adminEmail: process.env.ADMIN_EMAIL,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD 
    });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });

      if (!admin) {
        // Create admin user if doesn't exist
        console.log('Creating admin user...');
        admin = await User.create({
          email: process.env.ADMIN_EMAIL,
          password: process.env.ADMIN_PASSWORD,
          full_name: 'Administrator',
          role: 'admin',
          balance: 0,
        });
        console.log('✅ Admin user created successfully');
      } else {
        // Verify password
        const isMatch = await admin.comparePassword(process.env.ADMIN_PASSWORD);
        if (!isMatch) {
          // Update password if it doesn't match
          console.log('Updating admin password...');
          admin.password = process.env.ADMIN_PASSWORD;
          await admin.save();
        }
      }

      const token = generateToken(admin._id);
      return res.json({
        token,
        user: {
          id: admin._id,
          email: admin.email,
          full_name: admin.full_name,
          role: admin.role,
          balance: admin.balance,
          locality: admin.locality || '',
          society: admin.society || '',
          upi_id: admin.upi_id || '',
          phone: admin.phone || '',
          address: admin.address || '',
        },
      });
    }

    // Regular user login
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Login failed: User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log('❌ Login failed: Password mismatch for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Login successful for:', user.email, 'Role:', user.role);
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        balance: user.balance,
        locality: user.locality || '',
        society: user.society || '',
        upi_id: user.upi_id || '',
        phone: user.phone || '',
        address: user.address || '',
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      id: user._id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      balance: user.balance,
      locality: user.locality || '',
      society: user.society || '',
      upi_id: user.upi_id || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
