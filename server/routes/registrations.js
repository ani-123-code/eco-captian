import express from 'express';
import crypto from 'crypto';
import RegistrationRequest from '../models/RegistrationRequest.js';
import { protect, admin } from '../middleware/auth.js';
import { sendRegistrationConfirmation, sendCaptainCredentials } from '../services/emailService.js';

const router = express.Router();

// @route   POST /api/registrations
// @desc    Create a new registration request (public)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, locality, society, address, upi_id } = req.body;

    if (!full_name || !email || !phone || !locality) {
      return res.status(400).json({ error: 'Full name, email, phone, and locality are required' });
    }

    // Check if email already exists in registration requests
    const existingRequest = await RegistrationRequest.findOne({ email: email.toLowerCase() });
    if (existingRequest) {
      return res.status(400).json({ error: 'A registration request with this email already exists' });
    }

    // Check if email already exists as a user
    const User = (await import('../models/User.js')).default;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const request = await RegistrationRequest.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      locality: locality.trim(),
      society: society ? society.trim() : '',
      address: address ? address.trim() : '',
      upi_id: upi_id ? upi_id.trim() : '',
      status: 'Pending',
    });

    // Send confirmation email
    try {
      await sendRegistrationConfirmation(email, full_name);
    } catch (emailError) {
      console.error('Failed to send registration confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log(`✅ New registration request created: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Registration request submitted successfully! We will contact you soon.',
      id: request._id,
    });
  } catch (error) {
    console.error('Create registration request error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'A registration request with this email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/registrations
// @desc    Get all registration requests (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && ['Pending', 'Contacted', 'Approved', 'Rejected'].includes(status)) {
      query.status = status;
    }

    const requests = await RegistrationRequest.find(query)
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get registration requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/status
// @desc    Update registration request status (admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    if (!status || !['Pending', 'Contacted', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Registration request not found' });
    }

    // If status is being set to "Approved", automatically create captain account
    if (status === 'Approved' && request.status !== 'Approved') {
      const User = (await import('../models/User.js')).default;
      
      // Check if captain already exists
      const existingUser = await User.findOne({ email: request.email.toLowerCase() });
      if (existingUser) {
        console.log(`⚠️ User with email ${request.email} already exists, skipping captain creation`);
      } else {
        // Generate a random password
        const generatedPassword = crypto.randomBytes(8).toString('hex');
        
        try {
          // Create captain account
          const captain = await User.create({
            email: request.email.toLowerCase(),
            password: generatedPassword,
            full_name: request.full_name,
            locality: request.locality || '',
            society: request.society || '',
            phone: request.phone || '',
            upi_id: request.upi_id || '',
            address: request.address || '',
            role: 'captain',
            balance: 0,
          });

          console.log(`✅ Captain account created for ${request.email}`);

          // Send credentials email
          try {
            await sendCaptainCredentials(
              request.email,
              generatedPassword,
              request.full_name,
              request.locality,
              request.society
            );
            console.log(`✅ Credentials email sent to ${request.email}`);
          } catch (emailError) {
            console.error('⚠️ Failed to send credentials email:', emailError);
            // Don't fail the request if email fails
          }
        } catch (captainError) {
          console.error('❌ Error creating captain account:', captainError);
          // If it's a duplicate error, just continue (captain might have been created manually)
          if (captainError.code !== 11000) {
            return res.status(500).json({ error: 'Failed to create captain account: ' + captainError.message });
          }
        }
      }
    }

    request.status = status;
    if (admin_notes) {
      request.admin_notes = admin_notes;
    }
    await request.save();

    console.log(`✅ Registration request ${req.params.id} status updated to ${status}`);
    res.json(request);
  } catch (error) {
    console.error('Update registration request status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/registrations/:id
// @desc    Delete registration request (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const request = await RegistrationRequest.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Registration request not found' });
    }

    console.log(`✅ Registration request ${req.params.id} deleted`);
    res.json({ success: true, message: 'Registration request deleted successfully' });
  } catch (error) {
    console.error('Delete registration request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
