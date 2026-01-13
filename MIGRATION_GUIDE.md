# Migration from Supabase to MongoDB

This document outlines the changes made to migrate from Supabase to MongoDB with Express.js backend.

## Changes Made

### Backend (New Server)

1. **Created Express.js server** (`server/` directory)
   - Express.js REST API
   - MongoDB with Mongoose ODM
   - JWT authentication
   - AWS S3 for file uploads
   - Gmail OAuth2 for email services

2. **Database Models**
   - `User` - User accounts (admins and captains)
   - `EwasteEntry` - E-waste submissions
   - `Payment` - Payment transactions

3. **API Routes**
   - `/api/auth` - Authentication endpoints
   - `/api/captains` - Captain management (admin only)
   - `/api/ewaste` - E-waste entry management
   - `/api/payments` - Payment history
   - `/api/analytics` - Analytics data (admin only)

### Frontend Changes

1. **Removed Supabase**
   - Deleted `src/lib/supabase.ts`
   - Removed `@supabase/supabase-js` dependency

2. **Created API Client**
   - New `src/lib/api.ts` with API functions
   - Handles JWT token storage and requests

3. **Updated Components**
   - `AuthContext` - Now uses JWT instead of Supabase auth
   - `CaptainDashboard` - Uses API endpoints
   - `AdminDashboard` - Uses API endpoints
   - All admin components updated

## Database Schema

### Users Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  full_name: String,
  role: 'admin' | 'captain',
  balance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### EwasteEntries Collection
```javascript
{
  captain_id: ObjectId (ref: User),
  description: String,
  quantity: Number,
  location_address: String,
  photos: [String],
  status: 'Pending' | 'Priced' | 'Pickup Scheduled' | 'Processed' | 'Paid',
  price: Number,
  pickup_date: Date,
  pickup_notes: String,
  payment_amount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Payments Collection
```javascript
{
  captain_id: ObjectId (ref: User),
  ewaste_id: ObjectId (ref: EwasteEntry),
  amount: Number,
  description: String,
  createdAt: Date
}
```

## Environment Variables

### Backend (.env in server/)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD` - Admin password
- AWS credentials for S3
- Gmail OAuth2 credentials

### Frontend (.env in root/)
- `VITE_API_URL` - Backend API URL
- `VITE_ADMIN_EMAIL` - Admin email (for auto-login)
- `VITE_ADMIN_PASSWORD` - Admin password (for auto-login)

## Running the Application

1. **Start Backend:**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   npm install
   npm run dev
   ```

## Key Differences

1. **Authentication**: JWT tokens stored in localStorage instead of Supabase sessions
2. **File Uploads**: Direct upload to AWS S3 instead of Supabase Storage
3. **Real-time Updates**: Removed (can be added with WebSockets if needed)
4. **Database**: MongoDB instead of PostgreSQL
5. **Email**: Gmail OAuth2 instead of Supabase Edge Functions

## Notes

- The database name is `eco-captain-db` as specified
- All Supabase Edge Functions have been removed
- The admin user is automatically created on first login if it doesn't exist
