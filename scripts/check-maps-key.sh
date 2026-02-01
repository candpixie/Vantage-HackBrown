#!/bin/bash

# Vantage Google Maps API Key Verification Script
# This script helps diagnose and fix Google Maps API key issues

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🗺️  GOOGLE MAPS API KEY DIAGNOSTIC                         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env.local exists
echo "1️⃣  Checking for .env.local file..."
if [ -f "frontend/.env.local" ]; then
    echo "   ✅ .env.local exists"
    
    # Check if VITE_GOOGLE_MAPS_API_KEY is set
    if grep -q "VITE_GOOGLE_MAPS_API_KEY" frontend/.env.local; then
        echo "   ✅ VITE_GOOGLE_MAPS_API_KEY is defined"
        
        # Check if it's still the placeholder
        if grep -q "VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here" frontend/.env.local; then
            echo "   ⚠️  WARNING: Still using placeholder value!"
            echo "   ❌ You need to replace 'your_google_maps_api_key_here' with your actual Google Maps API key"
            echo ""
            echo "   To fix:"
            echo "   1. Get your API key from: https://console.cloud.google.com/"
            echo "   2. Edit: frontend/.env.local"
            echo "   3. Replace the placeholder with: VITE_GOOGLE_MAPS_API_KEY=AIzaSy..."
            echo ""
        else
            # Check if it's an actual key (starts with AIza)
            KEY_VALUE=$(grep "VITE_GOOGLE_MAPS_API_KEY" frontend/.env.local | cut -d '=' -f2)
            if [[ $KEY_VALUE == AIza* ]]; then
                echo "   ✅ API key looks valid (starts with AIza)"
                echo "   🔑 Key preview: ${KEY_VALUE:0:10}..."
            else
                echo "   ⚠️  API key doesn't start with 'AIza' - might be invalid"
                echo "   🔑 Current value: $KEY_VALUE"
            fi
        fi
    else
        echo "   ❌ VITE_GOOGLE_MAPS_API_KEY is NOT defined"
        echo "   Add this line to frontend/.env.local:"
        echo "   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here"
    fi
else
    echo "   ❌ .env.local does NOT exist"
    echo "   Creating .env.local template..."
    cat > frontend/.env.local << 'EOF'
# Vantage Frontend Environment Variables (Local Development)

# Backend API URL
VITE_API_URL=http://localhost:8020

# Google Maps API Key - REPLACE WITH YOUR ACTUAL KEY
# Get from: https://console.cloud.google.com/
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Optional: Google Maps Map ID for custom styling
# VITE_GOOGLE_MAPS_MAP_ID=your_map_id_here
EOF
    echo "   ✅ Created frontend/.env.local"
    echo "   ⚠️  Edit this file and add your Google Maps API key!"
fi

echo ""
echo "2️⃣  Checking Vercel configuration..."
echo "   To add the API key to Vercel:"
echo ""
echo "   Method 1: Vercel Dashboard (Recommended)"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   1. Go to: https://vercel.com/dashboard"
echo "   2. Select your project"
echo "   3. Go to: Settings → Environment Variables"
echo "   4. Click: Add New"
echo "   5. Name: VITE_GOOGLE_MAPS_API_KEY"
echo "   6. Value: AIzaSy... (your actual key)"
echo "   7. Environment: Production, Preview, Development (select all)"
echo "   8. Click: Save"
echo "   9. Go to: Deployments → ... → Redeploy"
echo ""
echo "   Method 2: Vercel CLI"
echo "   ━━━━━━━━━━━━━━━━━━━━━"
echo "   vercel env add VITE_GOOGLE_MAPS_API_KEY"
echo "   (Enter your key when prompted)"
echo ""

echo "3️⃣  Important Notes:"
echo "   • Environment variables in Vite MUST start with VITE_"
echo "   • After adding env vars to Vercel, you MUST redeploy"
echo "   • Changes to .env.local require dev server restart"
echo "   • Google Maps API keys start with 'AIza'"
echo ""

echo "4️⃣  Testing locally:"
echo "   cd frontend"
echo "   npm run dev"
echo "   (Open http://localhost:5175 and run an analysis)"
echo ""

echo "5️⃣  Google Maps API Key Setup:"
echo "   If you don't have a key yet:"
echo "   1. Go to: https://console.cloud.google.com/"
echo "   2. Create project: 'Vantage'"
echo "   3. Enable: Maps JavaScript API"
echo "   4. Credentials → Create Credentials → API Key"
echo "   5. Restrict your key:"
echo "      • HTTP referrers: http://localhost:5175/*, https://*.vercel.app/*"
echo "      • API restrictions: Maps JavaScript API"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Need help? Check: GOOGLE_MAPS_SETUP.md                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
