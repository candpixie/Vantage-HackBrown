# Name

**The Zillow of Retail Site Selection**

> AI-powered multi-agent platform that transforms "I want to open a business" into a complete location intelligence report — with market analysis, revenue projections, competitor gaps, and AI-generated storefront visualization — in 60 seconds.

🏆 **Built at Hack@Brown 2026** | Jan 31 – Feb 1

---

## The Problem

Site selection is the #1 factor in retail success, but:
- Enterprise tools (Placer.ai, Esri, SiteZeus) cost **$10K–$50K+/year**
- Small business owners are priced out
- **70% of consumers** say location influences their decision to visit
- Wrong location = business death

**Market Size:** Location Intelligence is a **$19B market** growing 15% annually. Site selection alone is **$6B+**.

---

## The Solution

SiteSelect is a **5-agent system** deployed on Fetch.ai Agentverse that generates a complete **Business Opportunity Package**:

- 📍 **Location Analysis** — Scored recommendations with confidence levels
- 🎯 **Competitor Intelligence** — Live data from Google Places with gap analysis
- 💰 **Revenue Projections** — Conservative/Expected/Optimistic scenarios
- 🏪 **AI Storefront Mockup** — Generated visualization of your future business
- 📋 **Business Toolkit** — Checklist, permits, lease intelligence

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                           │
│  "Boba shop in NYC, targeting students, $5K rent budget"    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            AGENT 1: ORCHESTRATOR (Intent Parser)            │
│  • Parses natural language → structured params              │
│  • Dispatches to specialist agents in parallel              │
│  • Handles "What If" re-runs                                │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AGENT 2:        │ │ AGENT 3:        │ │ AGENT 4:        │
│ LOCATION SCOUT  │ │ COMPETITOR      │ │ MARKET          │
│                 │ │ INTEL           │ │ ANALYST         │
│ • City datasets │ │ • Google Places │ │ • Revenue calc  │
│ • Score areas   │ │ • Ratings/hours │ │ • Break-even    │
│ • Demographics  │ │ • Gap analysis  │ │ • Confidence    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            AGENT 5: VISUALIZER + REPORT GENERATOR           │
│  • AI storefront mockup (Stability AI)                      │
│  • Assembles full Opportunity Report                        │
│  • Confidence scores + data citations                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              FULL BUSINESS OPPORTUNITY PACKAGE              │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Agent Framework** | Fetch.ai ADK + Agentverse |
| **LLM** | Google Gemini API |
| **Competitor Data** | Google Places API (live) |
| **Image Generation** | Stability AI |
| **Frontend** | Next.js 14 + Tailwind CSS + Framer Motion |
| **Maps** | Mapbox GL JS |
| **Voice Summary** | ElevenLabs API |
| **Deployment** | Vercel |

---

## Key Features

### 🔍 Transparent Scoring
Every metric includes:
- **Confidence score** (HIGH/MEDIUM/LOW)
- **Data source citation** (Census ACS, Google Places, City Open Data)
- **Assumptions disclosed**

### 🔄 "What If" Analysis
Change parameters and re-run analysis in real-time:
- Adjust budget → New locations unlock
- Change target demographic → Different neighborhoods score higher
- True agentic behavior, not static lookup

### 📊 Multi-Layer Map Visualization
- Population density heatmaps
- Age/income distribution overlays
- Competitor locations
- Transit accessibility

---

## Output: Business Opportunity Package

```
╔═══════════════════════════════════════════════════════════════╗
║  SITESELECT OPPORTUNITY REPORT                                ║
╠═══════════════════════════════════════════════════════════════╣
║  🏆 #1 RECOMMENDATION: CHELSEA / HIGH LINE                    ║
║  Overall Score: 87/100 | Confidence: HIGH                     ║
║                                                               ║
║  📊 SCORE BREAKDOWN                                           ║
║  ├─ Foot Traffic:     92/100  (HIGH confidence)               ║
║  ├─ Target Demo:      88/100  (HIGH confidence)               ║
║  ├─ Transit Access:   85/100  (HIGH confidence)               ║
║  ├─ Competition Gap:  79/100  (MEDIUM confidence)             ║
║  └─ Rent Fit:         82/100  (MEDIUM confidence)             ║
║                                                               ║
║  🎯 COMPETITOR INTELLIGENCE (Live Data)                       ║
║  Found 3 competitors — Gap: No late-night option              ║
║                                                               ║
║  💰 REVENUE PROJECTION                                        ║
║  Conservative: $18,200/mo | Expected: $24,500/mo              ║
║  Break-even: 8 months                                         ║
║                                                               ║
║  [AI Storefront Mockup] [Download PDF] [What If?]             ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Prize Tracks

| Track | Prize | Fit |
|-------|-------|-----|
| **Fetch.ai Challenge** | $750 | ⭐⭐⭐⭐⭐ 5 agents on Agentverse |
| **Marshall Wace** | $2,000 | ⭐⭐⭐⭐⭐ RAG + validation + confidence scores |
| **Visa** | $600 | ⭐⭐⭐⭐ Enables trade and commerce |
| **Best Use of Gemini** | Swag | ⭐⭐⭐⭐ LLM integration |
| **Best Use of ElevenLabs** | Earbuds | ⭐⭐⭐ Voice summary |
| **.Tech Domain** | Domain + Mic | ⭐⭐⭐⭐⭐ siteselect.tech |

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/[team]/siteselect.git
cd siteselect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add: GEMINI_API_KEY, GOOGLE_PLACES_API_KEY, STABILITY_API_KEY, ELEVENLABS_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Data Sources

- **NYC Open Data** — Business licenses, foot traffic proxies
- **Google Places API** — Live competitor data (ratings, reviews, hours)
- **Census ACS** — Demographics, income distribution
- **Stability AI** — Storefront visualization generation

---

## Why We Win

| Dimension | Competitors | SiteSelect |
|-----------|-------------|------------|
| Cost | $10K–$50K/year | Accessible |
| Transparency | Black box | Every number cited |
| Interactivity | Static reports | "What If" re-runs |
| Speed | Weeks | 60 seconds |
| Validation | "Trust us" | Confidence scores |

---

## The Pitch

> "Site selection consulting costs $10,000 to $50,000. Enterprise tools are priced for chains, not first-time owners.
>
> We built an AI agent system that does in 60 seconds what consultants charge $10K for — and it shows exactly where every number comes from.
>
> SiteSelect. The Zillow of retail site selection."

---

**Built with ☕ at Hack@Brown 2026**
