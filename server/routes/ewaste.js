import express from 'express';
import EwasteEntry from '../models/EwasteEntry.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';
import { getFileUrl } from '../services/s3Service.js';
import { sendEwasteStatusUpdate, sendPaymentNotification } from '../services/emailService.js';

const router = express.Router();

// Helper function to ensure photos use CloudFront URLs
const ensureCloudFrontUrls = (entry) => {
  if (!entry) {
    console.warn('⚠️ ensureCloudFrontUrls called with null/undefined entry');
    return entry;
  }
  
  // Handle both Mongoose documents and plain objects
  const entryObj = entry.toObject ? entry.toObject() : entry;
  
  if (entryObj && entryObj.photos && Array.isArray(entryObj.photos)) {
    entryObj.photos = entryObj.photos.map(url => {
      if (!url) return url;
      return getFileUrl(url);
    });
  }
  return entryObj;
};

// @route   GET /api/ewaste
// @desc    Get all e-waste entries (admin) or captain's entries
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    let query = {};
    
    // If not admin, only show captain's own entries
    if (req.user.role !== 'admin') {
      query.captain_id = req.user._id;
    }

    const entries = await EwasteEntry.find(query)
      .populate('captain_id', 'email full_name locality society upi_id phone')
      .sort({ createdAt: -1 });

    // Ensure all photo URLs use CloudFront (convert any old S3 URLs)
    const entriesWithCloudFrontUrls = entries.map(entry => {
      try {
        return ensureCloudFrontUrls(entry);
      } catch (error) {
        console.error('Error processing entry for CloudFront URLs:', error);
        return entry.toObject ? entry.toObject() : entry;
      }
    });

    res.json(entriesWithCloudFrontUrls);
  } catch (error) {
    console.error('Get ewaste entries error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   POST /api/ewaste
// @desc    Create new e-waste entry (with CloudFront URLs)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log('📝 Create e-waste request received');
    console.log('User:', req.user?.email, req.user?.role);

    const { description, quantity, location_address, google_location_link, photos } = req.body;

    console.log('Request body:', { description, quantity, location_address, photosCount: photos?.length || 0 });

    if (!description || !quantity) {
      console.log('❌ Missing required fields:', { 
        hasDescription: !!description, 
        hasQuantity: !!quantity,
        description: description || 'MISSING',
        quantity: quantity || 'MISSING'
      });
      return res.status(400).json({ 
        error: 'Description and quantity are required',
        received: {
          description: description || null,
          quantity: quantity || null
        }
      });
    }

    // Validate photos (CloudFront URLs)
    let photoUrls = [];
    if (photos && Array.isArray(photos)) {
      // Filter and validate CloudFront URLs
      photoUrls = photos
        .filter(url => url && typeof url === 'string' && url.trim() !== '')
        .slice(0, 3); // Max 3 photos
      
      console.log('✅ Photo URLs received (CloudFront):', photoUrls.length);
      photoUrls.forEach((url, index) => {
        console.log(`   Photo ${index + 1}: ${url}`);
      });
    }

    if (photoUrls.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 photos allowed' });
    }

    console.log('Creating e-waste entry in database with CloudFront URLs...');
    const entry = await EwasteEntry.create({
      captain_id: req.user._id,
      description: description.trim(),
      quantity: parseFloat(quantity),
      location_address: location_address ? location_address.trim() : null,
      google_location_link: google_location_link ? google_location_link.trim() : null,
      photos: photoUrls, // CloudFront URLs from upload API
      status: 'Pending',
    });

    const populatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(populatedEntry);

    console.log('✅ E-waste entry created successfully:', entry._id);
    console.log('Entry details:', { 
      id: entry._id, 
      captain: populatedEntry.captain_id?.email,
      photos: photoUrls.length,
      photoUrls: entryWithCloudFront.photos
    });
    res.status(201).json(entryWithCloudFront);
  } catch (error) {
    console.error('Create ewaste entry error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// @route   PUT /api/ewaste/:id/price
// @desc    Update e-waste entry price (creates pending payment record)
// @access  Private/Admin
router.put('/:id/price', protect, admin, async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || isNaN(price)) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const entry = await EwasteEntry.findById(req.params.id)
      .populate('captain_id', 'email full_name');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const priceAmount = parseFloat(price);
    const oldPrice = entry.price;

    entry.price = priceAmount;
    entry.status = 'Priced';
    await entry.save();

    // Create or update payment record for this price
    const Payment = (await import('../models/Payment.js')).default;
    
    // Check if payment record already exists for this entry
    let payment = await Payment.findOne({ ewaste_id: entry._id });
    
    if (payment) {
      // Update existing payment record
      payment.amount = priceAmount;
      payment.description = `Payment for e-waste: ${entry.description}`;
      payment.status = 'Pending'; // Reset to pending if price changed
      await payment.save();
      console.log(`✅ Updated payment record for entry ${entry._id}: ₹${priceAmount}`);
    } else {
      // Create new payment record (pending, doesn't update balance yet)
      payment = await Payment.create({
        captain_id: entry.captain_id._id,
        ewaste_id: entry._id,
        amount: priceAmount,
        description: `Payment for e-waste: ${entry.description}`,
        status: 'Pending',
      });
      console.log(`✅ Created pending payment record for entry ${entry._id}: ₹${priceAmount}`);
    }

    // Send email notification
    try {
      await sendEwasteStatusUpdate(
        entry.captain_id.email,
        entry.captain_id.full_name,
        entry.description,
        'Priced',
        { price: priceAmount }
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    const updatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society upi_id phone balance');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(updatedEntry);

    res.json(entryWithCloudFront);
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ewaste/:id/status
// @desc    Update e-waste status
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    const validStatuses = ['Pending', 'Reviewed', 'Priced', 'Collection Planned', 'Pickup Scheduled', 'Collected', 'Processed', 'Payment Initiated', 'Paid'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const entry = await EwasteEntry.findById(req.params.id)
      .populate('captain_id', 'email full_name balance');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Special handling for "Paid" status - process payment
    if (status === 'Paid') {
      // Check if payment amount is set
      if (!entry.price && !entry.payment_amount) {
        return res.status(400).json({ error: 'Price must be set before marking as paid. Please set the price first.' });
      }

      const paymentAmount = entry.payment_amount || entry.price;
      
      // Update entry
      entry.status = 'Paid';
      entry.payment_amount = paymentAmount;
      entry.payment_status = 'Completed';
      if (admin_notes) {
        entry.admin_notes = admin_notes;
      }
      await entry.save();

      // Update or create payment record and mark as completed
      const Payment = (await import('../models/Payment.js')).default;
      const User = (await import('../models/User.js')).default;
      
      // Find existing payment record (created when price was set)
      let payment = await Payment.findOne({ ewaste_id: entry._id });
      
      if (payment) {
        // Update existing payment record to completed
        const oldStatus = payment.status;
        payment.amount = paymentAmount;
        payment.status = 'Completed';
        payment.description = `Payment for e-waste: ${entry.description}`;
        await payment.save();
        
        // If it wasn't completed before, update balance now
        if (oldStatus !== 'Completed') {
          await User.findByIdAndUpdate(entry.captain_id._id, {
            $inc: { balance: paymentAmount },
          });
          console.log(`✅ Updated captain balance from status update: +₹${paymentAmount}`);
        }
        console.log(`✅ Updated payment record to Completed for entry ${entry._id}: ₹${paymentAmount}`);
      } else {
        // Create new payment record
        payment = await Payment.create({
          captain_id: entry.captain_id._id,
          ewaste_id: entry._id,
          amount: paymentAmount,
          description: `Payment for e-waste: ${entry.description}`,
          status: 'Completed',
        });
        
        // Update balance manually
        await User.findByIdAndUpdate(entry.captain_id._id, {
          $inc: { balance: paymentAmount },
        });
        console.log(`✅ Created completed payment record and updated balance for entry ${entry._id}: ₹${paymentAmount}`);
      }

      // Send payment notification email
      try {
        const { sendPaymentNotification } = await import('../services/emailService.js');
        await sendPaymentNotification(
          entry.captain_id.email,
          entry.captain_id.full_name,
          paymentAmount,
          `Payment for e-waste: ${entry.description}`
        );
      } catch (emailError) {
        console.error('Failed to send payment notification email:', emailError);
      }

      // Refresh captain to get updated balance
      const updatedCaptain = await User.findById(entry.captain_id._id);

      const updatedEntry = await EwasteEntry.findById(entry._id)
        .populate('captain_id', 'email full_name locality society upi_id phone balance');

      // Ensure photos use CloudFront URLs
      const entryWithCloudFront = ensureCloudFrontUrls(updatedEntry);

      console.log(`✅ Status updated to Paid for entry ${entry._id}, balance updated: ₹${updatedCaptain.balance}`);
      return res.json(entryWithCloudFront);
    }

    // For other statuses, just update normally
    entry.status = status;
    if (admin_notes) {
      entry.admin_notes = admin_notes;
    }
    await entry.save();

    // Send email notification
    try {
      await sendEwasteStatusUpdate(
        entry.captain_id.email,
        entry.captain_id.full_name,
        entry.description,
        status,
        {
          price: entry.price,
          collectionDate: entry.collection_plan?.collection_date,
          pickupDate: entry.pickup_date,
          paymentAmount: entry.payment_amount,
          notes: admin_notes,
        }
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    const updatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society upi_id phone balance');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(updatedEntry);

    res.json(entryWithCloudFront);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ewaste/:id/collection-plan
// @desc    Plan collection
// @access  Private/Admin
router.put('/:id/collection-plan', protect, admin, async (req, res) => {
  try {
    const { collection_date, collection_time, collection_notes, collection_steps } = req.body;

    if (!collection_date) {
      return res.status(400).json({ error: 'Collection date is required' });
    }

    const entry = await EwasteEntry.findById(req.params.id)
      .populate('captain_id', 'email full_name');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entry.collection_plan = {
      collection_date: new Date(collection_date),
      collection_time: collection_time || null,
      collection_notes: collection_notes || null,
      collection_steps: collection_steps || [],
    };
    entry.status = 'Collection Planned';
    await entry.save();

    // Send email notification
    try {
      await sendEwasteStatusUpdate(
        entry.captain_id.email,
        entry.captain_id.full_name,
        entry.description,
        'Collection Planned',
        {
          collectionDate: collection_date,
          collectionTime: collection_time,
          notes: collection_notes,
        }
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    const updatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society upi_id phone');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(updatedEntry);

    res.json(entryWithCloudFront);
  } catch (error) {
    console.error('Plan collection error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ewaste/:id/pickup
// @desc    Schedule pickup
// @access  Private/Admin
router.put('/:id/pickup', protect, admin, async (req, res) => {
  try {
    const { pickup_date, pickup_notes } = req.body;

    if (!pickup_date) {
      return res.status(400).json({ error: 'Pickup date is required' });
    }

    const entry = await EwasteEntry.findById(req.params.id)
      .populate('captain_id', 'email full_name');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    entry.pickup_date = new Date(pickup_date);
    entry.pickup_notes = pickup_notes || null;
    entry.status = 'Pickup Scheduled';
    await entry.save();

    // Send email notification
    try {
      await sendEwasteStatusUpdate(
        entry.captain_id.email,
        entry.captain_id.full_name,
        entry.description,
        'Pickup Scheduled',
        {
          pickupDate: pickup_date,
          notes: pickup_notes,
        }
      );
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
    }

    const updatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society upi_id phone');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(updatedEntry);

    res.json(entryWithCloudFront);
  } catch (error) {
    console.error('Schedule pickup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/ewaste/:id/payment
// @desc    Process payment (marks as paid and updates captain balance)
// @access  Private/Admin
router.put('/:id/payment', protect, admin, async (req, res) => {
  try {
    const { payment_amount, mark_as_processing } = req.body;

    const entry = await EwasteEntry.findById(req.params.id)
      .populate('captain_id', 'email full_name balance');

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // If mark_as_processing is true, just update status to "Payment Initiated"
    if (mark_as_processing) {
      entry.status = 'Payment Initiated';
      entry.payment_status = 'Initiated';
      if (payment_amount && !isNaN(payment_amount)) {
        entry.payment_amount = parseFloat(payment_amount);
      }
      await entry.save();

      // Update payment record status to "Processing"
      const Payment = (await import('../models/Payment.js')).default;
      const payment = await Payment.findOne({ ewaste_id: entry._id });
      if (payment) {
        payment.status = 'Processing';
        if (payment_amount && !isNaN(payment_amount)) {
          payment.amount = parseFloat(payment_amount);
        }
        await payment.save();
        console.log(`✅ Updated payment record to Processing for entry ${entry._id}`);
      }

      const populatedEntry = await EwasteEntry.findById(entry._id)
        .populate('captain_id', 'email full_name locality society upi_id phone balance');

      const entryWithCloudFront = ensureCloudFrontUrls(populatedEntry);
      return res.json(entryWithCloudFront);
    }

    // Otherwise, process the actual payment
    if (!payment_amount || isNaN(payment_amount)) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const paymentAmount = parseFloat(payment_amount);

    // Update entry
    entry.payment_amount = paymentAmount;
    entry.payment_status = 'Completed';
    entry.status = 'Paid';
    await entry.save();

    // Update or create payment record and mark as completed
    const Payment = (await import('../models/Payment.js')).default;
    const User = (await import('../models/User.js')).default;
    
    // Find existing payment record (created when price was set)
    let payment = await Payment.findOne({ ewaste_id: entry._id });
    
    if (payment) {
      // Update existing payment record to completed
      const oldStatus = payment.status;
      payment.amount = paymentAmount;
      payment.status = 'Completed';
      payment.description = `Payment for e-waste: ${entry.description}`;
      await payment.save();
      
      // If it wasn't completed before, update balance now
      if (oldStatus !== 'Completed') {
        await User.findByIdAndUpdate(entry.captain_id._id, {
          $inc: { balance: paymentAmount },
        });
        console.log(`✅ Updated captain balance: +₹${paymentAmount}`);
      }
      console.log(`✅ Updated payment record to Completed for entry ${entry._id}: ₹${paymentAmount}`);
    } else {
      // Create new payment record (shouldn't happen, but handle it)
      payment = await Payment.create({
        captain_id: entry.captain_id._id,
        ewaste_id: entry._id,
        amount: paymentAmount,
        description: `Payment for e-waste: ${entry.description}`,
        status: 'Completed',
      });
      
      // Update balance manually
      await User.findByIdAndUpdate(entry.captain_id._id, {
        $inc: { balance: paymentAmount },
      });
      console.log(`✅ Created completed payment record and updated balance for entry ${entry._id}: ₹${paymentAmount}`);
    }

    // Refresh captain to get updated balance
    const updatedCaptain = await User.findById(entry.captain_id._id);

    // Send payment notification email
    try {
      await sendPaymentNotification(
        entry.captain_id.email,
        entry.captain_id.full_name,
        paymentAmount,
        `Payment for e-waste: ${entry.description}`
      );
    } catch (emailError) {
      console.error('Failed to send payment notification email:', emailError);
    }

    const populatedEntry = await EwasteEntry.findById(entry._id)
      .populate('captain_id', 'email full_name locality society upi_id phone balance');

    // Ensure photos use CloudFront URLs
    const entryWithCloudFront = ensureCloudFrontUrls(populatedEntry);

    console.log(`✅ Payment processed: ₹${paymentAmount} for entry ${entry._id}`);
    console.log(`   Captain balance updated: ₹${updatedCaptain.balance}`);

    res.json(entryWithCloudFront);
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/ewaste/:id
// @desc    Delete e-waste entry (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const entry = await EwasteEntry.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ error: 'E-waste entry not found' });
    }

    await EwasteEntry.findByIdAndDelete(req.params.id);

    console.log(`✅ E-waste entry ${req.params.id} deleted`);
    res.json({ success: true, message: 'E-waste entry deleted successfully' });
  } catch (error) {
    console.error('Delete ewaste entry error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
