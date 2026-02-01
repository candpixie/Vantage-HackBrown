# Vantage - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Git Repository"
   - Select `candpixie/Vantage-HackBrown`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend/ui
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`
   - (Optional) Add: `VITE_GOOGLE_MAPS_API_KEY` = `your_key`

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live at `your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd /Users/candyxie/hackbrown-2

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? vantage-hackbrown
# - Directory? ./frontend/ui
# - Override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
#   - Development Command: npm run dev

# Deploy to production
vercel --prod
```

### Environment Variables Setup

After deployment, configure environment variables:

```bash
# Add API URL
vercel env add VITE_API_URL production

# When prompted, enter your backend API URL:
# Example: https://your-backend.fly.io or https://your-backend.railway.app
```

## 📋 Backend Deployment Options

Since Vercel is primarily for frontend, deploy your Python backend separately:

### Option A: Railway (Recommended for Python)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Python
5. Set root directory to `backend/`
6. Add environment variables:
   - `PORT=8020`
   - `VISA_API_USER_ID=your_key`
   - `VISA_API_PASSWORD=your_secret`
7. Your backend will be at `your-app.railway.app`
8. Update Vercel's `VITE_API_URL` to this URL

### Option B: Fly.io

```bash
# Install flyctl
brew install flyctl  # or curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Navigate to backend
cd backend

# Launch app
fly launch
# Name: vantage-backend
# Region: Choose closest to you

# Deploy
fly deploy

# Your backend URL: https://vantage-backend.fly.dev
```

### Option C: Render

1. Go to https://render.com
2. New Web Service
3. Connect your GitHub repo
4. Settings:
   - Name: vantage-backend
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python http_server.py`
5. Add environment variables
6. Deploy

## 🔧 Vercel Configuration Files

The following files are configured for you:

### `vercel.json`
```json
{
  "buildCommand": "cd frontend/ui && npm run build",
  "outputDirectory": "frontend/ui/dist",
  "installCommand": "cd frontend/ui && npm install",
  "devCommand": "cd frontend/ui && npm run dev"
}
```

### `.vercelignore`
Excludes backend, data, and other non-frontend files from deployment.

### `frontend/ui/.env.production`
Production environment variables (edit with your backend URL).

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed (Railway/Fly.io/Render)
- [ ] VITE_API_URL environment variable set in Vercel
- [ ] VITE_GOOGLE_MAPS_API_KEY environment variable set in Vercel
- [ ] Visa API credentials set in backend environment
- [ ] Test the deployed app
- [ ] Check backend logs for any errors
- [ ] Verify API calls work (check Network tab)
- [ ] Verify Google Maps loads correctly

## 🐛 Troubleshooting

**Frontend shows "API Error" or uses mock data:**
- Check VITE_API_URL is correct
- Verify backend is running (visit backend URL in browser)
- Check CORS settings in backend (should allow your Vercel domain)

**Build fails on Vercel:**
- Check build logs
- Verify all dependencies are in package.json
- Try building locally: `cd frontend/ui && npm run build`

**Backend not responding:**
- Check backend logs
- Verify environment variables are set
- Test backend health endpoint: `curl https://your-backend.com/health`

**Heat map not showing:**
- Check if neighborhoods.geojson is in `frontend/ui/public/data/`
- Verify file is being served correctly

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check backend service logs
3. Test locally first: `npm run dev` (frontend) and `python3 http_server.py` (backend)
4. Open browser console for frontend errors

## 🎉 Success!

Once deployed:
- **Frontend:** `https://your-project.vercel.app`
- **Backend:** `https://your-backend.railway.app` (or your chosen service)
- Share your live URL! 🚀
