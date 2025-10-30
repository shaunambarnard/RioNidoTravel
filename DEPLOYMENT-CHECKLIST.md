# ✅ Deployment Checklist

## Pre-Deployment Checklist

### Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` - app loads without errors
- [ ] Test all major features:
  - [ ] Preferences selection works
  - [ ] Signature experiences load
  - [ ] Itinerary generation works
  - [ ] Modals open/close properly
  - [ ] Search functionality works
  - [ ] Replace activity feature works
  - [ ] Email itinerary modal works
- [ ] Run `npm run build` successfully
- [ ] Test production build: `npm run preview`

### Code Quality
- [ ] No console errors in browser
- [ ] All imports are correct
- [ ] All images/assets exist
- [ ] Responsive on mobile/tablet/desktop

### Git Repository
- [ ] All files committed
- [ ] `.gitignore` excludes node_modules and dist
- [ ] README.md is complete
- [ ] Repository pushed to GitHub

### Vercel Configuration
- [ ] `vercel.json` exists
- [ ] `package.json` has correct build scripts
- [ ] All dependencies listed in package.json

---

## Deployment Steps

### Step 1: GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/rio-nido-travel-planner.git
git push -u origin main
```

### Step 2: Vercel Deployment
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure build settings (auto-detected)
4. Deploy

### Step 3: Post-Deployment
- [ ] Visit deployed URL
- [ ] Test all features on live site
- [ ] Check mobile responsiveness
- [ ] Verify no errors in browser console

---

## Backend Integration (Optional)

If enabling backend features:

### Google Sheets Setup
- [ ] Create Google Apps Script
- [ ] Deploy as web app
- [ ] Copy deployment URL
- [ ] Add to Vercel environment variables:
  ```
  VITE_GOOGLE_SHEETS_URL=your_url_here
  ```

### EmailJS Setup
- [ ] Create EmailJS account
- [ ] Create email service
- [ ] Create email template
- [ ] Get public key
- [ ] Add to Vercel environment variables:
  ```
  VITE_EMAILJS_SERVICE_ID=your_id
  VITE_EMAILJS_TEMPLATE_ID=your_template_id
  VITE_EMAILJS_PUBLIC_KEY=your_key
  ```

### Google Forms Setup (Reviews)
- [ ] Create Google Form for reviews
- [ ] Get form ID from URL
- [ ] Add to Vercel environment variables:
  ```
  VITE_GOOGLE_FORM_ID=your_form_id
  ```

---

## Post-Launch Checklist

### Functionality Testing
- [ ] All links work
- [ ] Google Maps integration works
- [ ] Phone call links work (`tel:` links)
- [ ] Email links work (`mailto:` links)
- [ ] All modals function correctly

### Performance
- [ ] Page load time < 3 seconds
- [ ] No memory leaks
- [ ] Images optimized
- [ ] Lighthouse score > 90

### SEO & Analytics (Optional)
- [ ] Add meta descriptions
- [ ] Add Open Graph tags
- [ ] Install Google Analytics
- [ ] Add favicon

### Documentation
- [ ] User guide created
- [ ] Admin documentation
- [ ] Backend setup documented

---

## Troubleshooting Common Issues

### Build Fails
```bash
# Test locally first
npm install
npm run build

# Check for errors
npm run lint
```

### White Screen After Deploy
- Check browser console (F12)
- Verify all imports are correct
- Check Vercel deployment logs

### 404 on Page Refresh
- Verify `vercel.json` rewrites are configured ✅

### Environment Variables Not Working
- Ensure they start with `VITE_`
- Redeploy after adding variables
- Check Vercel logs

---

## Success Metrics

After deployment, monitor:
- ✅ Zero deployment errors
- ✅ Fast load times (< 3s)
- ✅ No runtime errors
- ✅ High user engagement
- ✅ Positive feedback

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🎉 You're Ready to Deploy!

When all checkboxes are complete, proceed with deployment.

