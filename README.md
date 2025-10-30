# 🏔️ Rio Nido Travel Planner

A modern, interactive travel planning application for Rio Nido Lodge guests in the Russian River Valley, Sonoma County.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd files
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 🌐 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect the Vite framework
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 🔧 Configuration

### Backend Integration

Edit `src/components/RioNidoTravelPlanner.jsx` and update these constants:

```javascript
// Google Sheets API endpoint
const GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_SHEETS_API_ENDPOINT_HERE';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceID: 'YOUR_EMAILJS_SERVICE_ID',
  templateID: 'YOUR_EMAILJS_TEMPLATE_ID',
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
};
```

See `BACKEND-SETUP-GUIDE.md` for detailed setup instructions.

## 📁 Project Structure

```
files/
├── src/
│   ├── components/
│   │   └── RioNidoTravelPlanner.jsx  # Main application component
│   ├── App.jsx                        # Root component
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Global styles (Tailwind)
├── public/                            # Static assets
├── index.html                         # HTML template
├── package.json                       # Dependencies
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS config
└── vercel.json                        # Vercel deployment config
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🎨 Features

- ✅ Interactive travel itinerary builder
- ✅ 12+ signature experiences
- ✅ 40+ restaurants and dining options
- ✅ Wine trails and shopping districts
- ✅ Smart zone-based routing
- ✅ Operating hours validation
- ✅ 10% partner discount system
- ✅ Review and rating system
- ✅ Email itinerary to guests
- ✅ Google Maps integration
- ✅ Mobile responsive design

## 📄 License

© 2025 Rio Nido Lodge. All rights reserved.

## 🆘 Support

For issues or questions, please check:
- `QUICK-SETUP-CARD.md` - Quick reference guide
- `BACKEND-SETUP-GUIDE.md` - Backend integration guide
- `CREDENTIALS-FOR-DEVELOPER.md` - API credentials setup

# RioNidoTravel
