# EcoCaptain Setup Guide

Complete setup instructions for the EcoCaptain e-waste management platform.

## Quick Start

### 1. Setup Environment Variables

Run the setup script to create all required `.env` files:

```bash
npm run setup-env
```

This will create:
- `.env` in the root directory (frontend)
- `server/.env` in the server directory (backend)

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
npm install
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Default Login Credentials

- **Email:** `aniketh0701@gmail.com`
- **Password:** `Admin@123`

## Manual Setup (if script doesn't work)

### Frontend `.env` (root directory)

Create a file named `.env` in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ADMIN_EMAIL=aniketh0701@gmail.com
VITE_ADMIN_PASSWORD=Admin@123
```

### Backend `.env` (server directory)

Create a file named `.env` in the `server` directory:

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://aniketh:Aniketh%40123@ecotrade.nfr9772.mongodb.net/eco-captain-db?retryWrites=true&w=majority&appName=ecotrade

JWT_SECRET=SarvinSecretKeyIYBGJhhhJ3fd
JWT_EXPIRE=7d

ADMIN_EMAIL=aniketh0701@gmail.com
ADMIN_PASSWORD=Admin@123

AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=ecodispose-images-bucket
AWS_CLOUDFRONT_DOMAIN=https://d7vynzspib3jv.cloudfront.net

RAZORPAY_KEY_ID=rzp_live_RQAemVx0dSjSca
RAZORPAY_KEY_SECRET=uxqOh4VC2x1OIgUH59xWA3ps

GMAIL_CLIENT_ID=1080913491397-pd9r7k39qq72l6dhavpkkjauasplsd90.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=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
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER=team@eco-dispose.com
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

APP_NAME=Eco Trade
FRONTEND_URL=http://localhost:5173
```

## Verification

### Check Backend
1. Open `http://localhost:5000/api/health` in your browser
2. You should see: `{"status":"OK","message":"EcoCaptain API is running"}`

### Check Frontend
1. Open `http://localhost:5173` in your browser
2. You should see the login page
3. Login with the default admin credentials

### Check MongoDB Connection
The backend console will show:
- `✅ MongoDB Connected: ...` if connection is successful
- `❌ MongoDB Connection Error: ...` if there's an issue

## Troubleshooting

### Backend won't start
- Check that `server/.env` exists and has all required variables
- Verify MongoDB connection string is correct
- Check that port 5000 is not in use

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env` matches backend URL
- Restart frontend dev server after creating `.env` file

### Login fails with 401
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` match in both frontend and backend `.env` files
- Check backend console for login attempt logs
- Ensure MongoDB is connected (admin user is created on first login)

### MongoDB connection fails
- Verify the connection string is correct
- Check network connectivity
- Ensure MongoDB Atlas allows connections from your IP (if using Atlas)

## Database

The application uses MongoDB with the database name: `eco-captain-db`

Collections:
- `users` - User accounts (admins and captains)
- `ewasteentries` - E-waste submissions
- `payments` - Payment transactions

The admin user is automatically created on first successful login.
