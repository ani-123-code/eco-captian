# Railway Quick Start Checklist

Use this checklist for quick deployment reference.

## Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0` (or Railway IPs)
- [ ] All environment variables are ready
- [ ] Railway account is created

---

## Backend Deployment (Service 1)

1. **Create Service**
   - [ ] New Project → Deploy from GitHub
   - [ ] Select repository
   - [ ] Settings → Root Directory: `server`
   - [ ] Settings → Start Command: `npm start`

2. **Environment Variables** (Add all):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=...
   JWT_SECRET=...
   JWT_EXPIRE=7d
   ADMIN_EMAIL=...
   ADMIN_PASSWORD=...
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=...
   AWS_CLOUDFRONT_DOMAIN=...
   RAZORPAY_KEY_ID=...
   RAZORPAY_KEY_SECRET=...
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   GMAIL_USER=...
   GMAIL_REDIRECT_URI=...
   APP_NAME=EcoCaptain
   FRONTEND_URL=https://your-frontend-domain.up.railway.app
   ```

3. **Get Backend URL**
   - [ ] Settings → Networking → Generate Domain
   - [ ] Copy URL: `https://your-backend.up.railway.app`
   - [ ] Backend API: `https://your-backend.up.railway.app/api`

4. **Deploy**
   - [ ] Wait for deployment to complete
   - [ ] Test: `https://your-backend.up.railway.app/api/health`

---

## Frontend Deployment (Service 2)

1. **Create Service**
   - [ ] Same project → New → Service
   - [ ] GitHub Repo → Select same repository
   - [ ] Settings → Root Directory: (empty)
   - [ ] Settings → Build Command: `npm run build`
   - [ ] Settings → Output Directory: `dist`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   ```
   (Replace with your actual backend URL from above)

3. **Get Frontend URL**
   - [ ] Settings → Networking → Generate Domain
   - [ ] Copy URL: `https://your-frontend.up.railway.app`

4. **Update Backend CORS**
   - [ ] Go back to Backend service
   - [ ] Variables → Update `FRONTEND_URL` to frontend domain
   - [ ] Redeploy backend

5. **Deploy**
   - [ ] Wait for deployment to complete
   - [ ] Test: `https://your-frontend.up.railway.app`

---

## Post-Deployment Testing

- [ ] Backend health check works
- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] API calls work (check browser console)
- [ ] No CORS errors
- [ ] File uploads work
- [ ] All features tested

---

## Troubleshooting Quick Fixes

**Backend won't start:**
- Check environment variables are set
- Check MongoDB connection
- Check deployment logs

**Frontend shows blank page:**
- Check `VITE_API_URL` is correct
- Check browser console for errors
- Verify backend is running

**CORS errors:**
- Update `FRONTEND_URL` in backend
- Redeploy backend
- Clear browser cache

**Build fails:**
- Check deployment logs
- Verify all dependencies in package.json
- Check for TypeScript errors

---

## Important URLs to Save

- Backend API: `https://your-backend.up.railway.app/api`
- Frontend: `https://your-frontend.up.railway.app`
- Health Check: `https://your-backend.up.railway.app/api/health`

---

For detailed instructions, see `RAILWAY_DEPLOYMENT.md`
