# Complete Deployment Guide: Vercel + Render

## Overview
- **Frontend:** Vercel (Next.js)
- **Backend:** Render.com (Node.js/Express)
- **Database:** MongoDB Atlas (Free Tier)

---

## Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a **FREE** cluster (M0 tier)

### 1.2 Configure Database
1. **Database Access:**
   - Click "Database Access" → "Add New Database User"
   - Username: `devmarketplace` (or your choice)
   - Password: Generate strong password (save it!)
   - Database User Privileges: Choose "Read and write to any database"
   - Click "Add User"

2. **Network Access:**
   - Click "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

3. **Get Connection String:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select Driver: Node.js, Version: 4.1 or later
   - Copy the connection string
   - It looks like: `mongodb+srv://devmarketplace:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://devmarketplace:yourpassword@cluster0.xxxxx.mongodb.net/dev-marketplace?retryWrites=true&w=majority`

---

## Step 2: Push Code to GitHub

```bash
cd c:\Users\prate\OneDrive\Desktop\dev-marketplace

# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account

### 3.2 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your `dev-marketplace` repo

### 3.3 Configure Service
**Basic Settings:**
- **Name:** `dev-marketplace-backend` (or your choice)
- **Region:** Singapore (or closest to you)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3.4 Select Plan
- Choose **Free** plan

### 3.5 Add Environment Variables
Click "Advanced" → Add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://devmarketplace:yourpassword@cluster0.xxxxx.mongodb.net/dev-marketplace?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345_make_it_long_and_random
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAIL=admin@devmarket.com
ADMIN_PASSWORD=admin123
PLATFORM_COMMISSION=10
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note:** Replace values with your actual credentials!

### 3.6 Deploy
1. Click "Create Web Service"
2. Wait 5-10 minutes for deployment
3. Your backend will be at: `https://dev-marketplace-backend.onrender.com`

### 3.7 Test Backend
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account

### 4.2 Import Project
1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Select `dev-marketplace`

### 4.3 Configure Project
**Framework Preset:** Next.js
**Root Directory:** `frontend`
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

### 4.4 Add Environment Variable
Click "Environment Variables":

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**Important:** Replace with your actual Render backend URL from Step 3!

### 4.5 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Your frontend will be at: `https://your-project.vercel.app`

---

## Step 5: Update Backend CORS

### 5.1 Update Frontend URL in Render
1. Go to Render dashboard → Your backend service
2. Environment → Edit `FRONTEND_URL`
3. Set to: `https://your-project.vercel.app` (your actual Vercel URL)
4. Save Changes
5. Service will auto-redeploy

---

## Step 6: Test Complete Application

### 6.1 Open Frontend
Visit your Vercel URL: `https://your-project.vercel.app`

### 6.2 Test Features
1. **Register new user** - Should work
2. **Login** - Should work
3. **Browse products** - Should load
4. **Admin login** - `/admin-login`
   - Email: `admin@devmarket.com`
   - Password: `admin123`

---

## Important URLs to Save

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://your-project.vercel.app` | Main website |
| Backend | `https://your-backend.onrender.com` | API server |
| MongoDB | MongoDB Atlas Dashboard | Database |
| Admin Panel | `https://your-project.vercel.app/admin-login` | Admin access |

---

## Troubleshooting

### Backend Issues

**Problem: Render service not starting**
- Check "Logs" tab in Render dashboard
- Verify all environment variables are set
- Check MongoDB connection string

**Problem: Database connection failed**
- Verify MongoDB Atlas IP whitelist: 0.0.0.0/0
- Check MONGODB_URI is correct
- Ensure database user has correct password

**Problem: API 500 errors**
- Check Render logs for errors
- Verify JWT_SECRET is set
- Check all required env vars are present

### Frontend Issues

**Problem: API calls failing**
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for CORS errors
- Ensure FRONTEND_URL in backend matches

**Problem: Build fails on Vercel**
- Check Vercel build logs
- Verify frontend/package.json is correct
- Check for TypeScript or lint errors

### Render Free Tier Notes

⚠️ **Important:** Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan for always-on service
- Or use Vercel for both (see alternative below)

---

## Alternative: Keep Both on Vercel

If Render is too slow, you can deploy backend on Vercel too:

1. Remove `backend` root directory setting
2. Use the `backend/api/index.js` file we created
3. Backend files are already configured for Vercel
4. See `BACKEND_DEPLOYMENT.md` for details

---

## Auto-Deployment

Both Vercel and Render auto-deploy when you push to GitHub:

```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push

# Both services will auto-deploy!
```

---

## Security Checklist

Before going live:
- [ ] Change ADMIN_PASSWORD from default
- [ ] Use strong JWT_SECRET (random 64+ characters)
- [ ] Set up proper Razorpay production keys
- [ ] Review MongoDB Atlas security rules
- [ ] Enable 2FA on all service accounts
- [ ] Review CORS settings

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Free | $0/month |
| Render Backend | Free | $0/month (with sleep) |
| Vercel Frontend | Hobby | $0/month |
| **Total** | | **$0/month** ✅

Upgrade paths available when needed!

---

## Support

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/
