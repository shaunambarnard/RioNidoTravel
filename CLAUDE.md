# CLAUDE.md - AI Assistant Guide for Rio Nido Travel Planner

**Last Updated:** 2025-11-13
**Project:** Rio Nido Travel Planner
**Repository:** https://github.com/shaunambarnard/RioNidoTravel
**Type:** React SPA (Single Page Application)
**Deployment:** Vercel (Serverless)

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Technology Stack](#technology-stack)
4. [File Structure](#file-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Conventions](#coding-conventions)
7. [Common AI Assistant Tasks](#common-ai-assistant-tasks)
8. [Critical Warnings](#critical-warnings)
9. [Testing & Validation](#testing--validation)
10. [Deployment Process](#deployment-process)
11. [Quick Reference](#quick-reference)

---

## Project Overview

### Purpose
Interactive travel itinerary builder for Rio Nido Lodge guests visiting Russian River Valley, Sonoma County. The app generates personalized 1-3 day itineraries featuring signature experiences, restaurants, wineries, and shopping districts.

### Key Features
- 12 signature curated experiences (kayaking, wine tours, beaches, etc.)
- 3 pre-planned wine trails with exclusive perks
- 5 shopping districts
- 40+ restaurants across 5 geographic zones
- Smart zone-based routing to minimize drive time
- 10% partner discount redemption system
- Review and rating collection
- Email itinerary delivery
- Google Maps integration

### Application Type
- **Frontend:** React 18.3.1 SPA
- **Backend:** Serverless (Google Sheets API + EmailJS)
- **Hosting:** Vercel (free tier)
- **Cost:** $0/month for all services

---

## Codebase Architecture

### High-Level Structure
```
Client-Only React Application
    ↓
Single Main Component (RioNidoTravelPlanner.jsx)
    ↓
Multi-Step Wizard Interface
    ↓
Optional Third-Party API Integration
```

### Critical Architecture Decision
**⚠️ MONOLITHIC COMPONENT:** The entire application logic resides in one 3,253-line component at `src/components/RioNidoTravelPlanner.jsx`. This is the most important file in the codebase.

**Why it matters:**
- All state management (23 useState hooks) is in this file
- All business logic is in this file
- All data structures (restaurants, wineries, etc.) are hardcoded here
- Changes to features almost always involve editing this one file

### Component Hierarchy
```jsx
index.html
  └── src/main.jsx (React bootstrap)
      └── src/App.jsx (root wrapper)
          └── src/components/RioNidoTravelPlanner.jsx (main app)
              ├── SignatureExperienceModal
              ├── BusinessModal
              ├── WineTrailModal
              ├── ShoppingDistrictModal
              ├── RedeemModal
              ├── BookingContactModal
              ├── SearchModal
              └── ItineraryEmailModal
```

### State Management Pattern
- **No Redux/Context:** Uses only React useState hooks
- **23 state variables:** currentStep, preferences, generatedItinerary, modal states, etc.
- **No persistent storage:** All state is ephemeral (lost on refresh)
- **No URL state:** No React Router, no query params

---

## Technology Stack

### Core Dependencies (package.json:12-16)
```json
{
  "react": "^18.3.1",           // UI library
  "react-dom": "^18.3.1",       // DOM rendering
  "lucide-react": "^0.454.0"    // Icon library (12 icons used)
}
```

### Build Tools (package.json:17-31)
- **Vite 5.4.11** - Lightning-fast dev server & build tool
- **Tailwind CSS 3.4.15** - Utility-first CSS framework
- **ESLint 9.13.0** - Code linting
- **PostCSS 8.4.49** - CSS processing
- **Autoprefixer 10.4.20** - Browser compatibility

### Third-Party Integrations (Optional)
- **Google Sheets API** - Track redemptions/reviews
- **EmailJS** - Send itineraries to guests
- **Google Maps** - Navigation links (no API key needed)

### Node.js Requirements
- **Minimum:** Node.js 18+
- **Package Manager:** npm (package-lock.json present)
- **Module Type:** ESM (package.json:5)

---

## File Structure

### Root Directory Layout
```
/home/user/RioNidoTravel/
├── 📄 Configuration (8 files)
│   ├── package.json              # Dependencies & scripts
│   ├── package-lock.json         # Locked versions
│   ├── vite.config.js           # Build config (port 3000, code splitting)
│   ├── vercel.json              # Deployment config (SPA routing)
│   ├── tailwind.config.js       # Custom rio-red palette
│   ├── postcss.config.js        # CSS pipeline
│   ├── eslint.config.js         # Linting rules
│   └── .gitignore               # Git exclusions
│
├── 📄 Application Entry (4 files)
│   ├── index.html               # HTML template
│   ├── src/main.jsx             # React bootstrap
│   ├── src/App.jsx              # Root component
│   └── src/index.css            # Global styles + Tailwind imports
│
├── 🎨 Components (1 file)
│   └── src/components/
│       └── RioNidoTravelPlanner.jsx  # 3,253 lines - ENTIRE APP
│
├── 📦 Static Assets
│   └── public/
│       └── vite.svg             # Favicon
│
├── 📚 Documentation (10 files)
│   ├── README.md                # Quick start
│   ├── CLAUDE.md                # THIS FILE
│   ├── PROJECT-STRUCTURE.md     # File structure details
│   ├── BACKEND-SETUP-GUIDE.md   # Google Sheets + EmailJS
│   ├── VERCEL-DEPLOYMENT-GUIDE.md  # Deployment steps
│   ├── DEPLOYMENT-CHECKLIST.md  # Pre-deploy verification
│   ├── QUICK-SETUP-CARD.md      # 25-min setup guide
│   ├── COLLABORATOR-GUIDE.md    # Git workflow
│   ├── BUILD-FIX-SUMMARY.md     # Historical fixes
│   └── CREDENTIALS-FOR-DEVELOPER.md  # API setup
│
├── 🚫 Git Ignored
│   ├── node_modules/            # ~200MB dependencies
│   ├── dist/                    # Build output
│   └── .vercel/                 # Vercel deployment files
│
└── ⚠️ Orphaned File (TO BE DELETED)
    └── RioNidoTravelPlanner.jsx  # Duplicate at root (170KB)
```

### Key File Reference

| File | Purpose | Line Count | When to Edit |
|------|---------|------------|--------------|
| `src/components/RioNidoTravelPlanner.jsx` | Main app logic | 3,253 | Adding features, fixing bugs |
| `vite.config.js` | Build configuration | 24 | Changing ports, build optimization |
| `tailwind.config.js` | Styling system | 28 | Adding colors, themes |
| `vercel.json` | Deployment config | 7 | SPA routing, redirects |
| `package.json` | Dependencies | 33 | Adding/updating packages |

---

## Development Workflow

### Initial Setup (First Time)
```bash
# Clone repository
git clone https://github.com/shaunambarnard/RioNidoTravel.git
cd RioNidoTravel

# Install dependencies (~1-2 minutes)
npm install

# Start dev server (auto-opens http://localhost:3000)
npm run dev
```

### Daily Development Cycle
```bash
# 1. Pull latest changes
git pull origin main

# 2. Start dev server
npm run dev

# 3. Make changes to src/components/RioNidoTravelPlanner.jsx
# 4. See live updates in browser (Fast Refresh)

# 5. Lint code
npm run lint

# 6. Build production bundle (test before deploying)
npm run build

# 7. Preview production build
npm run preview

# 8. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 9. Vercel auto-deploys within 1-2 minutes
```

### Available npm Scripts (package.json:6-11)
```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Build for production → dist/
npm run preview   # Test production build locally
npm run lint      # Run ESLint (check for errors)
```

### Development Server Details (vite.config.js:7-10)
- **Port:** 3000 (hardcoded)
- **Auto-open:** Browser launches automatically
- **HMR:** Fast Refresh enabled (instant updates)
- **Network access:** Available on local network

---

## Coding Conventions

### React Patterns Used

#### State Management
```jsx
// Pattern: All state at top of component
const [currentStep, setCurrentStep] = useState('experiences');
const [preferences, setPreferences] = useState({
  interests: [],
  travelStyle: 'moderate',
  budget: 'moderate',
  duration: 1,
  guestName: '',
  includeSweets: true,
  includeMarkets: true
});
```

#### Helper Functions
```jsx
// Pattern: Defined inside component (access to state)
const trackRedemption = async (businessData, contactInfo) => { ... };
const trackReview = async (businessData, reviewData) => { ... };
const createMapLink = (business) => { ... };
const createDayRoute = (stops) => { ... };
```

#### Data Structures
```jsx
// Pattern: Hardcoded arrays in component
const signatureExperiences = [ /* 12 experiences */ ];
const wineTrails = [ /* 3 trails */ ];
const restaurants = [ /* 40+ restaurants */ ];
```

### Styling Conventions

#### Tailwind CSS Classes
```jsx
// Pattern: Utility classes inline, no separate CSS files
<div className="bg-gray-900 text-white min-h-screen">
  <button className="bg-rio-red-600 hover:bg-rio-red-700 px-6 py-3 rounded-lg">
    Click Me
  </button>
</div>
```

#### Custom Color Palette (tailwind.config.js:10-22)
```javascript
colors: {
  'rio-red': {
    50: '#fef2f2',
    // ... shades 100-900
    950: '#450a0a',
  }
}
```

**Rule:** Use `rio-red-*` for primary brand colors, default Tailwind grays for secondary.

### Icon Usage (Lucide React)
```jsx
// Pattern: Import specific icons from lucide-react
import { Calendar, MapPin, Star, Clock } from 'lucide-react';

<MapPin className="w-5 h-5 text-rio-red-500" />
```

**12 Icons Used:** Calendar, MapPin, DollarSign, Users, Star, Clock, X, Search, RefreshCw, Wine, RotateCw, Navigation, Phone, Mail

### Code Organization Inside Main Component

**Line-by-line structure:**
```
Lines 1-2:    Import statements
Lines 4-35:   State declarations (23 useState hooks)
Lines 37-50:  Backend configuration constants
Lines 52-120: Backend integration functions
Lines 122+:   Data structures (experiences, wineries, restaurants)
Lines 1500+:  Helper functions (routing, validation)
Lines 2000+:  Modal components (JSX)
Lines 3000+:  Main render (JSX)
```

### Naming Conventions
- **Components:** PascalCase (`RioNidoTravelPlanner`)
- **Functions:** camelCase (`trackRedemption`, `createMapLink`)
- **Constants:** SCREAMING_SNAKE_CASE (`GOOGLE_SHEETS_URL`, `EMAILJS_CONFIG`)
- **State variables:** camelCase (`currentStep`, `generatedItinerary`)
- **CSS classes:** kebab-case (Tailwind: `bg-rio-red-600`)

---

## Common AI Assistant Tasks

### Task 1: Adding a New Restaurant

**File to edit:** `src/components/RioNidoTravelPlanner.jsx`

**Location in file:** Find the `restaurants` array (around line 500-800)

**Template:**
```jsx
{
  name: "Restaurant Name",
  category: "dining",
  cuisine: "Italian",  // Italian, American, Mexican, etc.
  priceRange: "$$",    // $, $$, $$$, $$$$
  zone: "central",     // central, west, south, north, coast
  location: "Guerneville",
  address: "123 Main St, Guerneville, CA 95446",
  phone: "(707) 555-1234",
  website: "https://example.com",
  hours: "Mon-Sun: 11:00 AM - 9:00 PM",
  hasDiscount: true,   // or false
  description: "Brief description of the restaurant",
  signature: "Famous for their wood-fired pizzas",
  reservations: "Recommended",  // or "Not required", "Required"
  timeSlots: ["lunch", "dinner"],  // breakfast, lunch, dinner, any
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=..."
}
```

**Validation:**
1. Ensure `zone` matches existing zones
2. Verify `timeSlots` array is not empty
3. Test that restaurant appears in search

### Task 2: Adding a New Signature Experience

**File to edit:** `src/components/RioNidoTravelPlanner.jsx`

**Location:** Find the `signatureExperiences` array (around line 200-400)

**Template:**
```jsx
{
  id: 13,  // Increment from highest existing ID
  name: "Experience Name",
  description: "Detailed description (2-3 sentences)",
  duration: "3-4 hours",
  zone: "central",
  timeSlots: ["morning", "latemorning"],  // See valid slots below
  highlights: [
    "Highlight 1",
    "Highlight 2",
    "Highlight 3"
  ],
  included: [
    "What's included 1",
    "What's included 2"
  ],
  pricing: "$75 per person",
  difficulty: "Easy",  // Easy, Moderate, Challenging
  bestFor: ["couples", "families"],  // couples, families, solo, groups
  seasonality: "Year-round",  // or specific seasons
  bookingRequired: true,  // or false
  contactInfo: {
    phone: "(707) 555-1234",
    email: "info@example.com",
    website: "https://example.com"
  },
  tips: "Practical tips for guests",
  category: "adventure"  // adventure, relaxation, culture, nature, wine
}
```

**Valid timeSlots:**
- `"morning"` (8-10am)
- `"latemorning"` (10am-12pm)
- `"lunch"` (12-2pm)
- `"afternoon"` (2-5pm)
- `"evening"` (5-7pm)
- `"dinner"` (7-9pm)
- `"any"` (flexible)

### Task 3: Modifying the Color Scheme

**File to edit:** `tailwind.config.js`

**Current custom color:** `rio-red`

**To add a new color:**
```javascript
theme: {
  extend: {
    colors: {
      'rio-red': { /* existing */ },
      'rio-blue': {  // NEW COLOR
        50: '#eff6ff',
        100: '#dbeafe',
        // ... add all shades 200-950
      }
    }
  }
}
```

**To change existing rio-red:**
1. Edit hex values in `tailwind.config.js:10-22`
2. Run `npm run build` to regenerate CSS
3. Test all UI elements for contrast/readability

### Task 4: Adjusting Zones or Drive Times

**File to edit:** `src/components/RioNidoTravelPlanner.jsx`

**Location:** Find the `estimateDriveTime` function (around line 1500-1600)

**Current zones:**
- `central` (Guerneville area)
- `west` (Occidental, Sebastopol)
- `south` (Forestville, Graton)
- `north` (Healdsburg)
- `coast` (Bodega Bay, Jenner)
- `healdsburg` (Healdsburg specific)
- `occidental` (Occidental specific)

**To modify drive times:**
```javascript
const estimateDriveTime = (fromZone, toZone) => {
  const times = {
    'central-to-west': 20,     // minutes
    'central-to-coast': 35,    // Update these values
    // ... add more zone pairs
  };

  const key = `${fromZone}-to-${toZone}`;
  return times[key] || times[`${toZone}-to-${fromZone}`] || 15;
};
```

### Task 5: Fixing Linting Errors

**Run linter:**
```bash
npm run lint
```

**Common ESLint errors:**

1. **Unused variables:**
```jsx
// ❌ Bad
const [unused, setUnused] = useState(null);

// ✅ Good - Remove or use it
// const [unused, setUnused] = useState(null);
```

2. **Missing dependencies in useEffect:**
```jsx
// ❌ Bad
useEffect(() => {
  doSomething(value);
}, []);  // value is missing

// ✅ Good
useEffect(() => {
  doSomething(value);
}, [value]);
```

3. **Prop-types (disabled in this project):**
```javascript
// eslint.config.js has prop-types turned off
'react/prop-types': 'off'
```

### Task 6: Updating Backend Configuration

**File to edit:** `src/components/RioNidoTravelPlanner.jsx`

**Location:** Lines 37-50

**Current placeholders:**
```javascript
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_API_ENDPOINT_HERE';

const EMAILJS_CONFIG = {
  serviceID: 'YOUR_EMAILJS_SERVICE_ID',
  templateID: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};
```

**To configure:**
1. Follow `BACKEND-SETUP-GUIDE.md` for Google Sheets setup
2. Follow EmailJS setup at https://www.emailjs.com
3. Replace placeholders with actual values
4. **DO NOT COMMIT** real credentials to public repos (use env vars instead)

**Better approach (environment variables):**
```javascript
const GOOGLE_SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL || 'PLACEHOLDER';
const EMAILJS_CONFIG = {
  serviceID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'PLACEHOLDER',
  templateID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'PLACEHOLDER',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'PLACEHOLDER'
};
```

Then create `.env.local`:
```bash
VITE_GOOGLE_SHEETS_URL=https://script.google.com/...
VITE_EMAILJS_SERVICE_ID=service_xxx
VITE_EMAILJS_TEMPLATE_ID=template_xxx
VITE_EMAILJS_PUBLIC_KEY=xxx
```

**Note:** `.env.local` is already in `.gitignore`

### Task 7: Debugging Build Failures

**Common issues:**

1. **JSX syntax errors:**
```bash
npm run build
# Error: Unexpected token '<'
```
**Fix:** Check for unclosed tags, missing fragments

2. **Module not found:**
```bash
# Error: Cannot find module 'lucide-react'
```
**Fix:** `npm install` (reinstall dependencies)

3. **Out of memory:**
```bash
# Error: JavaScript heap out of memory
```
**Fix:** Increase Node memory
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

4. **ESLint blocking build:**
```bash
# Warning: ESLint errors in build
```
**Fix:** Run `npm run lint` and fix errors, or temporarily disable:
```javascript
// vite.config.js - add to plugins
plugins: [
  react({
    jsxRuntime: 'automatic'
  })
],
// Note: Don't disable linting permanently
```

---

## Critical Warnings

### ⚠️ WARNING 1: Monolithic Component
**Issue:** The entire app is one 3,253-line component.

**Impact:**
- Hard to debug
- Difficult to test
- Risky to refactor
- Merge conflicts likely

**Recommendation for AI:**
- Make small, focused changes
- Test immediately after each change
- Use search (Ctrl+F) to find sections
- Comment your changes clearly
- Consider suggesting refactoring to user

### ⚠️ WARNING 2: Duplicate File at Root
**File:** `/home/user/RioNidoTravel/RioNidoTravelPlanner.jsx` (root level)

**Issue:** This is a duplicate of `src/components/RioNidoTravelPlanner.jsx`

**Action:** DELETE the root-level file. It's orphaned and causes confusion.

```bash
rm /home/user/RioNidoTravel/RioNidoTravelPlanner.jsx
git add .
git commit -m "Remove duplicate RioNidoTravelPlanner.jsx from root"
git push origin main
```

### ⚠️ WARNING 3: No Testing Framework
**Issue:** No automated tests (Jest, Vitest, React Testing Library).

**Impact:**
- Breaking changes go unnoticed
- Regression risks high
- Manual testing only

**Recommendation for AI:**
- Suggest adding Vitest before major refactors
- Perform thorough manual testing
- Test in both dev and production builds
- Check all user flows after changes

### ⚠️ WARNING 4: Hardcoded Data
**Issue:** All restaurants, wineries, experiences are hardcoded in JSX.

**Impact:**
- Non-technical users can't update data
- Changes require code deployment
- Risk of syntax errors when editing

**Recommendation for AI:**
- When adding data, validate JSON structure
- Use consistent formatting
- Test that new entries appear in search
- Consider suggesting data migration to JSON files

### ⚠️ WARNING 5: No State Persistence
**Issue:** All state is lost on page refresh (no localStorage, no URL state).

**Impact:**
- Users lose itinerary if they refresh
- Can't share itineraries via URL
- No browser back button support

**Recommendation for AI:**
- Warn users about this limitation
- Consider adding localStorage for itineraries
- Add "Email Itinerary" as workaround

### ⚠️ WARNING 6: API Keys in Code
**Issue:** EmailJS public key and Google Sheets URL are in source code.

**Current practice:** Acceptable for public keys, but not ideal.

**Recommendation for AI:**
- Suggest environment variables for sensitive configs
- Add `.env.local` support
- Update docs if implementing env vars

### ⚠️ WARNING 7: No Error Boundaries
**Issue:** Component crashes will break entire app (white screen).

**Recommendation for AI:**
- Suggest adding React Error Boundary
- Add try-catch in async functions
- Log errors to console for debugging

### ⚠️ WARNING 8: Vercel SPA Routing Dependency
**File:** `vercel.json`

**Critical config:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Warning:** Without this, direct URL navigation (refresh) causes 404 errors.

**Action:** Never delete `vercel.json`. If moving to different host, replicate this routing.

---

## Testing & Validation

### Manual Testing Checklist

#### Before Every Commit
- [ ] Run `npm run lint` (no errors)
- [ ] Run `npm run build` (successful)
- [ ] Run `npm run preview` (loads correctly)
- [ ] Test in Chrome/Firefox/Safari
- [ ] Test on mobile (responsive design)

#### Feature Testing (After Major Changes)
- [ ] **Step 1 (Experiences):** Browse signature experiences carousel
- [ ] **Step 2 (Generate):** Create 1-day, 2-day, 3-day itineraries
- [ ] **Step 3 (Itinerary):** View daily schedules
- [ ] **Modals:** Open business details, wine trails, shopping districts
- [ ] **Search:** Search for restaurants, wineries, experiences
- [ ] **Redemption:** Click "Redeem 10% Offer" (opens contact form)
- [ ] **Review:** Leave review with star rating
- [ ] **Email:** Send itinerary via email (if EmailJS configured)
- [ ] **Maps:** Click "Get Directions" (opens Google Maps)

#### Performance Testing
- [ ] Lighthouse score > 90 (run in Chrome DevTools)
- [ ] Bundle size < 600KB gzipped
- [ ] First Contentful Paint < 1.5s
- [ ] No console errors in production build
- [ ] Smooth animations on mobile

#### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible (test with VoiceOver/NVDA)
- [ ] Color contrast meets WCAG AA (use axe DevTools)
- [ ] All images have alt text
- [ ] Focus indicators visible

### Automated Testing (Future Recommendation)

**Suggested setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Example test file (future):**
```javascript
// src/components/RioNidoTravelPlanner.test.jsx
import { render, screen } from '@testing-library/react';
import RioNidoTravelPlanner from './RioNidoTravelPlanner';

test('renders signature experiences carousel', () => {
  render(<RioNidoTravelPlanner />);
  expect(screen.getByText(/Signature Experiences/i)).toBeInTheDocument();
});
```

---

## Deployment Process

### Vercel Auto-Deployment (Current Setup)

**Trigger:** Push to `main` branch

**Flow:**
```
1. git push origin main
   ↓
2. Vercel webhook triggered
   ↓
3. Vercel clones repo
   ↓
4. Runs: npm install
   ↓
5. Runs: npm run build
   ↓
6. Deploys: dist/ folder to CDN
   ↓
7. Live in 1-2 minutes
```

**Monitoring:**
- Check Vercel dashboard: https://vercel.com/dashboard
- Build logs available in Vercel UI
- Deployment status notifications

### Manual Deployment (Alternative)

**Via Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com
2. Click "New Project"
3. Import from GitHub
4. Select `shaunambarnard/RioNidoTravel`
5. Framework preset: Vite
6. Build command: `npm run build`
7. Output directory: `dist`
8. Click "Deploy"

### Pre-Deployment Checklist (CRITICAL)

**See:** `DEPLOYMENT-CHECKLIST.md` for full list

**Minimum checks:**
1. ✅ Run `npm run build` (no errors)
2. ✅ Run `npm run preview` (test production build)
3. ✅ Test all user flows manually
4. ✅ Verify no console errors
5. ✅ Check mobile responsiveness
6. ✅ Ensure `vercel.json` exists
7. ✅ Confirm `.env.local` not committed
8. ✅ Review git diff before pushing

### Rollback Procedure (If Deploy Fails)

**Option 1: Revert in Vercel Dashboard**
1. Go to Vercel project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Option 2: Git Revert**
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys reverted version
```

**Option 3: Git Reset (Dangerous)**
```bash
git reset --hard HEAD~1
git push --force origin main
# Use only if revert fails
```

---

## Quick Reference

### File Locations (Most Commonly Edited)

| What You Need | File Path |
|---------------|-----------|
| Main app logic | `src/components/RioNidoTravelPlanner.jsx` |
| Add restaurant | Line ~500-800 in above file |
| Add experience | Line ~200-400 in above file |
| Backend config | Line ~37-50 in above file |
| Styling colors | `tailwind.config.js` |
| Build settings | `vite.config.js` |
| Dependencies | `package.json` |
| Deployment config | `vercel.json` |

### Command Cheat Sheet

```bash
# Setup
npm install                    # Install dependencies
npm run dev                    # Start dev server (port 3000)

# Development
npm run lint                   # Check for errors
npm run build                  # Build for production
npm run preview                # Test production build

# Git workflow
git status                     # Check changes
git add .                      # Stage all changes
git commit -m "message"        # Commit with message
git push origin main           # Push to GitHub (triggers deploy)

# Troubleshooting
rm -rf node_modules package-lock.json && npm install  # Clean install
npm run build -- --debug       # Verbose build output
git log --oneline -10          # View recent commits
```

### Important Constants

| Constant | Value | Location |
|----------|-------|----------|
| Dev server port | 3000 | `vite.config.js:8` |
| Build output | `dist/` | `vite.config.js:12` |
| Primary color | rio-red | `tailwind.config.js:10` |
| React version | 18.3.1 | `package.json:13` |
| Node requirement | 18+ | `package.json` |

### Data Structure Counts

| Type | Count | Search Pattern |
|------|-------|----------------|
| Signature Experiences | 12 | `signatureExperiences` array |
| Wine Trails | 3 | `wineTrails` array |
| Shopping Districts | 5 | `shoppingDistricts` array |
| Restaurants | 40+ | `category: "dining"` |
| State Variables | 23 | `useState` calls |
| Zones | 7 | central, west, south, north, coast, healdsburg, occidental |

### Zone Definitions

| Zone | Cities/Areas | Drive Time from Lodge |
|------|--------------|----------------------|
| central | Guerneville, Rio Nido, Monte Rio | 0-5 min |
| west | Occidental, Sebastopol | 15-25 min |
| south | Forestville, Graton | 10-20 min |
| north | Healdsburg | 25-35 min |
| coast | Bodega Bay, Jenner, Duncans Mills | 30-40 min |

### Time Slot Definitions

| Slot | Time Range | Use For |
|------|------------|---------|
| morning | 8:00 AM - 10:00 AM | Breakfast, early activities |
| latemorning | 10:00 AM - 12:00 PM | Morning activities |
| lunch | 12:00 PM - 2:00 PM | Lunch dining |
| afternoon | 2:00 PM - 5:00 PM | Afternoon activities |
| evening | 5:00 PM - 7:00 PM | Early dinner |
| dinner | 7:00 PM - 9:00 PM | Dinner dining |
| any | Flexible | All-day activities |

### Common Search Terms (For Finding Code)

| Looking for | Search in file |
|-------------|----------------|
| Restaurant list | `const restaurants = [` |
| Signature experiences | `const signatureExperiences = [` |
| Wine trails | `const wineTrails = [` |
| Drive time logic | `estimateDriveTime` |
| Map link generation | `createMapLink` |
| Redemption tracking | `trackRedemption` |
| Email sending | `EMAILJS_CONFIG` |
| Backend API | `GOOGLE_SHEETS_URL` |
| State management | `useState(` |
| Modal components | `Modal` (capitalized) |

### External Resources

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/shaunambarnard/RioNidoTravel |
| Vercel Dashboard | https://vercel.com/dashboard |
| Vite Docs | https://vitejs.dev |
| React Docs | https://react.dev |
| Tailwind Docs | https://tailwindcss.com |
| Lucide Icons | https://lucide.dev |
| EmailJS Setup | https://www.emailjs.com |
| Google Sheets API | https://developers.google.com/sheets/api |

---

## AI Assistant Best Practices

### When Making Changes

1. **Always read the file first:**
   ```bash
   # Use Read tool before Edit tool
   Read: src/components/RioNidoTravelPlanner.jsx
   ```

2. **Make small, focused changes:**
   - One feature at a time
   - Test immediately
   - Commit frequently

3. **Preserve existing structure:**
   - Don't reformat entire file
   - Match existing code style
   - Keep comments intact

4. **Test before and after:**
   ```bash
   npm run lint && npm run build && npm run preview
   ```

5. **Document what you changed:**
   ```bash
   git commit -m "Add new restaurant: The Lodge Kitchen

   - Added to restaurants array
   - Category: dining, cuisine: American
   - Zone: central, hasDiscount: true"
   ```

### When Suggesting Improvements

1. **Acknowledge the monolith:**
   - "I see the app uses a single component architecture..."
   - "While this works, consider refactoring for maintainability..."

2. **Provide incremental steps:**
   - Don't suggest rewriting everything at once
   - Break improvements into phases
   - Prioritize by impact/effort

3. **Reference existing docs:**
   - Point to `BACKEND-SETUP-GUIDE.md` for API setup
   - Link to `DEPLOYMENT-CHECKLIST.md` before deploys
   - Use `PROJECT-STRUCTURE.md` for orientation

4. **Explain trade-offs:**
   - "Adding Redux would improve state management but increase bundle size..."
   - "Testing adds development time but catches bugs earlier..."

### When Debugging

1. **Check common issues first:**
   - Linting errors: `npm run lint`
   - Build errors: `npm run build`
   - Missing dependencies: `npm install`
   - Duplicate root file: Check if orphaned JSX exists

2. **Use browser DevTools:**
   - Console for runtime errors
   - Network tab for API calls
   - React DevTools for state inspection

3. **Verify environment:**
   - Node version: `node --version` (need 18+)
   - npm version: `npm --version`
   - Git branch: `git branch` (should be on main)

4. **Check deployment logs:**
   - Vercel dashboard for build logs
   - GitHub Actions (if configured)
   - Browser console in production

### When Explaining Code

1. **Reference line numbers:**
   - "The restaurants array starts at line 547..."
   - "The trackRedemption function at line 56..."

2. **Use the existing architecture:**
   - "This app uses React hooks for state management..."
   - "Styling is done with Tailwind utility classes..."

3. **Explain in context:**
   - "This itinerary builder generates daily schedules for 1-3 day trips..."
   - "The zone system minimizes driving by grouping nearby locations..."

4. **Provide examples:**
   - Show before/after code
   - Include expected output
   - Link to documentation

---

## Maintenance Notes

### Known Technical Debt

1. **Monolithic component (3,253 lines)**
   - Should be split into ~15 smaller components
   - Estimated effort: 16-24 hours
   - Risk: High (breaking changes)

2. **No automated testing**
   - Should add Vitest + React Testing Library
   - Estimated effort: 8-12 hours
   - Risk: Low (additive)

3. **Hardcoded data**
   - Should move to JSON files or CMS
   - Estimated effort: 4-6 hours
   - Risk: Medium (data migration)

4. **No state persistence**
   - Should add localStorage or URL state
   - Estimated effort: 2-4 hours
   - Risk: Low (additive)

5. **Environment variables**
   - Should use .env for API configs
   - Estimated effort: 1 hour
   - Risk: Low (configuration)

### Future Enhancements (User Requested)

- [ ] User authentication for saving itineraries
- [ ] Admin dashboard for managing businesses
- [ ] Real-time availability checking
- [ ] Multi-language support (Spanish)
- [ ] Print-friendly itinerary view
- [ ] Progressive Web App (PWA) for offline use
- [ ] Integration with booking platforms
- [ ] Analytics dashboard for business partners

### Changelog

**2025-11-13:** Created CLAUDE.md for AI assistant guidance
**2024-XX-XX:** Fixed JSX syntax errors (see BUILD-FIX-SUMMARY.md)
**2024-XX-XX:** Initial project setup and Vercel deployment

---

## Contact & Support

**Repository Owner:** Shauna M. Barnard
**GitHub:** https://github.com/shaunambarnard/RioNidoTravel
**Deployment:** Vercel (auto-deploy on push)

For questions or issues:
1. Check existing documentation (10 .md files)
2. Review git commit history: `git log`
3. Search issues on GitHub repo
4. Test locally before deploying: `npm run preview`

---

**End of CLAUDE.md** - Last updated: 2025-11-13
