# 🚀 BACKEND INTEGRATION SETUP GUIDE

## ✅ What's Been Added

Your itinerary builder now includes TWO backend features:

1. **📊 Google Sheets Tracking** - Captures redemptions & reviews
2. **📧 Email Integration** - Sends itineraries automatically

---

## 📦 Updated File

**[RioNidoTravelPlanner.jsx](computer:///mnt/user-data/outputs/RioNidoTravelPlanner.jsx)** - 3,269 lines

**What's New:**
- ✅ Google Sheets API integration (redemptions + reviews)
- ✅ EmailJS integration for sending itineraries
- ✅ Formatted email templates
- ✅ Error handling and fallbacks
- ✅ Loading states and user feedback

---

## 🎯 SETUP OVERVIEW

You need to set up:
1. **Google Sheets** (15 minutes) - Free forever
2. **EmailJS** (10 minutes) - Free up to 200 emails/month

**Total setup time: 25 minutes**
**Cost: $0** (both have free tiers that are perfect for your use case)

---

# 📊 PART 1: GOOGLE SHEETS SETUP

## What You'll Track

Every redemption and review will log to a Google Sheet with:
- Timestamp
- Guest name
- Business name
- Category (restaurant, winery, etc.)
- Email/phone (if provided)
- Star rating (for reviews)
- Review text (for reviews)

---

## Step-by-Step Setup

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create new sheet
3. Name it: **"Rio Nido Redemptions & Reviews"**

### Step 2: Set Up Column Headers

In Row 1, add these headers:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Type | Guest Name | Business Name | Category | Location | Email | Phone | Rating | Review Text | Wants Itinerary |

### Step 3: Create Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code
3. **Copy and paste this ENTIRE script:**

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Prepare the row data
    const row = [
      data.timestamp || new Date().toISOString(),
      data.type || '',
      data.guestName || 'Anonymous',
      data.businessName || '',
      data.businessCategory || '',
      data.businessLocation || '',
      data.guestEmail || '',
      data.guestPhone || '',
      data.rating || '',
      data.reviewText || '',
      data.wantsItinerary || ''
    ];
    
    // Append the row
    sheet.appendRow(row);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (disk icon)
5. Name the project: **"Rio Nido Data Tracker"**

### Step 4: Deploy the Script

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **"Web app"**
4. Configure:
   - **Description:** "Rio Nido itinerary data collection"
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Click **Deploy**
6. Click **Authorize access**
7. Choose your Google account
8. Click **Advanced** → **Go to Rio Nido Data Tracker (unsafe)**
9. Click **Allow**
10. **COPY THE WEB APP URL** - It looks like:
    ```
    https://script.google.com/macros/s/ABC123.../exec
    ```

### Step 5: Add URL to Your Code

1. Open your **RioNidoTravelPlanner.jsx** file
2. Find line ~42 (near the top):
   ```javascript
   const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_API_ENDPOINT_HERE';
   ```
3. Replace with your URL:
   ```javascript
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
   ```
4. Save the file

### ✅ Testing Google Sheets

After deploying your app:
1. Generate an itinerary
2. Click a business
3. Click "Redeem Offer"
4. Enter email (optional)
5. Click "🎫 Redeem Offer"
6. Check your Google Sheet - you should see a new row!

---

# 📧 PART 2: EMAILJS SETUP

## What It Does

When guests click "Email My Itinerary" and enter their email, they'll receive a beautifully formatted email with:
- Their complete 3-day itinerary
- All restaurant and activity details
- Map links for every location
- Exclusive partner offers
- Rio Nido Lodge contact info

---

## Step-by-Step Setup

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com)
2. Click **"Sign Up Free"**
3. Sign up with Google or email
4. Confirm your email address

### Step 2: Connect Your Email Service

1. In EmailJS dashboard, click **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal)
   - **Outlook**
   - Or any other email service
4. Click **"Connect Account"**
5. Follow the authorization steps
6. **Copy the Service ID** (looks like: `service_abc123`)

### Step 3: Create Email Template

1. Click **"Email Templates"** in the sidebar
2. Click **"Create New Template"**
3. **Template Name:** "Rio Nido Itinerary"
4. **Template Content:**

```
Subject: Your Rio Nido Lodge Itinerary - {{duration}} Days in Russian River Valley

Hi {{guest_name}}!

Here's your personalized {{duration}}-day Russian River Valley itinerary:

{{itinerary_details}}

Questions? Call us at (707) 869-0821 or email reservations@rionidolodge.com

See you soon!
The Rio Nido Lodge Team
```

5. Click **"Save"**
6. **Copy the Template ID** (looks like: `template_abc123`)

### Step 4: Get Your Public Key

1. Click **"Account"** in the sidebar
2. Find **"API Keys"** section
3. **Copy your Public Key** (looks like: `abc123XYZ`)

### Step 5: Add Credentials to Your Code

1. Open your **RioNidoTravelPlanner.jsx** file
2. Find lines ~45-48:
   ```javascript
   const EMAILJS_CONFIG = {
     serviceID: 'YOUR_EMAILJS_SERVICE_ID',
     templateID: 'YOUR_EMAILJS_TEMPLATE_ID',
     publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
   };
   ```
