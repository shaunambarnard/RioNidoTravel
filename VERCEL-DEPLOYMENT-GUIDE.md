# 🚀 Vercel Deployment Guide

## Prerequisites

✅ GitHub account  
✅ Vercel account (free tier available)  
✅ Git installed on your computer

---

## Step 1: Push Code to GitHub

### 1.1 Initialize Git Repository (if not already done)

```bash
git init
```

### 1.2 Add All Files

```bash
git add .
```

### 1.3 Commit Changes

```bash
git commit -m "Initial commit - Rio Nido Travel Planner ready for deployment"
```

### 1.4 Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click the **"+"** icon (top right)
3. Select **"New repository"**
4. Name it: `rio-nido-travel-planner`
5. Keep it **Public** or **Private** (your choice)
6. **DO NOT** initialize with README (we already have one)
7. Click **"Create repository"**

### 1.5 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/rio-nido-travel-planner.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy to Vercel

### Method A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**: [vercel.com](https://vercel.com)

2. **Sign Up/Login**: Use your GitHub account

3. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Select **"Import Git Repository"**
   - Choose your `rio-nido-travel-planner` repository

4. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected ✅)
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

5. **Environment Variables** (Optional - for backend features):
   ```
   VITE_GOOGLE_SHEETS_URL=your_sheets_url_here
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_GOOGLE_FORM_ID=your_form_id
   ```

6. **Click "Deploy"** 🚀

7. **Wait 1-2 minutes** for the build to complete

8. **Success!** 🎉 You'll get a URL like:
   ```
   https://rio-nido-travel-planner.vercel.app
   ```

---

### Method B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# For production deployment
vercel --prod
```

---

## Step 3: Verify Deployment

1. **Open the Vercel URL** provided after deployment
2. **Test the app**:
   - ✅ Page loads without errors
   - ✅ Can navigate through preferences
   - ✅ Can generate itinerary
   - ✅ Modals open/close properly
   - ✅ Responsive on mobile

---

## Step 4: Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain (e.g., `planner.rionidolodge.com`)
3. Follow Vercel's DNS instructions
4. Wait for DNS propagation (5-60 minutes)

---

## Troubleshooting

### ❌ Build Fails

**Check:**
- Are all dependencies in `package.json`?
- Did you push all files to GitHub?
- Check Vercel build logs for specific errors

**Solution:**
```bash
# Test build locally first
npm install
npm run build

# If it works locally, push again
git add .
git commit -m "Fix build issues"
git push
```

### ❌ Blank Page After Deploy

**Check:**
- Browser console for errors (F12)
- Vercel deployment logs

**Common Fix:**
- Ensure `index.html` is in root directory ✅
- Ensure `src/main.jsx` exists ✅
- Check import paths are correct ✅

### ❌ 404 on Refresh

**Solution:** This is already handled by `vercel.json` rewrites ✅

---

## Updating Your Deployment

Every time you push to GitHub, Vercel will **automatically redeploy**:

```bash
# Make changes to your code
git add .
git commit -m "Update features"
git push
```

Vercel will detect the push and rebuild automatically! ✅

---

## Environment Variables Setup

If you're using backend integrations (Google Sheets, EmailJS):

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each variable:
   - Name: `VITE_GOOGLE_SHEETS_URL`
   - Value: Your actual URL
3. Click **"Save"**
4. **Redeploy** for changes to take effect

---

## Production Checklist

Before going live, verify:

- ✅ All API credentials configured
- ✅ Google Sheets endpoint working
- ✅ EmailJS sending emails
- ✅ All links and buttons functional
- ✅ Mobile responsive
- ✅ Fast loading times
- ✅ No console errors
- ✅ Analytics/tracking installed (optional)

---

## Support

Need help? Check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- Your Vercel deployment logs

---

## 🎉 Congratulations!

Your Rio Nido Travel Planner is now live on Vercel!

**Share your URL**: `https://your-project.vercel.app`

