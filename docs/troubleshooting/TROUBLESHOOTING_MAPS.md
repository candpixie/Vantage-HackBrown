# 🔧 TROUBLESHOOTING: Google Maps Not Loading

## 🚨 Common Issue: "Google Maps API key not configured"

This error appears when the `VITE_GOOGLE_MAPS_API_KEY` environment variable is not properly set.

---

## ✅ SOLUTION 1: Fix Local Development (localhost)

### Step 1: Add API Key to `.env.local`

Open `frontend/.env.local` and **add or update** this line:

```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here
```

**Important:** Replace `your_actual_key_here` with your real Google Maps API key!

### Step 2: Restart Dev Server

After editing `.env.local`, you **MUST** restart:

```bash
# Stop the dev server (Ctrl+C)
cd frontend
npm run dev
```

### Step 3: Verify in Browser

1. Open http://localhost:5175
2. Open DevTools (F12) → Console
3. Look for: `VITE_GOOGLE_MAPS_API_KEY` in the logs
4. Run an analysis - map should load!

---

## ☁️ SOLUTION 2: Fix Vercel Deployment

### The Problem

Vercel doesn't have access to your local `.env.local` file. You need to add the API key **directly in Vercel**.

### Step 1: Add Environment Variable in Vercel Dashboard

1. **Go to:** https://vercel.com/dashboard
2. **Select** your Vantage project
3. **Click:** Settings (top menu)
4. **Click:** Environment Variables (left sidebar)
5. **Click:** "Add New" button
6. **Fill in:**
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** `AIzaSyD...` (your actual Google Maps API key)
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development (check ALL)
7. **Click:** "Save"

### Step 2: Redeploy Your Application

⚠️ **Critical:** Environment variables don't apply to existing deployments!

**Option A: Dashboard**
1. Go to: **Deployments** tab
2. Find your latest deployment
3. Click: **"..."** (three dots menu)
4. Click: **"Redeploy"**
5. ✅ Confirm redeploy

**Option B: Git Push**
```bash
git commit --allow-empty -m "chore: trigger redeploy for env vars"
git push origin main
```

### Step 3: Verify on Vercel

1. Wait for deployment to complete (~2 min)
2. Visit your Vercel URL: `https://your-app.vercel.app`
3. Run a location analysis
4. Map should now load! ✅

---

## 🔑 Getting Your Google Maps API Key

If you don't have an API key yet:

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Create a Project
- Click project dropdown → "New Project"
- Name: **Vantage**
- Click: **Create**

### 3. Enable Maps JavaScript API
- Go to: **APIs & Services** → **Library**
- Search: **Maps JavaScript API**
- Click: **Enable**

### 4. Create API Key
- Go to: **APIs & Services** → **Credentials**
- Click: **"+ Create Credentials"** → **API Key**
- Copy the key (starts with `AIza...`)

### 5. Restrict Your API Key (IMPORTANT!)

Click on your new API key to edit:

**Application restrictions:**
- Select: **HTTP referrers (web sites)**
- Add referrers:
  ```
  http://localhost:5175/*
  http://localhost:5176/*
  https://*.vercel.app/*
  https://your-actual-domain.vercel.app/*
  ```

**API restrictions:**
- Select: **Restrict key**
- Check: ✅ **Maps JavaScript API**

Click: **Save**

---

## 🧪 Testing Checklist

### Local Development
- [ ] `.env.local` file exists in `frontend/`
- [ ] `VITE_GOOGLE_MAPS_API_KEY` is defined in `.env.local`
- [ ] API key starts with `AIza`
- [ ] Dev server restarted after adding key
- [ ] No "API key not configured" error in app
- [ ] Map loads and shows NYC area
- [ ] Heat map overlay visible

### Vercel Production
- [ ] `VITE_GOOGLE_MAPS_API_KEY` added to Vercel env vars
- [ ] All environments selected (Production, Preview, Development)
- [ ] Redeployed after adding env var
- [ ] Deployment succeeded (green checkmark)
- [ ] Map loads on production URL
- [ ] No console errors related to Google Maps

---

## 🐛 Common Mistakes & Fixes

### ❌ Mistake 1: Forgot to restart dev server
**Symptom:** Added key to `.env.local` but still seeing error  
**Fix:** Stop dev server (Ctrl+C) and run `npm run dev` again

### ❌ Mistake 2: Wrong environment variable name
**Symptom:** Key is set but not recognized  
**Fix:** Ensure it's `VITE_GOOGLE_MAPS_API_KEY` (must start with `VITE_`)

### ❌ Mistake 3: Didn't redeploy Vercel
**Symptom:** Works locally but not on Vercel  
**Fix:** After adding env vars, you MUST redeploy!

### ❌ Mistake 4: API key not restricted
**Symptom:** "This page can't load Google Maps correctly"  
**Fix:** Add HTTP referrer restrictions in Google Cloud Console

### ❌ Mistake 5: Maps JavaScript API not enabled
**Symptom:** Error about "API not enabled"  
**Fix:** Go to Google Cloud Console → APIs & Services → Library → Enable "Maps JavaScript API"

### ❌ Mistake 6: Used placeholder value
**Symptom:** Still seeing error after "adding" key  
**Fix:** Replace `your_google_maps_api_key_here` with actual key starting with `AIza`

---

## 🔍 Debugging Tips

### Check if env var is loaded (localhost):

Add this to your browser console on http://localhost:5175:
```javascript
console.log('API Key loaded:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
```

If it shows `undefined`, the env var isn't loaded properly.

### Check Vercel deployment logs:

1. Go to Vercel Dashboard → your project
2. Click on latest deployment
3. Check "Build Logs" for any env var warnings
4. Look for errors mentioning `VITE_GOOGLE_MAPS_API_KEY`

### Check Google Maps API quota:

1. Go to: https://console.cloud.google.com/google/maps-apis/metrics
2. View your daily usage
3. Check if you've exceeded free tier (unlikely with $200 credit)

---

## 📱 Quick Commands

**Run diagnostic script:**
```bash
./check-maps-key.sh
```

**Edit local env file:**
```bash
code frontend/.env.local
# or
nano frontend/.env.local
```

**Restart dev server:**
```bash
cd frontend
npm run dev
```

**Add env var to Vercel (CLI):**
```bash
vercel env add VITE_GOOGLE_MAPS_API_KEY
# Enter your key when prompted
```

**Trigger Vercel redeploy:**
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

---

## 💡 Pro Tips

1. **Use different keys for dev/prod** - Better security and quota tracking
2. **Set up billing alerts** - Get notified at 50%, 80%, 100% of free quota
3. **Monitor usage** - Check Google Cloud Console regularly
4. **Rotate keys periodically** - Every 90 days is a good practice
5. **Never commit API keys** - Always use env variables!

---

## 🆘 Still Not Working?

If you've tried everything above and maps still won't load:

1. **Check browser console** (F12) for specific error messages
2. **Verify API key validity** at Google Cloud Console
3. **Test with a fresh API key** - Create a new one
4. **Check Vercel build logs** - Look for env var issues
5. **Verify correct Vercel project** - Make sure you're editing the right one

---

## 📚 Related Documentation

- [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md) - Complete setup guide
- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Vercel deployment guide
- [Google Maps Platform Docs](https://developers.google.com/maps/documentation/javascript)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)

---

**Remember:** The #1 cause of "API key not configured" on Vercel is **forgetting to redeploy after adding the environment variable!** 🚀
