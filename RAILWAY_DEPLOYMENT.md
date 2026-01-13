# Railway Deployment Guide for EcoCaptain

This guide will help you deploy your EcoCaptain application to Railway hosting platform.

## Overview

Your application has two parts:
1. **Frontend** (React + Vite) - in root directory
2. **Backend** (Express.js) - in `server/` directory

You have two deployment options:
- **Option 1: Two Separate Services** (Recommended) - Frontend and Backend as separate Railway services
- **Option 2: Monorepo Deployment** - Single service with backend serving frontend

We'll use **Option 1** as it's more scalable and follows best practices.

---

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Railway Account** - Sign up at https://railway.app (free tier available)
3. **MongoDB Atlas** - Your database should be accessible (whitelist Railway IP: `0.0.0.0/0` for development)
4. **Environment Variables** - Have all your API keys and secrets ready

---

## Step-by-Step Deployment Guide

### PART 1: Prepare Your Code

#### Step 1: Push Your Code to GitHub

If your code is not already on GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### Step 2: Update MongoDB Atlas Network Access

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` to allow all IPs (or add Railway's IP ranges)
4. Click "Confirm"

---

### PART 2: Deploy Backend to Railway

#### Step 3: Create Backend Service on Railway

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will detect the project - **DON'T deploy yet**
6. Click on the service that was created
7. Click on **"Settings"** tab
8. Change the **Root Directory** to `server`
9. Change the **Start Command** to: `npm start`
10. Change the **Build Command** to: `npm install` (or leave empty)

#### Step 4: Configure Backend Environment Variables

In the backend service, go to **"Variables"** tab and add:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_CLOUDFRONT_DOMAIN=your_cloudfront_domain
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_USER=your_gmail_user
GMAIL_REDIRECT_URI=your_redirect_uri
APP_NAME=EcoCaptain
FRONTEND_URL=https://your-frontend-domain.up.railway.app
```

**Important:** Replace all `your_*` values with your actual values.

#### Step 5: Get Backend URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** to get a public URL
3. Copy this URL (e.g., `https://your-backend.up.railway.app`)
4. This will be your backend API URL: `https://your-backend.up.railway.app/api`

#### Step 6: Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button manually
3. Check the **"Deployments"** tab for build logs
4. Wait for deployment to complete (green status)

---

### PART 3: Deploy Frontend to Railway

#### Step 7: Create Frontend Service

1. In the same Railway project, click **"New"** → **"Service"**
2. Select **"GitHub Repo"** → Choose the same repository
3. This creates a new service for the frontend

#### Step 8: Configure Frontend Service

1. Go to the frontend service → **"Settings"**
2. **Root Directory:** Leave empty (root directory)
3. **Build Command:** `npm run build`
4. **Start Command:** Leave empty (Railway will detect it's a static site)
5. **Output Directory:** `dist`

#### Step 9: Configure Frontend Environment Variables

In the frontend service, go to **"Variables"** tab and add:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

**Replace** `your-backend.up.railway.app` with your actual backend domain from Step 5.

#### Step 10: Configure Static Site Serving

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** to get a public URL
3. Railway will automatically serve your built frontend

#### Step 11: Update Backend CORS

Go back to your backend service:
1. Go to **"Variables"** tab
2. Update `FRONTEND_URL` to your frontend domain:
   ```env
   FRONTEND_URL=https://your-frontend.up.railway.app
   ```
3. This will trigger a redeploy

---

### PART 4: Verify Deployment

#### Step 12: Test Your Application

1. **Test Backend:**
   - Visit: `https://your-backend.up.railway.app/api/health`
   - Should return: `{"status":"OK","message":"EcoCaptain API is running"}`

2. **Test Frontend:**
   - Visit: `https://your-frontend.up.railway.app`
   - Should show your homepage

3. **Test API Connection:**
   - Try logging in from the frontend
   - Check browser console for any CORS errors

---

## Alternative: Monorepo Deployment (Single Service)

If you prefer a single service deployment, you can modify the backend to serve the frontend:

### Modify server.js to serve static files:

```javascript
// Add at the end of server.js, before app.listen()

// Serve static files from React app
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the React app
app.use(express.static(join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});
```

Then in Railway:
- Root Directory: Leave empty
- Build Command: `cd server && npm install && cd .. && npm install && npm run build`
- Start Command: `cd server && npm start`
- Port: Railway will detect automatically

---

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed:**
   - Check MongoDB Atlas Network Access (whitelist `0.0.0.0/0`)
   - Verify `MONGODB_URI` is correct in Railway variables
   - Check deployment logs in Railway

2. **Port Issues:**
   - Railway automatically assigns `PORT` environment variable
   - Your code already uses `process.env.PORT || 5000` which is correct

3. **Build Failures:**
   - Check deployment logs in Railway
   - Verify all dependencies are in `package.json`
   - Check Node.js version compatibility

### Frontend Issues

1. **API Connection Failed:**
   - Verify `VITE_API_URL` is set correctly in Railway variables
   - Check CORS settings in backend
   - Check browser console for errors

2. **Build Failures:**
   - Check deployment logs
   - Verify all dependencies are installed
   - Check for TypeScript/ESLint errors

3. **Blank Page:**
   - Check browser console for errors
   - Verify API URL is correct
   - Check network tab for failed requests

### General Issues

1. **Environment Variables Not Working:**
   - Make sure variables are set in the correct service (backend vs frontend)
   - Variable names must match exactly (case-sensitive)
   - Redeploy after changing variables

2. **CORS Errors:**
   - Update `FRONTEND_URL` in backend to match your frontend domain
   - Check CORS configuration in `server.js`

---

## Custom Domains (Optional)

Railway allows custom domains:

1. Go to your service → **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain
4. Configure DNS as instructed by Railway

---

## Monitoring & Logs

- **View Logs:** Go to your service → **"Deployments"** → Click on a deployment → View logs
- **Metrics:** Railway provides basic metrics in the dashboard
- **Alerts:** Set up alerts in Railway settings

---

## Cost Estimation

Railway's free tier includes:
- $5 credit per month
- 512 MB RAM
- 1 GB storage
- 100 GB bandwidth

For a small application, this is usually sufficient. Monitor your usage in the Railway dashboard.

---

## Security Notes

1. **Never commit `.env` files** - Always use Railway's environment variables
2. **Use strong secrets** - Generate strong `JWT_SECRET` values
3. **Update MongoDB password** - Use strong passwords for production
4. **Enable HTTPS** - Railway provides HTTPS by default
5. **Review CORS settings** - Only allow your frontend domain

---

## Next Steps

1. ✅ Test all functionality in production
2. ✅ Set up custom domain (if needed)
3. ✅ Configure monitoring and alerts
4. ✅ Set up database backups
5. ✅ Document your deployment process

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

Good luck with your deployment! 🚀
