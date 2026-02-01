# 🚀 Agentverse Quick Start Guide

## Current Status

You're on Agentverse.ai and see "You don't have an agent yet". Here's what to do next!

---

## 📋 Step-by-Step: Deploy Your First Agent

### Step 1: Deploy Agents to Cloud (Get Public Endpoints)

**Before registering on Agentverse, your agents need public HTTPS endpoints.**

#### Option A: Deploy to Railway (Recommended - Easiest)

1. **Go to Railway:** https://railway.app
2. **Sign up/Login** with GitHub
3. **Create 4 new projects** (one for each agent):
   - `vantage-orchestrator`
   - `vantage-location-scout`
   - `vantage-competitor-intel`
   - `vantage-revenue-analyst`

4. **For each project:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `hackbrown-2` repository
   - **Root Directory:** `backend/agents`
   - **Start Command:** 
     - Orchestrator: `python 1-orchestrator.py`
     - Location Scout: `python 2-location_scout.py`
     - Competitor Intel: `python 3-competitor_intel.py`
     - Revenue Analyst: `python 4-revenue_analyst.py`
   - **Environment Variables:** Add all from `backend/.env`:
     ```
     USE_AWS=true
     AWS_REGION=us-east-2
     AWS_S3_BUCKET=vantage-location-data
     AWS_ACCESS_KEY_ID=your_key
     AWS_SECRET_ACCESS_KEY=your_secret
     FETCH_AI_NETWORK=testnet
     ```

5. **Get Public URLs:**
   - After deployment, Railway gives you a URL like: `https://vantage-orchestrator.railway.app`
   - Your agent endpoint will be: `https://vantage-orchestrator.railway.app/submit`
   - **Copy these URLs!** You'll need them for Agentverse.

#### Option B: Deploy to Render

1. **Go to Render:** https://render.com
2. **Create 4 Web Services** (one per agent)
3. **Connect GitHub repo:** `hackbrown-2`
4. **For each service:**
   - **Root Directory:** `backend/agents`
   - **Build Command:** `pip install -r ../../requirements.txt`
   - **Start Command:** `python <agent_file>.py`
   - **Environment:** Python 3
   - Add environment variables (same as Railway)

5. **Get Public URLs** from Render dashboard

---

### Step 2: Register Agents on Agentverse

Now that you have public endpoints, register them on Agentverse:

#### Method 1: Via Agentverse Dashboard (Easier)

1. **On Agentverse.ai, click "Launch an Agent"**

2. **Fill in the form for each agent:**

   **For Orchestrator:**
   - **Name:** `vantage-orchestrator`
   - **Description:** "Main coordinator agent that orchestrates location intelligence analysis"
   - **Endpoint URL:** `https://your-orchestrator.railway.app/submit`
   - **Capabilities:** `orchestration, location_analysis, agent_coordination`
   - **Tags:** `location-intelligence, orchestrator`

   **For Location Scout:**
   - **Name:** `vantage-location-scout`
   - **Description:** "Analyzes demographics, foot traffic, and transit access"
   - **Endpoint URL:** `https://your-location-scout.railway.app/submit`
   - **Capabilities:** `demographics, foot_traffic, transit_access`
   - **Tags:** `location-intelligence, real-estate, analytics`

   **For Competitor Intel:**
   - **Name:** `vantage-competitor-intel`
   - **Description:** "Analyzes nearby competitors and market saturation"
   - **Endpoint URL:** `https://your-competitor-intel.railway.app/submit`
   - **Capabilities:** `competitor_analysis, market_saturation`
   - **Tags:** `location-intelligence, competitor-analysis`

   **For Revenue Analyst:**
   - **Name:** `vantage-revenue-analyst`
   - **Description:** "Projects revenue scenarios with Visa API integration"
   - **Endpoint URL:** `https://your-revenue-analyst.railway.app/submit`
   - **Capabilities:** `revenue_projection, financial_analysis, visa_integration`
   - **Tags:** `location-intelligence, financial-analysis`

3. **Click "Launch"** for each agent

#### Method 2: Via Script (After endpoints are set)

1. **Set environment variables:**
   ```bash
   export ORCHESTRATOR_ENDPOINT=https://your-orchestrator.railway.app/submit
   export LOCATION_SCOUT_ENDPOINT=https://your-location-scout.railway.app/submit
   export COMPETITOR_INTEL_ENDPOINT=https://your-competitor-intel.railway.app/submit
   export REVENUE_ANALYST_ENDPOINT=https://your-revenue-analyst.railway.app/submit
   export FETCH_AI_API_KEY=your_agentverse_api_key
   ```

2. **Run deployment script:**
   ```bash
   python3 scripts/deploy_to_agentverse.py
   ```

   ⚠️ **Note:** This script prepares the registration data. You may still need to complete registration via the Agentverse dashboard or API.

---

### Step 3: Test Your Agents

1. **On Agentverse, go to "Agents" tab**
2. **You should see your 4 agents listed**
3. **Click on an agent** to see details
4. **Test messaging** between agents

---

## 🎯 Quick Checklist

Before registering on Agentverse:

- [ ] Agents deployed to cloud (Railway/Render)
- [ ] Public HTTPS endpoints obtained
- [ ] Environment variables configured on cloud platform
- [ ] Agents are running and accessible
- [ ] Test endpoints with curl:
  ```bash
  curl https://your-agent.railway.app/submit
  ```

Then on Agentverse:

- [ ] Click "Launch an Agent"
- [ ] Fill in agent details
- [ ] Add public endpoint URL
- [ ] Add capabilities and tags
- [ ] Launch agent
- [ ] Repeat for all 4 agents

---

## 🐛 Troubleshooting

### "Agent endpoint not accessible"
- Check agent is running on cloud platform
- Verify endpoint URL is correct
- Check firewall/security settings
- Test with curl from your terminal

### "Agent not responding"
- Check cloud platform logs
- Verify environment variables are set
- Ensure AWS credentials are configured
- Check agent code for errors

### "Can't find agent on Agentverse"
- Verify agent was successfully registered
- Check "Agents" tab on Agentverse
- Try refreshing the page
- Check agent name matches exactly

---

## 📚 Next Steps After Registration

Once all 4 agents are registered:

1. **Test agent discovery** - Can agents find each other?
2. **Test messaging** - Can agents communicate?
3. **Update backend** - Point `backend/http_server.py` to Agentverse agents
4. **Test end-to-end** - Run a full location analysis

---

## 💡 Pro Tips

1. **Start with one agent** - Deploy and register just the orchestrator first to test the flow
2. **Use Railway** - It's the easiest for Python agents
3. **Keep endpoints handy** - Save all 4 endpoint URLs in a text file
4. **Test locally first** - Make sure agents work locally before deploying
5. **Check logs** - Monitor cloud platform logs during deployment

---

**Ready to deploy?** Start with Step 1: Deploy to Railway! 🚂
