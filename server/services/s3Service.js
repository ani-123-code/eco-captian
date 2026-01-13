import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import crypto from 'crypto';

let s3Instance = null;
let uploadInstance = null;

// Initialize AWS S3
const getS3 = () => {
  if (!s3Instance) {
    try {
      // Configure AWS SDK
      const s3Config = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION || 'us-east-1',
      };

      if (!s3Config.accessKeyId || !s3Config.secretAccessKey) {
        throw new Error('AWS credentials are missing. Please check your .env file.');
      }

      // Configure AWS SDK v2 properly for multer-s3 v2
      // Pass credentials directly to S3 constructor (better for multer-s3 v2)
      s3Instance = new AWS.S3({
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
        region: s3Config.region,
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
      });
      
      console.log('✅ AWS S3 initialized successfully');
      console.log('   CloudFront Domain:', process.env.AWS_CLOUDFRONT_DOMAIN || 'NOT SET');
      console.log('   S3 Bucket:', process.env.AWS_S3_BUCKET_NAME || 'NOT SET');
    } catch (error) {
      console.error('❌ Error initializing AWS S3:', error);
      throw error;
    }
  }
  return s3Instance;
};

// Get multer instance (lazy initialization)
const getMulter = () => {
  if (!uploadInstance) {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not set in environment variables. Please check your .env file.');
    }

    const s3 = getS3();
    
    // Verify S3 instance is properly initialized
    if (!s3 || typeof s3.upload !== 'function') {
      throw new Error('S3 instance is not properly initialized. Check AWS credentials.');
    }
    
    // Create custom storage that extends multerS3 but removes ACL
    const customStorage = multerS3({
      s3: s3,
      bucket: bucketName,
      // Don't set acl - will use undefined which multer-s3 handles
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        try {
          const userId = req.user?._id?.toString() || 'anonymous';
          const uniqueId = crypto.randomBytes(16).toString('hex');
          const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const fileName = `ecocaptian/${userId}/${uniqueId}-${sanitizedFileName}`;
          console.log('📤 Uploading file to S3:', fileName);
          console.log('   S3 Key:', fileName);
          console.log('   Will use CloudFront domain:', process.env.AWS_CLOUDFRONT_DOMAIN || 'NOT SET');
          cb(null, fileName);
        } catch (error) {
          console.error('❌ Error generating file key:', error);
          cb(error);
        }
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    });

    // Override _handleFile to remove ACL from params before upload
    const originalHandleFile = customStorage._handleFile.bind(customStorage);
    customStorage._handleFile = function(req, file, cb) {
      // Store original upload method
      const originalUpload = s3.upload;
      
      // Temporarily replace upload to filter out ACL
      s3.upload = function(params) {
        // Remove ACL from params
        if (params.ACL !== undefined) {
          const paramsWithoutACL = Object.assign({}, params);
          delete paramsWithoutACL.ACL;
          console.log('⚠️ Removed ACL from S3 upload params (bucket doesn\'t allow ACLs)');
          return originalUpload.call(this, paramsWithoutACL);
        }
        return originalUpload.call(this, params);
      };

      originalHandleFile(req, file, (err, info) => {
        // Restore original upload method
        s3.upload = originalUpload;
        if (err) return cb(err);
        cb(null, info);
      });
    };

    uploadInstance = multer({
      storage: customStorage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    });
  }
  return uploadInstance;
};

// Export upload function that returns multer middleware
// This creates a wrapper that initializes multer lazily when the middleware is actually used
export const upload = () => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucketName) {
    // Return a multer-like object that will error when used
    const errorMulter = {
      array: () => (req, res, next) => {
        next(new Error('AWS_S3_BUCKET_NAME is not set in environment variables. Please create a .env file in the server directory.'));
      },
      single: () => (req, res, next) => {
        next(new Error('AWS_S3_BUCKET_NAME is not set in environment variables. Please create a .env file in the server directory.'));
      },
      fields: () => (req, res, next) => {
        next(new Error('AWS_S3_BUCKET_NAME is not set in environment variables. Please create a .env file in the server directory.'));
      },
    };
    return errorMulter;
  }
  
  return getMulter();
};

// Get public URL for a file using CloudFront
export const getFileUrl = (key) => {
  if (!key) {
    console.warn('⚠️ getFileUrl called with empty key');
    return '';
  }
  
  // If already a full URL (CloudFront or S3), return as is
  if (key.startsWith('http://') || key.startsWith('https://')) {
    // If it's an S3 URL, convert to CloudFront
    if (key.includes('.s3.') || key.includes('s3.amazonaws.com')) {
      const s3Key = key.split('.com/')[1] || key.split('/').slice(-1)[0];
      const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN?.replace(/\/$/, '');
      if (cloudFrontDomain) {
        return `${cloudFrontDomain}/${s3Key}`;
      }
    }
    return key; // Already a CloudFront URL
  }
  
  // Validate CloudFront domain is set
  const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN?.replace(/\/$/, '');
  if (!cloudFrontDomain) {
    console.error('❌ AWS_CLOUDFRONT_DOMAIN is not set in environment variables');
    // Fallback to S3 URL (not recommended, but better than failing)
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    console.warn('⚠️ Using S3 URL as fallback (CloudFront not configured):', s3Url);
    return s3Url;
  }
  
  // Clean the key (remove leading slash if present)
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  
  // Construct CloudFront URL
  const cloudFrontUrl = `${cloudFrontDomain}/${cleanKey}`;
  console.log('✅ Generated CloudFront URL:', cloudFrontUrl);
  return cloudFrontUrl;
};

// Delete file from S3
export const deleteFile = async (key) => {
  try {
    // Remove CloudFront domain if present
    const s3Key = key.replace(process.env.AWS_CLOUDFRONT_DOMAIN + '/', '');
    await getS3().deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
    }).promise();
    return { success: true };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return { success: false, error: error.message };
  }
};
