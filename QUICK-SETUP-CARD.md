# ⚡ QUICK SETUP REFERENCE CARD

Print this and follow along as you set up!

---

## ✅ GOOGLE SHEETS SETUP (15 min)

### 1. CREATE SHEET (2 min)
- [ ] Go to sheets.google.com
- [ ] Click "Blank"
- [ ] Name: "Rio Nido Redemptions & Reviews"
- [ ] Add headers in Row 1: Timestamp | Type | Guest Name | Business Name | Category | Location | Email | Phone | Rating | Review Text | Wants Itinerary

### 2. APPS SCRIPT (5 min)
- [ ] Extensions → Apps Script
- [ ] Delete existing code
- [ ] Paste script from BACKEND-SETUP-GUIDE.md
- [ ] Save (name: "Rio Nido Data Tracker")

### 3. DEPLOY (7 min)
- [ ] Click "Deploy" → "New deployment"
- [ ] Click gear icon → "Web app"
- [ ] Execute as: Me
- [ ] Access: Anyone
- [ ] Click "Deploy"
- [ ] Authorize (click Advanced → Go to app → Allow)
- [ ] **COPY THE URL** (ends with /exec)

### 4. SAVE URL
- [ ] Write URL in MY-CREDENTIALS-FORM.md
- [ ] Give to developer

✅ **GOOGLE SHEETS DONE!**

---

## ✅ EMAILJS SETUP (10 min)

### 1. ACCOUNT (2 min)
- [ ] Go to emailjs.com
- [ ] Sign up with Google
- [ ] Log in

### 2. EMAIL SERVICE (3 min)
- [ ] Email Services → Add New Service
- [ ] Choose Gmail/Outlook/Yahoo
- [ ] Connect Account
- [ ] Sign in and Allow
- [ ] **COPY SERVICE ID** (starts with service_)

### 3. TEMPLATE (3 min)
- [ ] Email Templates → Create New Template
- [ ] Name: "Rio Nido Itinerary"
- [ ] Subject: Your Rio Nido Lodge Itinerary - {{duration}} Days in Russian River Valley
- [ ] Content: Use template from BACKEND-SETUP-GUIDE.md
- [ ] Save
- [ ] **COPY TEMPLATE ID** (starts with template_)

### 4. PUBLIC KEY (1 min)
- [ ] Account → API Keys section
- [ ] **COPY PUBLIC KEY**

### 5. TEST (1 min - optional)
- [ ] Email Templates → Your template
- [ ] Test It
- [ ] Fill in test data
- [ ] Send to your email
- [ ] Check inbox

### 6. SAVE CREDENTIALS
- [ ] Write all three IDs in MY-CREDENTIALS-FORM.md
- [ ] Give to developer

✅ **EMAILJS DONE!**

---

## 📋 WHAT TO GIVE YOUR DEVELOPER

Hand them these 3 files:

1. ✅ **RioNidoTravelPlanner.jsx** (the code)
2. ✅ **CREDENTIALS-FOR-DEVELOPER.md** (with your URLs filled in)
3. ✅ **COMPLETE-REACT-VERSION-HANDOFF.md** (deployment guide)

---

## 🧪 TESTING CHECKLIST

After deployment, test:

### Google Sheets:
- [ ] Generate itinerary
- [ ] Click business → Redeem Offer
- [ ] Submit form
- [ ] **Check Google Sheet for new row**

### Email:
- [ ] Generate itinerary
- [ ] Click "Email My Itinerary"
- [ ] Enter email
- [ ] Send
- [ ] **Check inbox for email**

---

## 🆘 QUICK TROUBLESHOOTING

**Google Sheets not working?**
→ Check Apps Script deployment is "Anyone" access
→ Check URL ends with /exec
→ Look at browser console (F12) for errors

**Email not working?**
→ Check all 3 credentials are correct
→ Check email service is connected in EmailJS
→ Look at browser console (F12) for errors

**Still not working?**
→ App still works! Data goes to console
→ Email opens mailto instead

---

## 📱 SUPPORT LINKS

**Google Sheets:**
https://developers.google.com/apps-script

**EmailJS:**
https://www.emailjs.com/docs

---

## ⏱️ TIME ESTIMATE

| Task | Time |
|------|------|
| Google Sheets | 15 min |
| EmailJS | 10 min |
| **TOTAL** | **25 min** |

---

## 💰 COSTS

| Service | Cost |
|---------|------|
| Google Sheets | FREE |
| EmailJS | FREE (200/month) |
| **TOTAL** | **$0/month** |

---

✅ **YOU CAN DO THIS!** Just follow the steps in order. 🎉

---

**Need detailed instructions?** → See BACKEND-SETUP-GUIDE.md

**Need to fill in credentials?** → See MY-CREDENTIALS-FORM.md

**Ready to give to developer?** → See CREDENTIALS-FOR-DEVELOPER.md
