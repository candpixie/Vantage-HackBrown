# 🚀 Agentverse Deployment Guide for Vantage Agents

## Overview

This guide will help you deploy all 4 Vantage uAgents to Fetch.ai's Agentverse marketplace:
- **orchestrator** - Main coordinator agent
- **location_scout** - Demographics & foot traffic analysis
- **competitor_intel** - Competitor analysis
- **revenue_analyst** - Revenue projections

---

## Prerequisites

### 1. Fetch.ai Account Setup

#### Step 1.1: Create Fetch.ai Account

1. **Go to Agentverse:**
   - Visit: https://agentverse.ai
   - Or: https://console.fetch.ai

2. **Sign Up:**
   - Click "Sign Up" or "Create Account"
   - Use your email or GitHub account
   - Complete verification

3. **Access Dashboard:**
   - Once logged in, you'll see the Agentverse dashboard
   - This is where you'll register and manage your agents

#### Step 1.2: Set Up Fetch.ai Wallet

Fetch.ai uses a Cosmos-based wallet for blockchain interactions.

**Option A: Use Fetch.ai Wallet Extension (Recommended)**

1. **Install Wallet Extension:**
   - Go to: https://fetch.ai/wallet
   - Download browser extension (Chrome/Firefox)
   - Install and create wallet
   - **⚠️ Save your seed phrase securely!**

2. **Get Testnet Tokens:**
   - Go to: https://faucet.fetch.ai (for testnet)
   - Enter your wallet address
   - Request testnet FET tokens

**Option B: Use Fetch.ai CLI Wallet**

```bash
# Install Fetch.ai CLI (if available)
pip install fetchai

# Create wallet
fetchai wallet create

# Get wallet address
fetchai wallet show
```

#### Step 1.3: Get Agentverse API Credentials

