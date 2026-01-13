# EcoCaptain - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Setup Environment
```bash
npm run setup-env
```

This creates:
- `.env` (frontend) in root directory
- `server/.env` (backend) in server directory

### Step 2: Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
npm install
```

### Step 3: Start Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Server runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

## 🔐 Login Credentials

**Admin:**
- Email: `aniketh0701@gmail.com`
- Password: `Admin@123`

## ✅ Verify Setup

1. **Backend Health Check:**
   - Open: `http://localhost:5000/api/health`
   - Should see: `{"status":"OK","message":"EcoCaptain API is running"}`

2. **Frontend:**
   - Open: `http://localhost:5173`
   - Should see login page
   - Login with admin credentials above

## 📋 Complete Workflow Test

### As Admin:

1. **Create Captain:**
   - Go to "Captains" tab
   - Click "Add Captain"
   - Fill: Name, Email, Password, Locality, Society, Phone
   - Captain receives email with credentials

2. **Manage E-Waste:**
   - Go to "E-Waste" tab
   - See all captain submissions
   - Click actions based on status:
     - Pending → "Set Price" or "Mark as Reviewed"
     - Reviewed → "Set Price"
     - Priced → "Plan Collection"
     - Collection Planned → "Schedule Pickup"
     - Pickup Scheduled → "Mark as Collected"
     - Collected → "Mark as Processed"
     - Processed → "Initiate Payment"
     - Payment Initiated → "Process Payment"

3. **Plan Collection:**
   - Click "Plan Collection" on Priced entry
   - Set collection date, time, notes, and steps
   - Captain receives email with collection details

4. **Process Payment:**
   - Click "Process Payment" on Payment Initiated entry
   - Enter payment amount
   - Captain balance updates automatically
   - Captain receives payment notification email

### As Captain:

1. **Login:**
   - Use credentials from admin-created account
   - Or use email sent to you

2. **Add UPI ID:**
   - Go to "Profile" tab
   - Click "Edit" on UPI ID
   - Enter UPI ID (e.g., `yourname@paytm`)
   - Click "Save"

3. **Upload E-Waste:**
   - Go to "Upload E-Waste" tab
   - Fill description, quantity, location
   - Upload up to 3 photos
   - Click "Submit E-Waste"

4. **Track Status:**
   - Go to "My E-Waste" tab
   - See all submissions with status
   - View collection plans, pickup dates, payments

5. **View Payments:**
   - Go to "Payments" tab
   - See payment history
   - View current balance

## 🔄 Auto-Refresh

The UI automatically refreshes:
- Every 30 seconds for lists and analytics
- Immediately after any action (create, update, delete)
- Profile balance updates after payment operations

## 📧 Email Notifications

Emails are sent automatically for:
- ✅ Captain account creation
- ✅ Every status change
- ✅ Payment completion

Check captain's email inbox for notifications.

## 🐛 Troubleshooting

### Backend won't start
- Check `server/.env` exists
- Verify MongoDB connection string
- Check port 5000 is available

### Frontend can't connect
- Verify backend is running
- Check `VITE_API_URL` in frontend `.env`
- Restart frontend after creating `.env`

### Data not updating
- Check browser console for errors
- Verify API calls in Network tab
- Ensure backend is running
- Check MongoDB connection

### Images not uploading
- Verify AWS S3 credentials in `server/.env`
- Check `AWS_S3_BUCKET_NAME` is correct
- Verify bucket exists and is accessible

## 📱 Features Summary

✅ Admin creates captains with locality/society  
✅ Captains add/update UPI ID  
✅ E-waste upload with max 3 images (S3)  
✅ Admin plans collection with steps  
✅ Complete status workflow  
✅ Payment processing with balance updates  
✅ Email notifications at every step  
✅ Real-time UI updates  

## 🎯 Next Steps

1. Create your first captain
2. Have captain login and add UPI ID
3. Have captain upload e-waste
4. Admin reviews and manages the workflow
5. Process payments and see balance updates

Everything is ready to go! 🚀