3. Replace with your values:
   ```javascript
   const EMAILJS_CONFIG = {
     serviceID: 'service_abc123',      // Your Service ID
     templateID: 'template_abc123',    // Your Template ID
     publicKey: 'abc123XYZ'            // Your Public Key
   };
   ```
4. Save the file

### ✅ Testing Email Integration

After deploying your app:
1. Generate an itinerary
2. Click **"Email My Itinerary"** button
3. Enter your email
4. Click **"📧 Send My Itinerary"**
5. Check your inbox - you should receive the email!

---

# 🔄 FALLBACK BEHAVIOR

If either service isn't set up, the app still works:

### Without Google Sheets:
- ✅ Redemptions still work
- ✅ Reviews still work
- ❌ Data goes to console logs only (not saved permanently)

### Without EmailJS:
- ✅ Email button still works
- ✅ Opens user's default email client
- ✅ Pre-fills itinerary in email body
- ❌ Doesn't send automatically

**So you can deploy NOW and add these later!**

---

# 📊 DATA YOU'LL COLLECT

## Example Redemption Row:
| Timestamp | Type | Guest Name | Business Name | Category | Location | Email | Phone | Rating | Review | Wants Itinerary |
|---|---|---|---|---|---|---|---|---|---|---|
| 2025-10-29 14:23:15 | redemption | Sarah Johnson | Graze Restaurant | dining | Monte Rio | sarah@email.com | (555) 123-4567 | | | Yes |

## Example Review Row:
| Timestamp | Type | Guest Name | Business Name | Category | Location | Email | Phone | Rating | Review | Wants Itinerary |
|---|---|---|---|---|---|---|---|---|---|---|
| 2025-10-29 16:45:32 | review | Sarah Johnson | Graze Restaurant | dining | Monte Rio | sarah@email.com | (555) 123-4567 | 5 | Amazing food! | |

---

# 💰 COSTS

## Google Sheets
- **Free forever**
- Unlimited rows (up to 10 million)
- Unlimited API calls
- **Total cost: $0**

## EmailJS
- **Free tier: 200 emails/month**
- Perfect for most small businesses
- Upgrade: $10/month for 1,000 emails
- **Your cost: $0/month (free tier)**

---

# 🔧 UPDATING AFTER SETUP

### To Update Google Sheets URL:
1. Edit line ~42 in RioNidoTravelPlanner.jsx
2. Save and redeploy

### To Update EmailJS Config:
1. Edit lines ~45-48 in RioNidoTravelPlanner.jsx
2. Save and redeploy

### To Add More Columns to Google Sheet:
1. Add column headers in your Google Sheet
2. Update the Apps Script to include new fields
3. Update the `trackRedemption` or `trackReview` functions

---

# 📈 ANALYTICS YOU CAN BUILD

With this data in Google Sheets, you can:

### Track Business Performance:
- Which businesses get the most redemptions?
- What's the average rating per business?
- Which categories are most popular?

### Understand Guest Behavior:
- How many guests redeem offers?
- What percentage leave reviews?
- Which days are busiest?

### Calculate ROI:
- Track redemptions per partner
- Calculate commission/referral fees
- Measure program success

---

# 🎯 DEPLOYMENT CHECKLIST

Before going live:

- [ ] Set up Google Sheet with headers
- [ ] Create and deploy Apps Script
- [ ] Copy Google Sheets URL to code (line ~42)
- [ ] Create EmailJS account
- [ ] Connect email service
- [ ] Create email template
- [ ] Copy EmailJS credentials to code (lines ~45-48)
- [ ] Deploy to Vercel
- [ ] Test redemption (check Google Sheet)
- [ ] Test review (check Google Sheet)
- [ ] Test email (check inbox)
- [ ] 🎉 Go live!

---

# ❓ TROUBLESHOOTING

### Google Sheets Not Receiving Data:

**Check:**
1. Apps Script is deployed as "Web app"
2. Access is set to "Anyone"
3. URL in code matches deployment URL exactly
4. Check browser console for errors

**Test the URL directly:**
```bash
curl -X POST YOUR_GOOGLE_SHEETS_URL \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"test","type":"test","guestName":"Test Guest"}'
```

Then check your Google Sheet for a new row.

### Emails Not Sending:

**Check:**
1. EmailJS credentials are correct
2. Email service is connected and active
3. Template ID matches your template
4. Check EmailJS dashboard for error logs
5. Check browser console for errors

**Test in EmailJS dashboard:**
- Go to "Email Templates"
- Click your template
- Click "Test It"
- Send a test email

---

# 🎊 YOU'RE DONE!

Your itinerary builder now has:
- ✅ Full redemption tracking
- ✅ Review collection system
- ✅ Automatic email delivery
- ✅ All data in Google Sheets
- ✅ Free forever (with free tiers)

**Deploy and start collecting data!** 🚀

---

## 📞 NEED HELP?

Common issues and solutions are in the troubleshooting section above. The setup is straightforward - just follow the steps in order!

**Both services have excellent documentation:**
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [EmailJS Documentation](https://www.emailjs.com/docs/)
