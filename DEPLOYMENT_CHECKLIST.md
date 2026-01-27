# Quick Deployment Checklist

## 📋 Prerequisites
- [ ] GitHub account
- [ ] MongoDB Atlas account (free)
- [ ] Render.com account (free)
- [ ] Vercel account (free)
- [ ] Razorpay account (test mode)

## 🗄️ Step 1: MongoDB Atlas (5 minutes)
- [ ] Create free cluster
- [ ] Create database user (save password!)
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Add database name to connection string

## 🔧 Step 2: GitHub (2 minutes)
```bash
cd c:\Users\prate\OneDrive\Desktop\dev-marketplace
git add .
git commit -m "Production deployment"
git push
```

## 🚀 Step 3: Deploy Backend on Render (10 minutes)

### 3.1 Create Web Service
- [ ] Go to https://render.com
- [ ] New + → Web Service
- [ ] Connect GitHub repo
- [ ] Select dev-marketplace

### 3.2 Configure
- Name: `dev-marketplace-backend`
- Region: Singapore
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Plan: Free

### 3.3 Environment Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<random_64_character_string>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
ADMIN_EMAIL=admin@devmarket.com
ADMIN_PASSWORD=admin123
PLATFORM_COMMISSION=10
FRONTEND_URL=<will_update_after_frontend>
```

- [ ] Create Web Service
- [ ] Wait for deployment
- [ ] Copy backend URL: `https://_____.onrender.com`
- [ ] Test: Visit `https://_____.onrender.com/api/health`

## 🌐 Step 4: Deploy Frontend on Vercel (5 minutes)

### 4.1 Import Project
- [ ] Go to https://vercel.com
- [ ] Add New → Project
- [ ] Import dev-marketplace repo
- [ ] Framework: Next.js
- [ ] Root Directory: `frontend`

### 4.2 Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```
**Replace `your-backend-url` with actual Render URL!**

- [ ] Click Deploy
- [ ] Wait for deployment
- [ ] Copy frontend URL: `https://_____.vercel.app`

## 🔄 Step 5: Update Backend CORS (2 minutes)
- [ ] Go to Render dashboard → Your service
- [ ] Environment tab
- [ ] Edit `FRONTEND_URL`
- [ ] Set to your Vercel URL
- [ ] Save (auto redeploys)

## ✅ Step 6: Test Everything
- [ ] Visit frontend URL
- [ ] Register new user
- [ ] Login
- [ ] Browse products
- [ ] Admin login: `/admin-login`
  - Email: admin@devmarket.com
  - Password: admin123

## 📝 Save These URLs
```
Frontend: https://_____.vercel.app
Backend:  https://_____.onrender.com
Admin:    https://_____.vercel.app/admin-login
```

## ⚠️ Important Notes

### Render Free Tier
- Sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake up
- Good for testing, upgrade for production

### Environment Variables Security
- Never commit .env files
- Use strong, random JWT_SECRET
- Change default admin password

### MongoDB Atlas
- Free tier: 512 MB storage
- Good for small projects
- Upgrade if needed

## 🎉 Deployment Complete!

Your app is now live:
- Frontend: Fast on Vercel
- Backend: Running on Render
- Database: MongoDB Atlas
- **Total Cost: FREE** ✅

## Next Steps
- [ ] Change admin password
- [ ] Set up custom domain (optional)
- [ ] Configure production Razorpay keys
- [ ] Monitor application logs
- [ ] Set up error tracking (optional)

## Need Help?
Check `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
