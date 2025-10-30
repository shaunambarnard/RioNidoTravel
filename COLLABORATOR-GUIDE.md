# Owner Guide – Clone, Edit, and Push Updates

Repository: `https://github.com/shaunambarnard/RioNidoTravel.git`

## 1) Clone and open the project
```bash
# Clone your own repo
git clone https://github.com/shaunambarnard/RioNidoTravel.git
cd RioNidoTravel
```

## 2) Install and run locally
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 3) Make your code changes
- Edit files (main app is at `src/components/RioNidoTravelPlanner.jsx`).
- Test in the browser.

## 4) Commit and push back to the same repo
```bash
git add .
git commit -m "Your update message"
git push origin main
```

That’s it. If this repo is connected to Vercel, the site will auto-redeploy after the push.
