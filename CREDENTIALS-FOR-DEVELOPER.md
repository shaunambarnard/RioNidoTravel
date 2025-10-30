# 🔑 BACKEND CREDENTIALS FOR DEVELOPER

**Rio Nido Lodge Itinerary Builder - Configuration File**

---

## 📋 INSTRUCTIONS FOR DEVELOPER

You need to update **TWO sections** in the `RioNidoTravelPlanner.jsx` file with the credentials below.

**Total time: 2 minutes**

---

## 1️⃣ GOOGLE SHEETS INTEGRATION

### What to Find:
Look for **line ~42** in `RioNidoTravelPlanner.jsx`

### What You'll See:
```javascript
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_API_ENDPOINT_HERE';
```

### Replace With:
```javascript
const GOOGLE_SHEETS_URL = '_______________________________________________';
```

### ✏️ MY ACTUAL GOOGLE SHEETS URL:
```
_________________________________________________________________

(Paste your URL from Google Apps Script deployment here)
```

**Note:** URL should look like:
`https://script.google.com/macros/s/AKfycbz...YOUR_ID.../exec`

---

## 2️⃣ EMAILJS INTEGRATION

### What to Find:
Look for **lines ~45-48** in `RioNidoTravelPlanner.jsx`

### What You'll See:
```javascript
const EMAILJS_CONFIG = {
  serviceID: 'YOUR_EMAILJS_SERVICE_ID',
  templateID: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};
```

### Replace With:
```javascript
const EMAILJS_CONFIG = {
  serviceID: '___________________________',
  templateID: '___________________________',
  publicKey: '___________________________'
};
```

### ✏️ MY ACTUAL EMAILJS CREDENTIALS:

**Service ID:**
```
_________________________________
```
(Should look like: `service_abc1234`)

**Template ID:**
```
_________________________________
```
(Should look like: `template_xyz5678`)

**Public Key:**
```
_________________________________
```
(Should look like: `aBcDeFg1234567`)

---

## ✅ VERIFICATION CHECKLIST

After updating the code, verify:

- [ ] Google Sheets URL is on line ~42
- [ ] Google Sheets URL starts with `https://script.google.com/macros/s/`
- [ ] Google Sheets URL ends with `/exec`
- [ ] EmailJS serviceID starts with `service_`
- [ ] EmailJS templateID starts with `template_`
- [ ] EmailJS publicKey has no prefix
- [ ] All three EmailJS values are filled in
- [ ] No placeholder text remains (no 'YOUR_' text)

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test Google Sheets:
1. Generate an itinerary
2. Click on a business
3. Click "Redeem Offer"
4. Fill in form and submit
5. **Check the Google Sheet** - you should see a new row with the data

### Test EmailJS:
1. Generate an itinerary  
2. Click "Email My Itinerary" button
3. Enter an email address
4. Click "Send My Itinerary"
5. **Check the inbox** - you should receive the formatted itinerary

---

## 🔧 IF SOMETHING DOESN'T WORK

### Google Sheets Not Receiving Data:

**Check:**
- URL is correct (copy/paste from Apps Script)
- Apps Script is deployed as "Web app"
- Access is set to "Anyone"
- Google Sheet has the correct column headers

**Debug:**
- Open browser console (F12)
- Look for console messages starting with ✅ or ❌
- Should see: `✅ Redemption tracked to Google Sheets: [Business Name]`

### Email Not Sending:

**Check:**
- All three EmailJS credentials are correct
- Service ID starts with `service_`
- Template ID starts with `template_`
- Email service is connected in EmailJS dashboard

**Debug:**
- Open browser console (F12)
- Look for console messages
- Should see: `✅ Email sent via EmailJS:` with response

### Still Not Working?

**Fallback behavior:**
- Google Sheets: Data still logs to browser console
- Email: Opens user's email client with pre-filled template

The app will **still work** even if backend isn't configured!

---

## 📞 SUPPORT RESOURCES

**For Google Sheets Issues:**
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- Check Apps Script execution logs

**For EmailJS Issues:**
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- Check EmailJS dashboard for error logs
- Verify email service connection is active

---

## 💡 DEVELOPER NOTES

### File Structure:
```
Line ~42:  Google Sheets URL
Lines ~45-48:  EmailJS configuration
Lines ~95-134:  trackRedemption function (sends to Sheets)
Lines ~136-160:  trackReview function (sends to Sheets)
Lines ~162-250:  sendItineraryEmail function (sends emails)
```

### API Calls:
- Google Sheets: POST requests with `mode: 'no-cors'`
- EmailJS: Uses EmailJS SDK loaded from CDN
- All calls are async with try/catch error handling

### Console Logging:
The app logs all backend activities:
- `🎫` = Redemption triggered
- `⭐` = Review submitted
- `📧` = Email sent
- `✅` = Success
- `❌` = Error

Check browser console for debugging.

---

## 🎉 AFTER SUCCESSFUL DEPLOYMENT

Once everything works:

1. ✅ Remove debug console.log statements (optional)
2. ✅ Test on multiple devices
3. ✅ Test on mobile browsers
4. ✅ Verify Google Sheet is logging properly
5. ✅ Send test email to verify formatting
6. ✅ Go live!

---

## 📊 WHAT THE OWNER WILL SEE

### In Google Sheets:
Every redemption and review appears as a new row with:
- Timestamp
- Guest info
- Business name
- Rating (for reviews)
- Review text (for reviews)

### In Guest's Email:
Formatted itinerary with:
- Personalized greeting
- Day-by-day activities
- Map links
- Partner offers
- Contact information

---

**Everything is ready! Just add the credentials above and deploy.** 🚀

═══════════════════════════════════════════════════════

**Date Created:** _____________________

**Owner Name:** _____________________

**Developer Name:** _____________________

**Deployment Date:** _____________________

═══════════════════════════════════════════════════════
