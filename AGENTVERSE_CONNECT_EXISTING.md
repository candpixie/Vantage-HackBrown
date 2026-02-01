# 🔌 Connect Your Existing Agents to Agentverse

## Current Situation

You're on Agentverse's template selection page. These templates are for **creating new agents from scratch**, not for uploading your existing Vantage agents.

---

## 🎯 Two Options to Connect Your Agents

### Option 1: Use "Chat Protocol" Integration (Recommended)

Your agents already use the uAgents framework, which supports Chat Protocol. You can connect them directly!

#### Step 1: Choose a Chat Protocol Template

1. **On the template page, look for:**
   - ✅ "Chat Protocol skeleton" 
   - ✅ "Chat Protocol using llm"
   - ✅ "Blank Agent"

2. **Click on "Chat Protocol skeleton"** (this is the simplest starting point)

#### Step 2: Configure Your Agent

After selecting the template, you'll be asked for:
- **Agent Name:** `vantage-orchestrator` (or location-scout, etc.)
- **Endpoint URL:** This is where you'll put your agent's public URL

#### Step 3: Get Your Agent's Public URL

Since you want to skip Railway, use **ngrok**:

```bash
# Terminal 1: Run your orchestrator
cd backend/agents
python 1-orchestrator.py

# Terminal 2: Expose with ngrok
ngrok http 8000
```

Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`)

#### Step 4: Register on Agentverse

- **Agent Name:** `vantage-orchestrator`
- **Endpoint:** `https://abc123.ngrok.io/submit`
- **Protocol:** Chat Protocol
- Click "Launch"

Repeat for all 4 agents!

---

### Option 2: Use "Blank Agent" Template

1. **Click "Blank Agent"** template
2. **Fill in the form:**
   - Name: `vantage-orchestrator`
   - Endpoint: Your ngrok URL
   - Description: "Main coordinator agent"
3. **Launch the agent**

---

## 🚀 Quick Setup with ngrok

### Install ngrok:
```bash
brew install ngrok
```

### Run All 4 Agents + ngrok:

**Terminal 1 - Orchestrator:**
```bash
cd backend/agents
python 1-orchestrator.py
```

**Terminal 2 - Location Scout:**
```bash
cd backend/agents
python 2-location_scout.py
```

**Terminal 3 - Competitor Intel:**
```bash
cd backend/agents
python 3-competitor_intel.py
```

**Terminal 4 - Revenue Analyst:**
```bash
cd backend/agents
python 4-revenue_analyst.py
```

**Terminal 5 - ngrok for Orchestrator:**
```bash
ngrok http 8000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Terminal 6 - ngrok for Location Scout:**
```bash
ngrok http 8001
# Copy the HTTPS URL
```

**Terminal 7 - ngrok for Competitor Intel:**
```bash
ngrok http 8002
# Copy the HTTPS URL
```

**Terminal 8 - ngrok for Revenue Analyst:**
```bash
ngrok http 8003
# Copy the HTTPS URL
```

---

## 📋 Register Each Agent on Agentverse

For each of your 4 agents:

1. **On Agentverse, click "Launch an Agent"**
2. **Select "Chat Protocol skeleton" or "Blank Agent"**
3. **Fill in:**
   - **Name:** `vantage-orchestrator` (or location-scout, competitor-intel, revenue-analyst)
   - **Endpoint URL:** `https://your-ngrok-url.ngrok.io/submit`
   - **Description:** Brief description of what the agent does
4. **Click "Launch"**

---

## 🔍 What to Look For

On the Agentverse form, after selecting a template, you should see fields like:
- **Agent Name**
- **Endpoint URL** ← This is where you put your ngrok URL
- **Description**
- **Capabilities/Tags**

Your agents are already running and responding to Chat Protocol, so you just need to:
1. Get their public URLs (via ngrok)
2. Register them on Agentverse with those URLs

---

## ✅ Quick Checklist

- [ ] Install ngrok: `brew install ngrok`
- [ ] Run all 4 agents locally (4 terminals)
- [ ] Expose all 4 with ngrok (4 more terminals)
- [ ] Copy all 4 ngrok HTTPS URLs
- [ ] On Agentverse, select "Chat Protocol skeleton" or "Blank Agent"
- [ ] Register each agent with its ngrok URL
- [ ] Test agent discovery on Agentverse

---

## 💡 Pro Tip

**Start with just ONE agent** (the orchestrator) to test the flow:
1. Run orchestrator locally
2. Expose with ngrok
3. Register on Agentverse
4. Test it works
5. Then do the other 3 agents

This way you can verify everything works before setting up all 4!

---

**Ready to start?** Install ngrok and run your first agent! 🚀
