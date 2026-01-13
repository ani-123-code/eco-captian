# Troubleshooting Guide

## 🔴 Common Errors and Solutions

### 1. 401 Unauthorized on Login

**Symptoms:**
- `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
- Cannot login with admin credentials

**Possible Causes:**
1. Wrong email/password
2. Admin user doesn't exist in database
3. Password hash mismatch
4. Environment variables not loaded

**Solutions:**

#### Check Backend Logs
Look for:
```
🔐 Login attempt: { email: '...', hasPassword: true, ... }
❌ Login failed: User not found
❌ Login failed: Password mismatch
```

#### Verify Credentials
- Email: `aniketh0701@gmail.com`
- Password: `Admin@123`

#### Check Environment Variables
```bash
cd server
# Check if .env exists
cat .env | grep ADMIN
```

Should show:
```
ADMIN_EMAIL=aniketh0701@gmail.com
ADMIN_PASSWORD=Admin@123
```

#### Restart Backend
```bash
cd server
npm run dev
```

### 2. 400 Bad Request on `/api/ewaste`

**Symptoms:**
- Cannot submit e-waste
- `Failed to load resource: the server responded with a status of 400 (Bad Request)`

**Possible Causes:**
1. Missing required fields (description, quantity)
2. File upload error
3. Multer configuration issue
4. S3 credentials issue

**Solutions:**

#### Check Request Data
In browser DevTools → Network tab:
- Click on the failed request
- Check "Payload" tab
- Verify `description` and `quantity` are present

#### Check Backend Logs
Look for:
```
📝 Create e-waste request received
❌ Missing required fields: { hasDescription: false, hasQuantity: false }
❌ Multer upload error: ...
```

#### Verify File Upload
- Files must be images only
- Max 3 files
- Max 10MB per file
- Check browser console for file validation errors

### 3. `this.client.send is not a function`

**Symptoms:**
- AWS SDK error
- File uploads fail
- S3 operations fail

**Possible Causes:**
1. AWS SDK version mismatch
2. ES module import issue
3. AWS credentials not configured

**Solutions:**

#### Check AWS SDK Installation
```bash
cd server
npm list aws-sdk
```

Should show: `aws-sdk@2.1500.0` or similar

#### Reinstall AWS SDK
```bash
cd server
npm uninstall aws-sdk
npm install aws-sdk@^2.1500.0
```

#### Verify AWS Credentials
Check `server/.env`:
```
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=ecodispose-images-bucket
AWS_CLOUDFRONT_DOMAIN=https://d7vynzspib3jv.cloudfront.net
```

#### Check S3 Bucket
- Verify bucket exists: `ecodispose-images-bucket`
- Check bucket permissions
- Verify IAM user has S3 access

### 4. Files Not Uploading to S3

**Symptoms:**
- E-waste submission succeeds but no images
- Images don't display

**Solutions:**

#### Check S3 Folder Structure
Files should be in: `ecocaptian/{userId}/{uniqueId}-{filename}`

#### Verify CloudFront URL
Check `AWS_CLOUDFRONT_DOMAIN` in `.env`:
```
AWS_CLOUDFRONT_DOMAIN=https://d7vynzspib3jv.cloudfront.net
```

#### Test S3 Connection
Check backend logs for:
```
✅ AWS S3 initialized successfully
📤 Uploading file to S3: ecocaptian/...
```

## 🔍 Debugging Steps

### Step 1: Check Backend is Running
```bash
# Terminal 1
cd server
npm run dev
```

Should see:
```
🚀 Server running on port 5000
   API URL: http://localhost:5000/api
   Health Check: http://localhost:5000/api/health
```

### Step 2: Test Health Endpoint
Open browser: `http://localhost:5000/api/health`

Should return:
```json
{"status":"OK","message":"EcoCaptain API is running"}
```

### Step 3: Check Environment Variables
```bash
cd server
node -e "require('dotenv').config({ path: './.env' }); console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL); console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME);"
```

### Step 4: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Go to Network tab
5. Check failed requests

### Step 5: Check Backend Logs
Watch the terminal where backend is running:
- Look for error messages
- Check request logs
- Verify database connections

## ✅ Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### Fix 2: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache completely

### Fix 3: Reinstall Dependencies
```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### Fix 4: Verify .env Files
```bash
# Check backend .env
cd server
cat .env

# Check frontend .env (if exists)
cat .env
```

## 📋 Checklist

Before reporting issues, verify:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] MongoDB is connected
- [ ] All environment variables are set
- [ ] AWS credentials are correct
- [ ] S3 bucket exists and is accessible
- [ ] User is logged in (token exists)
- [ ] Browser console shows no errors
- [ ] Backend terminal shows no errors

## 🆘 Still Having Issues?

1. **Copy the exact error message** from:
   - Browser console
   - Backend terminal
   - Network tab

2. **Check the logs** - The backend now logs everything:
   - Login attempts
   - File uploads
   - Database operations
   - Errors with stack traces

3. **Share the error details** so we can help debug!
