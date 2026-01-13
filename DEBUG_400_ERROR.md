# Debugging 400 Bad Request Error

## 🔍 How to Identify the Issue

### Step 1: Check Backend Terminal Logs

The backend now logs detailed information about 400 errors. Look for:

#### For E-waste Upload:
```
❌ Missing required fields: { hasDescription: false, hasQuantity: false, ... }
❌ Multer upload error: ...
```

#### For Captain Creation:
```
❌ Missing required fields: { hasEmail: false, hasPassword: false, ... }
❌ Invalid email format: ...
❌ Password too short: ...
```

### Step 2: Check Browser Console

1. Open DevTools (F12)
2. Go to **Network** tab
3. Find the failed request (status 400)
4. Click on it
5. Check:
   - **Request Payload** - What data was sent?
   - **Response** - What error message was returned?

### Step 3: Common 400 Error Causes

#### 1. Missing Required Fields
**E-waste Upload:**
- Missing `description`
- Missing `quantity`
- Both must be provided

**Captain Creation:**
- Missing `email`
- Missing `password`
- Missing `full_name`

#### 2. File Upload Issues
- File too large (> 10MB)
- Wrong file type (not an image)
- S3 credentials not configured
- AWS_S3_BUCKET_NAME not set

#### 3. Validation Errors
- Invalid email format
- Password too short (< 6 characters)
- Invalid UPI ID format
- Invalid status value

## 🔧 Quick Fixes

### Fix 1: Check Request Data
Make sure you're sending all required fields:

**E-waste Upload:**
```javascript
{
  description: "Old laptop",
  quantity: "5",
  location_address: "Optional address"
}
```

**Captain Creation:**
```javascript
{
  email: "captain@example.com",
  password: "password123",
  full_name: "John Doe"
}
```

### Fix 2: Check File Upload
- Max 3 files
- Max 10MB per file
- Images only (jpg, png, gif, etc.)

### Fix 3: Check Environment Variables
```bash
cd server
# Check if .env exists and has required variables
cat .env | grep -E "AWS_S3_BUCKET_NAME|AWS_CLOUDFRONT_DOMAIN"
```

### Fix 4: Restart Backend
```bash
cd server
npm run dev
```

## 📋 Error Response Format

The API now returns detailed error messages:

```json
{
  "error": "Description and quantity are required",
  "received": {
    "description": null,
    "quantity": null
  }
}
```

## 🆘 Still Having Issues?

1. **Copy the exact error message** from:
   - Backend terminal logs
   - Browser Network tab response
   - Browser console

2. **Check which endpoint** is failing:
   - `/api/ewaste` - E-waste upload
   - `/api/captains` - Captain creation
   - `/api/profile/upi` - UPI update

3. **Share the error details** so we can help debug!

## ✅ Enhanced Error Handling

The code now includes:
- ✅ Detailed error logging
- ✅ Better error messages
- ✅ Request data validation
- ✅ File upload error handling
- ✅ CloudFront URL error handling

All errors are logged with:
- Error message
- Error stack trace
- Request details
- Validation results
