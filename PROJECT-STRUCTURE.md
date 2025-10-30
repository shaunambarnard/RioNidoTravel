# 📁 Project Structure

```
rio-nido-travel-planner/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── vite.config.js           # Vite build configuration
│   ├── vercel.json              # Vercel deployment settings
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── eslint.config.js         # ESLint rules
│   └── .gitignore               # Git ignore patterns
│
├── 📄 Entry Points
│   ├── index.html               # Main HTML template
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root React component
│       └── index.css            # Global styles (Tailwind)
│
├── 🎨 Components
│   └── src/components/
│       └── RioNidoTravelPlanner.jsx  # Main application (3270 lines)
│
├── 📦 Static Assets
│   └── public/
│       └── vite.svg             # Favicon
│
├── 📚 Documentation
│   ├── README.md                        # Project overview
│   ├── VERCEL-DEPLOYMENT-GUIDE.md      # Step-by-step deploy guide
│   ├── DEPLOYMENT-CHECKLIST.md         # Pre-deployment checklist
│   ├── BACKEND-SETUP-GUIDE.md          # Backend integration guide
│   ├── QUICK-SETUP-CARD.md             # Quick reference
│   └── CREDENTIALS-FOR-DEVELOPER.md    # API setup instructions
│
└── 🚫 Ignored (not in git)
    ├── node_modules/            # Dependencies (npm install)
    ├── dist/                    # Build output (npm run build)
    └── .vercel/                 # Vercel deployment files
```

## Key Files Explained

### `package.json`
- Lists all dependencies (React, Lucide icons, etc.)
- Defines build scripts (`dev`, `build`, `preview`)
- Uses Vite as the build tool

### `vite.config.js`
- Configures Vite for React
- Sets up code splitting
- Optimizes bundle size

### `vercel.json`
- Configures Vercel deployment
- Sets up SPA routing (fixes 404 on refresh)
- Specifies build commands

### `src/main.jsx`
- Entry point for React
- Renders the App component
- Imports global CSS

### `src/App.jsx`
- Root component
- Wraps RioNidoTravelPlanner

### `src/components/RioNidoTravelPlanner.jsx`
- Main application logic (3270 lines)
- Contains all features:
  - Signature experiences (12)
  - Wine trails (3)
  - Shopping districts (5)
  - Restaurants (40+)
  - Activities, wineries, shops
  - Smart routing algorithm
  - Modal system
  - Redemption tracking
  - Review system

## Dependencies

### Production
- **react** - UI library
- **react-dom** - React DOM rendering
- **lucide-react** - Icon library

### Development
- **vite** - Build tool
- **tailwindcss** - CSS framework
- **eslint** - Code linting
- **autoprefixer** - CSS processing

## Build Process

1. **Development**: `npm run dev`
   - Starts local server on port 3000
   - Hot module replacement enabled
   - Fast refresh

2. **Production**: `npm run build`
   - Bundles code
   - Minifies JavaScript/CSS
   - Optimizes assets
   - Outputs to `dist/` folder

3. **Preview**: `npm run preview`
   - Tests production build locally
   - Runs before deploying

## Deployment Flow

```
Local Code
    ↓
Git Commit
    ↓
GitHub Push
    ↓
Vercel Detects Push
    ↓
Runs: npm install
    ↓
Runs: npm run build
    ↓
Deploys: dist/ folder
    ↓
Live on: https://your-project.vercel.app
```

## Size Estimates

- **Source Code**: ~500 KB
- **node_modules**: ~200 MB (not deployed)
- **Built Bundle**: ~500 KB gzipped
- **Load Time**: < 2 seconds

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Features

### Core Features
- Multi-step itinerary builder
- Smart zone-based routing
- Operating hours validation
- Activity replacement
- Search functionality

### Premium Features
- 12 signature experiences
- 3 wine trails with exclusive perks
- 5 shopping districts
- 40+ restaurants
- 10+ activities

### Backend Integration (Optional)
- Google Sheets tracking
- EmailJS for itineraries
- Google Forms for reviews

### UI/UX
- Fully responsive
- Dark theme (lodge branding)
- Modal-based navigation
- Smooth animations
- Mobile-optimized

## Next Steps

1. **Test Locally**: `npm install && npm run dev`
2. **Build**: `npm run build`
3. **Deploy**: Push to GitHub → Import to Vercel
4. **Configure**: Add environment variables
5. **Launch**: Share your URL!

---

📝 **Note**: This structure is optimized for Vercel deployment with zero configuration needed beyond pushing to GitHub.

