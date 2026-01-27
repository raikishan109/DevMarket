# GitHub Repository Setup - Manual Instructions

Browser automation is not available, so please follow these manual steps:

## Step 1: Create GitHub Repository

1. **Open your browser and go to:** https://github.com/new

2. **Fill in the details:**
   - **Repository name:** `dev-marketplace`
   - **Description:** "Developer Marketplace Platform - Buy and sell developer tools, websites, and apps"
   - **Visibility:** Choose Public or Private
   - **IMPORTANT:** Do NOT check any of these:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license

3. **Click "Create repository"**

## Step 2: Copy Your Repository URL

After creating the repo, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/dev-marketplace.git
```

**Copy this URL!**

## Step 3: Run These Commands

Open your terminal/command prompt and run:

```bash
# Navigate to your project
cd c:\Users\prate\OneDrive\Desktop\dev-marketplace

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/dev-marketplace.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: If You Already Have a Repo

If you already have a GitHub repository, just replace YOUR_USERNAME or the full URL:

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Verification

After pushing, you should see your files on GitHub at:
```
https://github.com/YOUR_USERNAME/dev-marketplace
```

## Next Steps After Pushing

Once your code is on GitHub:

1. ✅ **Deploy Backend on Render:**
   - https://render.com → New Web Service
   - Connect your GitHub repo
   - Follow `DEPLOYMENT_CHECKLIST.md`

2. ✅ **Deploy Frontend on Vercel:**
   - https://vercel.com → New Project
   - Import your GitHub repo
   - Follow `DEPLOYMENT_CHECKLIST.md`

---

**Need Help?** 
- Check `DEPLOYMENT_GUIDE.md` for complete deployment instructions
- Check `DEPLOYMENT_CHECKLIST.md` for quick step-by-step guide
