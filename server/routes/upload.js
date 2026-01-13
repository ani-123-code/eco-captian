import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload, getFileUrl } from '../services/s3Service.js';
import crypto from 'crypto';
import path from 'path';

const router = express.Router();

// @route   POST /api/upload/multiple
// @desc    Upload multiple images to S3 and return CloudFront URLs
// @access  Private
router.post('/multiple', protect, (req, res, next) => {
  // Handle multer upload with error handling
  try {
    const folder = req.query.folder || 'ecocaptian';
    const maxFiles = parseInt(req.query.max || '10');
    
    const multerMiddleware = upload().array('images', maxFiles);
    multerMiddleware(req, res, (err) => {
      if (err) {
        console.error('❌ Multer upload error:', err);
        console.error('Error details:', err.message);
        return res.status(400).json({ 
          error: err.message || 'File upload failed',
          details: 'Check file size (max 10MB), file type (images only), and S3 configuration'
        });
      }
      next();
    });
  } catch (error) {
    console.error('❌ Error setting up multer:', error);
    return res.status(500).json({ error: 'File upload service error' });
  }
}, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const folder = req.query.folder || 'ecocaptian';
    const userId = req.user._id.toString();

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`📤 Uploading ${req.files.length} file(s) to folder: ${folder}`);

    const uploadedUrls = [];

    for (const file of req.files) {
      if (!file.key) {
        console.warn('⚠️ File missing key:', file.originalname);
        continue;
      }

      // Generate CloudFront URL from S3 key
      const cloudFrontUrl = getFileUrl(file.key);
      uploadedUrls.push(cloudFrontUrl);
      
      console.log(`✅ Uploaded: ${file.originalname} → ${cloudFrontUrl}`);
    }

    if (uploadedUrls.length === 0) {
      return res.status(400).json({ error: 'Failed to upload files' });
    }

    console.log(`✅ Successfully uploaded ${uploadedUrls.length} file(s)`);

    res.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Server error during upload' });
  }
});

// @route   POST /api/upload/single
// @desc    Upload single image to S3 and return CloudFront URL
// @access  Private
router.post('/single', protect, (req, res, next) => {
  try {
    const multerMiddleware = upload().single('image');
    multerMiddleware(req, res, (err) => {
      if (err) {
        console.error('❌ Multer upload error:', err);
        return res.status(400).json({ error: err.message || 'File upload failed' });
      }
      next();
    });
  } catch (error) {
    console.error('❌ Error setting up multer:', error);
    return res.status(500).json({ error: 'File upload service error' });
  }
}, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!req.file || !req.file.key) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cloudFrontUrl = getFileUrl(req.file.key);
    
    console.log(`✅ Uploaded single file: ${req.file.originalname} → ${cloudFrontUrl}`);

    res.json({
      success: true,
      url: cloudFrontUrl
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message || 'Server error during upload' });
  }
});

export default router;
