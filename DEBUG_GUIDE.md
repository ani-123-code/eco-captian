# Debug Guide for 400/500 Errors

## 🔍 How to Debug

### 1. Check Backend Server Logs

Look at your terminal where the backend server is running. You should see detailed error messages like:

```
Multer upload error: ...
Create ewaste entry error: ...
Error details: ...
Stack: ...
```

### 2. Common Issues and Solutions

#### Issue: 400 Bad Request on `/api/captains`
**Possible Causes:**
- Missing required fields (email, password, full_name)
- Invalid email format
- Password too short (< 6 characters)
- Email already exists

**Solution:**
- Check the request body in browser DevTools → Network tab
- Verify all required fields are being sent
- Check backend logs for specific error message

#### Issue: 500 Internal Server Error on `/api/ewaste`
**Possible Causes:**
- S3 credentials not configured
- MongoDB connection issue
- File upload error
- Missing environment variables

**Solution:**
1. **Check S3 Configuration:**
   ```bash
   # Verify these in server/.env:
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=...
   AWS_S3_BUCKET_NAME=...
   AWS_CLOUDFRONT_DOMAIN=...
   ```

2. **Check MongoDB Connection:**
   - Verify `MONGODB_URI` in `server/.env`
   - Check if MongoDB is accessible
   - Look for connection errors in logs

3. **Check File Upload:**
   - Verify files are being sent as `FormData`
   - Check file size (max 10MB per file)
   - Verify file types (images only)

### 3. Test Endpoints Manually

#### Test Health Endpoint:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"OK","message":"EcoCaptain API is running"}
```

#### Test Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aniketh0701@gmail.com","password":"Admin@123"}'
```

### 4. Check Browser Console

1. Open DevTools (F12)
2. Go to Network tab
3. Try the action that's failing
4. Click on the failed request
5. Check:
   - **Request Headers**: Is Authorization token present?
   - **Request Payload**: Are all fields present?
   - **Response**: What error message is returned?

### 5. Verify Environment Variables

Run this in your backend terminal:
```bash
cd server
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING'); console.log('AWS_S3_BUCKET_NAME:', process.env.AWS_S3_BUCKET_NAME ? 'SET' : 'MISSING');"
```

### 6. Common Fixes

#### Fix 1: Restart Backend Server
```bash
# Stop server (Ctrl+C)
# Then restart:
cd server
npm run dev
```

#### Fix 2: Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or clear browser cache completely

#### Fix 3: Check Token
- Open browser DevTools → Application → Local Storage
- Check if `token` exists
- If not, login again

#### Fix 4: Verify S3 Bucket
- Check if bucket exists in AWS
- Verify bucket permissions
- Check if `ecocaptian/` folder can be created

### 7. Enable Detailed Logging

The server now logs:
- ✅ All errors with stack traces
- ✅ Multer upload errors
- ✅ Authentication errors
- ✅ Database errors

Check your backend terminal for these logs!

## 📋 Quick Checklist

- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] All environment variables are set
- [ ] S3 credentials are correct
- [ ] User is logged in (token exists)
- [ ] Request includes all required fields
- [ ] Files are under 10MB
- [ ] Files are images only

## 🆘 Still Having Issues?

1. **Copy the exact error message** from:
   - Browser console
   - Backend terminal logs
   - Network tab response

2. **Check the specific endpoint** that's failing:
   - `/api/captains` - Captain management
   - `/api/ewaste` - E-waste submission

3. **Verify the request format** matches what the API expects
