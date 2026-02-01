# How to Run Localhost 🚀

## Quick Start

### Option 1: Frontend Only (Recommended for UI Testing)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install
   # OR if you have pnpm:
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # OR:
   pnpm dev
   ```

4. **Open your browser:**
   - The server will typically run on `http://localhost:5173` (Vite default)
   - Check the terminal output for the exact URL

### Option 2: Full Stack (Frontend + Backend)

**Terminal 1 - Backend:**
```bash
# From project root
chmod +x run_backend.sh
./run_backend.sh
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install  # if needed
npm run dev
```

## Troubleshooting

### If dependencies aren't installed:
```bash
cd frontend
npm install
```

### If port is already in use:
- Vite will automatically try the next available port
- Check terminal output for the actual URL

### If you see module errors:
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Expected Output

When the server starts, you should see:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Access the App

1. Open `http://localhost:5173` in your browser
2. You should see the SiteSelect login screen
3. Enter any email/password to proceed (it's a demo)
4. Click "Find Perfect Locations" to see the Premium Dashboard!

## Features to Test

✅ **Premium Dashboard** - Toggle between Classic and Premium views
✅ **All Buttons** - Every button is clickable with console output
✅ **Map Interactions** - Click markers, zoom in/out
✅ **Location Selection** - Click location cards to see details
✅ **Agent Workflow** - See multi-agent pipeline status
✅ **What-If Analysis** - Adjust budget and demographics
✅ **Voice Summary** - Click to hear location analysis

---

**Happy Hacking! 🎉**
