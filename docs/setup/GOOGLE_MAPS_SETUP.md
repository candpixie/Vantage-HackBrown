# 🗺️ Google Maps API Setup Guide

## Why You Need This

Vantage uses Google Maps with Deck.gl overlay for:
- Interactive neighborhood heat maps
- Location markers
- Real-time map interactions

## 🔑 Getting Your Google Maps API Key

### Step 1: Go to Google Cloud Console

Visit: https://console.cloud.google.com/

### Step 2: Create a Project (if you don't have one)

1. Click the project dropdown at the top
2. Click "New Project"
3. Name it: "Vantage" or similar
4. Click "Create"

### Step 3: Enable Required APIs

1. Go to: **APIs & Services** → **Library**
2. Search and enable these APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (optional, for address lookup)
   - **Places API** (optional, for enhanced location data)

### Step 4: Create API Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **API Key**
3. Copy the API key (starts with `AIza...`)

### Step 5: Restrict Your API Key (IMPORTANT!)

**For Security:**

1. Click on your new API key to edit it
2. Under **"Application restrictions"**:
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     ```
     http://localhost:5175/*
     http://localhost:5176/*
     https://your-app.vercel.app/*
     https://*.vercel.app/*
     ```

3. Under **"API restrictions"**:
   - Select "Restrict key"
   - Choose:
     - Maps JavaScript API
     - Geocoding API (if using)
     - Places API (if using)

4. Click **"Save"**

## 🛠️ Local Development Setup

### Create `.env.local` file

In `frontend/ui/` directory, create `.env.local`:

```bash
# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...your_actual_key_here

# Optional: Custom Map ID for styled maps
# VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
```

This file is already in `.gitignore` and won't be committed.

### Restart Your Dev Server

```bash
cd frontend/ui
npm run dev
```

The map should now load properly!

## ☁️ Vercel Deployment Setup

### Option 1: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to: **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** `AIzaSyD...your_actual_key_here`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**
6. **Redeploy** your app:
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**

### Option 2: Vercel CLI

```bash
# Add environment variable
vercel env add VITE_GOOGLE_MAPS_API_KEY

# When prompted:
# - Environment: Production, Preview, Development (select all)
# - Value: AIzaSyD...your_actual_key_here

# Redeploy
vercel --prod
```

### Option 3: Via `vercel.json` (Not Recommended for Secrets)

⚠️ **DO NOT** add API keys to `vercel.json` - it's committed to git!

Use the dashboard or CLI instead.

## 🧪 Verify It's Working

### Local Test

1. Start your app: `npm run dev`
2. Open browser: `http://localhost:5175`
3. Run a location analysis
4. **You should see:**
   - ✅ Interactive Google Map
   - ✅ Neighborhood heat map overlay
   - ✅ Location markers
   - ✅ No "API key not configured" message

### Production Test

1. Visit your Vercel deployment
2. Run an analysis
3. Check browser console (F12) for any API errors

## 💰 Google Maps Pricing

### Free Tier (More than enough for demos!)

- **$200 credit per month** (free)
- **28,000+ map loads per month** for free
- No credit card required initially

### Estimated Usage for Vantage

- Each analysis loads 1 map
- Assume 100 analyses per day = 3,000/month
- **Well within free tier!** ✅

### Enable Billing (Optional)

For production apps with high traffic:
1. Go to: **Billing** in Cloud Console
2. Link a payment method
3. Set budget alerts

## 🔒 Security Best Practices

### ✅ DO:
- Restrict API key to specific domains
- Use separate keys for dev/staging/prod
- Monitor usage in Cloud Console
- Set up quota alerts
- Rotate keys periodically

### ❌ DON'T:
- Commit API keys to git
- Share keys publicly
- Use unrestricted keys
- Skip domain restrictions
- Ignore quota alerts

## 🐛 Troubleshooting

### "API key not configured" message

**Fix:** Add `VITE_GOOGLE_MAPS_API_KEY` to `.env.local` and restart dev server

### Map shows but heat map doesn't appear

**Issue:** API key is working, but neighborhoods data might not be loading

**Fix:** Check browser console for GeoJSON loading errors

### "This page can't load Google Maps correctly"

**Possible causes:**
1. API key is invalid
2. API key restrictions are too strict
3. Maps JavaScript API is not enabled
4. Billing is required (unlikely for low usage)

**Fix:**
1. Verify key in Cloud Console
2. Check HTTP referrer restrictions include your domain
3. Enable Maps JavaScript API in Cloud Console
4. Check quota limits

### Map loads but shows "For development purposes only" watermark

**Cause:** Billing not enabled in Google Cloud

**Fix:** Add payment method in Cloud Console (you won't be charged within free tier)

### API key works locally but not on Vercel

**Cause:** Environment variable not set or API key restricted to wrong domain

**Fix:**
1. Verify `VITE_GOOGLE_MAPS_API_KEY` is in Vercel env vars
2. Add `*.vercel.app` to HTTP referrer restrictions
3. Redeploy after adding env var

## 📊 Monitoring Usage

1. Go to: https://console.cloud.google.com/google/maps-apis/metrics
2. View:
   - Daily requests
   - API-specific usage
   - Cost estimates
3. Set up alerts for 80% quota usage

## 🎨 Optional: Custom Map Styling

Want a dark mode or custom styled map?

1. Go to: https://console.cloud.google.com/google/maps-apis/studio/maps
2. Create a new Map ID
3. Customize styling (colors, labels, etc.)
4. Copy the Map ID
5. Add to `.env.local`:
   ```
   VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
   ```

## 🔗 Useful Links

- [Google Maps Platform](https://cloud.google.com/maps-platform)
- [Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Maps Platform YouTube Channel](https://www.youtube.com/c/GoogleMapsPlatform)

## 🆘 Still Having Issues?

1. Check browser console for specific errors
2. Verify API key in Cloud Console
3. Test with API Key Validator: https://developers.google.com/maps/documentation/javascript/get-api-key#validate
4. Check Vercel build logs
5. Ensure all required APIs are enabled

---

**Remember:** Keep your API key secure and never commit it to public repositories! 🔐