1. **In Agentverse Dashboard:**
   - Go to: Settings → API Keys
   - Click: "Create API Key"
   - Name it: "Vantage Agents"
   - Copy the API key (you'll need this!)

2. **Add to Environment:**
   - Add to `backend/.env`:
     ```
     FETCH_AI_API_KEY=your_api_key_here
     FETCH_AI_WALLET_SEED=your_wallet_seed_phrase_here
     ```

---

## Installation

### Step 2: Install Fetch.ai SDK

```bash
# Install Fetch.ai Python SDK
pip install fetchai

# Or if using uagents (already installed)
# uagents framework is already in requirements.txt
```

**Verify Installation:**
```bash
python3 -c "import fetchai; print('✅ Fetch.ai SDK installed')"
```

---

## Agent Configuration

### Current Agent Setup

Your agents are currently configured for local development:

```python
location_scout = Agent(
    name="location_scout",
    seed="scout_seed_phrase",
    port=8001,
    endpoint=["http://localhost:8001/submit"],
    network="testnet",
)
```

### Changes Needed for Agentverse

1. **Update Endpoints** - Change from localhost to public URLs
2. **Add Metadata** - Add descriptions, capabilities, tags
3. **Data Access** - Use AWS S3 instead of local files
4. **Registration** - Register agents on Agentverse

---

## Deployment Options

### Option 1: Deploy Agents to Cloud Platform (Recommended)

Deploy each agent as a separate service:

**Platforms:**
- **Railway** - Easy Python deployment
- **Render** - Free tier available
- **Fly.io** - Good for global distribution
- **Heroku** - Traditional option

**Each agent needs:**
- Public HTTPS endpoint
- Environment variables (AWS credentials, etc.)
- Persistent storage for data (or use S3)

### Option 2: Use Agentverse Hosting (If Available)

If Agentverse provides hosting:
- Register agents directly
- Agentverse manages endpoints
- Simpler setup

### Option 3: Hybrid Approach

- Keep Flask bridge on Railway/Render
- Deploy agents separately
- Flask calls agents via Agentverse discovery

---

## Step-by-Step Deployment

### Step 3: Prepare Agent Endpoints

Before registering on Agentverse, agents need public endpoints.

**For each agent, you'll need:**

1. **Deploy agent to cloud:**
   ```bash
   # Example: Deploy location_scout to Railway
   # Create railway.json or Procfile
   ```

2. **Get public URL:**
   - Railway: `https://location-scout.railway.app`
   - Render: `https://location-scout.onrender.com`
   - Fly.io: `https://location-scout.fly.dev`

3. **Update agent endpoint:**
   ```python
   endpoint=["https://your-deployed-url.com/submit"]
   ```

### Step 4: Register Agents on Agentverse

**Via Agentverse Dashboard:**

1. **Go to Agentverse:**
   - https://agentverse.ai
   - Click: "Create Agent" or "Register Agent"

2. **Fill in Agent Details:**
   - **Name:** `vantage-location-scout`
   - **Description:** "Analyzes demographics and foot traffic for location intelligence"
   - **Capabilities:** `["demographics", "foot_traffic", "location_scoring"]`
   - **Tags:** `location-intelligence`, `real-estate`, `analytics`
   - **Endpoint:** `https://your-deployed-url.com/submit`
   - **Version:** `1.0.0`

3. **Repeat for all 4 agents:**
   - `vantage-orchestrator`
   - `vantage-location-scout`
   - `vantage-competitor-intel`
   - `vantage-revenue-analyst`

**Via API (Programmatic):**

Use the deployment script we'll create to register all agents at once.

### Step 5: Update Agent Code

Agents need to:
- Use public endpoints
- Access data from S3 (not local files)
- Include Agentverse metadata
- Handle Agentverse discovery

See the updated agent files for examples.

---

## Data Dependencies

### Current Issue

Agents load data from local files:
```python
with open("data/subway_stations.json") as f:
    subway_data = json.load(f)
```

### Solution: Use AWS S3

We've already created `aws_data_service.py`. Agents should use it:

```python
from aws_data_service import AWSDataService

data_service = AWSDataService()
subway_data = data_service.get_subway_stations()
```

**Update all agents to use AWS S3 data service.**

---

## Environment Variables

Add to `backend/.env`:

```bash
# Fetch.ai / Agentverse
FETCH_AI_API_KEY=your_agentverse_api_key
FETCH_AI_WALLET_SEED=your_wallet_seed_phrase
FETCH_AI_NETWORK=testnet  # or mainnet for production

# Agent Endpoints (after deployment)
ORCHESTRATOR_ENDPOINT=https://orchestrator.railway.app/submit
LOCATION_SCOUT_ENDPOINT=https://location-scout.railway.app/submit
COMPETITOR_INTEL_ENDPOINT=https://competitor-intel.railway.app/submit
REVENUE_ANALYST_ENDPOINT=https://revenue-analyst.railway.app/submit

# AWS (for data access)
USE_AWS=true
AWS_S3_BUCKET=vantage-location-data
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

---

## Testing

### Test Agent Registration

```bash
python3 scripts/test_agentverse.py
```

This will:
- Verify Fetch.ai credentials
- Check agent registration
- Test agent discovery
- Verify communication

### Test Agent Communication

```python
from uagents import Agent

# Discover agent via Agentverse
orchestrator = Agent.find("vantage-orchestrator")

# Send message
await orchestrator.send(ScoreRequest(...))
```

---

## Troubleshooting

### Agent Not Discoverable

- Check agent is registered on Agentverse
- Verify endpoint URL is accessible
- Ensure agent is running
- Check network (testnet vs mainnet)

### Data Loading Errors

- Verify AWS credentials in `.env`
- Check S3 bucket permissions
- Ensure `USE_AWS=true`
- Test S3 connection separately

### Endpoint Not Accessible

- Check deployment platform status
- Verify HTTPS is enabled
- Check firewall/security settings
- Test endpoint with curl:
  ```bash
  curl https://your-agent-url.com/submit
  ```

---

## Next Steps

1. **Set up Fetch.ai account** (Step 1)
2. **Install Fetch.ai SDK** (Step 2)
3. **Deploy agents to cloud** (Step 3)
4. **Register on Agentverse** (Step 4)
5. **Update code** (Step 5)
6. **Test everything** (Step 6)

---

## Resources

- **Agentverse:** https://agentverse.ai
- **Fetch.ai Docs:** https://docs.fetch.ai
- **uAgents Framework:** https://github.com/fetchai/uAgents
- **Fetch.ai Wallet:** https://fetch.ai/wallet
- **Testnet Faucet:** https://faucet.fetch.ai

---

## Cost Considerations

- **Agentverse Registration:** Free (check current pricing)
- **Agent Hosting:** Depends on platform (Railway ~$5/month, Render free tier)
- **Blockchain Transactions:** Minimal (testnet is free)
- **Data Storage:** AWS S3 (~$0.01/month)

---

**Ready to deploy?** Start with Step 1: Create your Fetch.ai account! 🚀
