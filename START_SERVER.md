# 🚀 How to Start the Server

## ⚠️ IMPORTANT: Connection Refused Error

The error `ERR_CONNECTION_REFUSED` means **the backend server is not running**.

## ✅ Solution: Start the Backend Server

### Step 1: Open Terminal in Server Directory

```bash
cd server
```

### Step 2: Start the Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
   API URL: http://localhost:5000/api
   Health Check: http://localhost:5000/api/health
```

### Step 3: Keep Terminal Open

**DO NOT CLOSE THIS TERMINAL** - The server must keep running!

### Step 4: Open New Terminal for Frontend

In a **NEW terminal window**:

```bash
npm run dev
```

## 📋 Complete Startup Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] No connection refused errors
- [ ] Can access http://localhost:5173
- [ ] Can login with admin credentials

## 🔍 Verify Backend is Running

Open in browser: `http://localhost:5000/api/health`

Should see:
```json
{
  "status": "OK",
  "message": "EcoCaptain API is running"
}
```

## 🐛 Troubleshooting

### Port 5000 Already in Use
```bash
# Find and kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill
```

### MongoDB Connection Error
- Check `server/.env` file exists
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is accessible

### Still Getting Connection Refused
1. Check backend terminal for errors
2. Verify `.env` file in `server/` directory
3. Restart backend server
4. Clear browser cache and refresh

## ✅ Once Both Servers Are Running

1. Open http://localhost:5173
2. Login with:
   - Email: `aniketh0701@gmail.com`
   - Password: `Admin@123`
3. Everything should work!
