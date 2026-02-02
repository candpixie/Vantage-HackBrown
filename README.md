# Vantage
**Location Intelligence Platform**

> AI-powered multi-agent platform that transforms "I want to open a business" into a complete location intelligence report — with market analysis, revenue projections, competitor gaps, and demographic heatmaps — in 60 seconds.

**Hack@Brown 2026** | Jan 31 – Feb 1

**Built by TEAM CMYK:** Candy Xie, Karen Yang, Michael Rostom, Yolanda Hu 

![Vantage Platform Screenshot on startup](Assets/Screenshot1.png)
![Vantage Platform Screenshot after selection](Assets/Screenshot2.png)

>**Note:** This project was developed with significant assistance from AI tools. Please be aware that the code may contain security vulnerabilities or unexpected errors.
---


## The Problem

Site selection is the #1 factor in retail success, but:
- Enterprise tools cost **$10K–$50K+/year**
- Small business owners are priced out
- **70% of consumers** say location influences their decision to visit
- Wrong location = business death

**Market Size:** Location Intelligence is a **$19B market** growing 15% annually. Site selection alone is **$6B+**.

---

## The Solution

Vantage is a **multi-agent system** that generates a complete **Business Opportunity Package**:

- **Location Analysis** — Scored recommendations with confidence levels
- **Competitor Intelligence** — Live data from Google Places with gap analysis
- **Revenue Projections** — Conservative/Expected/Optimistic scenarios
- **Demographic Heatmaps** — Population density, income, and age distribution overlays
- **Enhanced Loading Experience** — Real-time progress messages showing agent activity

## Key Features

### Transparent Scoring
Every metric includes:
- **Confidence score** (HIGH/MEDIUM/LOW)
- **Data source citation** (Census ACS, Google Places, NYC Open Data, Visa API)

### Interactive Map Visualization
- Population density heatmaps
- Median age distribution overlays
- Median income distribution overlays
- Location markers with scoring
- Collapsible sidebars for layer control

### Comprehensive Reports
- PDF export with full location analysis
- Revenue projections (Conservative/Moderate/Optimistic)
- Competitor gap analysis
- Demographic breakdowns


## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                           │
│  "Boba shop in NYC, targeting students, $8.5K rent budget"  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FLASK HTTP BRIDGE                        │
│  • Dispatches to specialist agents                          │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AGENT 2:        │ │ AGENT 3:        │ │ AGENT 4:        │
│ LOCATION SCOUT  │ │ COMPETITOR      │ │ REVENUE         │
│                 │ │ INTELlIGENCE    │ │ ANALYST         │
│• Foot Traffic   │ │ • Google Places │ │ • Revenue calc  |
│• Transit data   │ │ • Foot Traffic  │ | • Break-even    │
│• Demographics   │ │ • Saturation    │ | • Projections   │
│• Transit data   │ │                 │ │                 | 
│                 │ |                 │ |                 | 
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FLASK HTTP BRIDGE                        │
│  • Aggregates agent responses                               │
│  • Transforms data for frontend                             │
│  • Serves location results with metrics                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT FRONTEND + GOOGLE MAPS                   │
│  • Interactive map with heatmap overlays                    │
│  • Location scoring dashboard                               │
│  • PDF report generation                                    │
│  • Real-time comparison view                                │
└─────────────────────────────────────────────────────────────┘
```
## EXAMPLE OUTPUT In ASCII 
```
╔═══════════════════════════════════════════════════════════════╗
║  EXAMPLE OUTPUT REPORT                                        ║
╠═══════════════════════════════════════════════════════════════╣
║  #1 RECOMMENDATION: EAST VILLAGE                              ║
║  Overall Score: 92/100 | Confidence: HIGH                     ║
║                                                               ║
║  SCORE BREAKDOWN                                              ║
║  ├─ Foot Traffic:     88/100  (HIGH confidence)               ║
║  ├─ Transit Access:   95/100  (HIGH confidence)               ║
║  └─ Competition Gap:  79/100  (MEDIUM confidence)             ║
║                                                               ║
║  REVENUE PROJECTION                                           ║
║  Conservative: $28,500/mo | Moderate: $42,200/mo              ║
║  Optimistic: $58,800/mo | Break-even: 6 months               ║
║                                                               ║
║  [Download PDF] [Compare Locations] [View Map]                ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Maps API key

### Backend

```bash
python backend/http_server.py
```

The backend server will run on `http://localhost:8020` 

### Frontend 

```bash
# Navigate to frontend directory
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` 

---

## Data Sources

- **NYC Open Data** — Business licenses, pedestrian counts, subway stations
- **Google Places API** — Live competitor data (ratings, reviews, hours)
- **RentCast API** — Rent price estimates
- **Visa Merchant Search API** — Merchant spending insights (sandbox)
- **NYC Neighborhood GeoJSON** — Neighborhood boundaries and shapes
---

## API Endpoints

### GET /submit
Submit a location analysis request.

**Query Parameters:**
- `type` (string): Business type (e.g., "Boba Tea Shop", "coffee shop", "bakery")
- `demo` (string): Target demographic (e.g., "students", "professionals", "families")
- `budget` (number): Monthly rent budget

**Response:**
```json
{
  "status": "completed",
  "progress": 100,
  "agent_statuses": [...],
  "locations": [
    {
      "id": 1,
      "name": "Location Name",
      "score": 87,
      "status": "HIGH",
      "metrics": [...],
      "competitors": [...],
      "revenue": [...],
      "rent_price": 8500,
      "address": "123 Main St",
      "demographics": {...},
      "magic_number": 87
    }
  ],
  "cached": false  // true if result came from demo cache
}
```