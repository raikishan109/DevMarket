# Vercel Deployment Guide for Dev Marketplace

## Prerequisites
1. GitHub account
2. Vercel account (free tier works)
3. MongoDB Atlas account (for production database)

## Step 1: Prepare MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Vercel deployment
5. Get your connection string (replace <password> with your actual password)

## Step 2: Push Code to GitHub

```bash
cd c:\Users\prate\OneDrive\Desktop\dev-marketplace
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Step 3: Deploy Backend on Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

5. Add Environment Variables:
   - `PORT` = 5000
   - `NODE_ENV` = production
   - `MONGODB_URI` = your_mongodb_atlas_connection_string
   - `JWT_SECRET` = your_super_secret_jwt_key_change_this_in_production_12345
   - `RAZORPAY_KEY_ID` = your_razorpay_key_id
   - `RAZORPAY_KEY_SECRET` = your_razorpay_secret
   - `ADMIN_EMAIL` = admin@devmarket.com
   - `ADMIN_PASSWORD` = admin123
   - `PLATFORM_COMMISSION` = 10
   - `FRONTEND_URL` = (will add after frontend deployment)

6. Click "Deploy"

## Step 4: Deploy Frontend on Vercel

1. In Vercel dashboard, click "Add New" → "Project"
2. Import your GitHub repository again
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your_backend_vercel_url (from step 3)

5. Click "Deploy"

## Step 5: Update Backend Environment

1. Go to your backend project on Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` with your frontend Vercel URL
4. Redeploy the backend

## Step 6: Configure CORS

The backend server.js already has CORS configured. Ensure it allows your frontend URL.

## Important Notes

- Backend will be deployed at: `https://your-backend.vercel.app`
- Frontend will be deployed at: `https://your-frontend.vercel.app`
- Both deployments will auto-update when you push to GitHub
- Make sure to use MongoDB Atlas (not local MongoDB)
- Razorpay should be in test mode initially

## Testing

After deployment:
1. Visit your frontend URL
2. Try registering a new user
3. Test login functionality
4. Check admin panel at /admin-login

## Troubleshooting

If deployment fails:
- Check Vercel deployment logs
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas connection string is correct
- Check that IPs are whitelisted in MongoDB Atlas

## Alternative: Deploy Both Together (Monorepo)

You can also deploy both frontend and backend from the root directory using the `vercel.json` already created. However, this is more complex and the separate deployment approach above is recommended.
