# Troubleshooting Guide 🔧

## Server is Running ✅

The server is confirmed running on `http://localhost:5173`

## Common Issues & Solutions

### 1. **Blank White Screen**

**Check Browser Console (F12 → Console tab):**
- Look for red error messages
- Common errors:
  - `Cannot find module` → Dependencies issue
  - `Unexpected token` → Syntax error
  - `Failed to fetch` → Network/CORS issue

**Solution:**
```bash
# Stop server (Ctrl+C), then:
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 2. **"Cannot GET /" or 404 Errors**

**Solution:**
- Make sure you're accessing `http://localhost:5173` (not 3000 or 8080)
- Check terminal for the actual port number
- Try `http://127.0.0.1:5173` instead

### 3. **React/Module Errors**

**Check if React is installed:**
```bash
cd frontend
ls node_modules | grep react
```

**If missing, install:**
```bash
npm install react@18.3.1 react-dom@18.3.1
```

### 4. **TypeScript Errors**

**Check terminal for build errors:**
- Look for red error messages when server starts
- Common: Import path issues, type errors

**Solution:**
- Check that all imports are correct
- Verify file paths match exactly

### 5. **CSS Not Loading**

**Check:**
- Browser console for CSS loading errors
- Network tab (F12 → Network) for failed requests

**Solution:**
```bash
# Verify CSS files exist
ls frontend/src/styles/
```

### 6. **Port Already in Use**

**If port 5173 is busy:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

## Quick Diagnostic Steps

1. **Open Browser Console (F12)**
   - Look for any red errors
   - Take screenshot of errors

2. **Check Network Tab**
   - See if files are loading (200 status)
   - Check for 404s or failed requests

3. **Check Terminal Output**
   - Look for compilation errors
   - Check for warnings

4. **Try Hard Refresh**
   - `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Clears cache

5. **Try Incognito/Private Mode**
   - Rules out browser extension issues

## What Should You See?

**When working correctly:**
1. Login screen with dark blue gradient background
2. City skyline animation in background
3. "SiteSelect" logo and login form
4. After login: Dashboard with sidebar navigation

## Still Not Working?

**Please provide:**
1. Browser console errors (F12 → Console)
2. Terminal output when starting server
3. What you see (blank screen? error message?)
4. Browser you're using (Chrome, Firefox, Safari?)

## Alternative: Check Server Logs

```bash
# In the terminal where server is running, you should see:
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

If you see errors here, share them!

---

**Quick Fix Command:**
```bash
cd /Users/candyxie/hackbrown-2/frontend
pkill -f vite
rm -rf node_modules package-lock.json
npm install
npm run dev
```
