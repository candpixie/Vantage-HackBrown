# Vantage

**Location Intelligence Platform**

> AI-powered multi-agent platform that transforms "I want to open a business" into a complete location intelligence report — with market analysis, revenue projections, competitor gaps, and demographic heatmaps — in 60 seconds.

**Built at Hack@Brown 2026** | Jan 31 – Feb 1

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

Vantage is a **multi-agent system** that generates a complete **Business Opportunity Package**:

- **Location Analysis** — Scored recommendations with confidence levels
- **Competitor Intelligence** — Live data from Google Places with gap analysis
- **Revenue Projections** — Conservative/Expected/Optimistic scenarios
- **Demographic Heatmaps** — Population density, income, and age distribution overlays
- **Business Toolkit** — Checklist, permits, lease intelligence

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INPUT                           │
│  "Boba shop in NYC, targeting students, $8.5K rent budget"  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            AGENT 1: ORCHESTRATOR                            │
│  • Parses business requirements                             │
│  • Dispatches to specialist agents                          │
│  • Generates composite "magic number" score                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AGENT 2:        │ │ AGENT 3:        │ │ AGENT 4:        │
│ LOCATION SCOUT  │ │ COMPETITOR      │ │ REVENUE         │
│                 │ │ INTEL           │ │ ANALYST         │
│ • NYC datasets  │ │ • Google Places │ │ • Revenue calc  │
│ • Score areas   │ │ • Ratings/reviews│ │ • Break-even    │
│ • Demographics  │ │ • Gap analysis  │ │ • Confidence    │
│ • Transit data  │ │ • Saturation    │ │ • Projections   │
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
| **Agent Framework** | uagents (Python) |
| **Backend API** | Flask + Flask-CORS |
| **Data Processing** | Python (geopy, requests) |
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Framer Motion |
| **Maps** | Google Maps Platform + Deck.gl |
| **Data Sources** | NYC Open Data, Census ACS, RentCast API |
| **PDF Export** | html2pdf.js |

---

## Key Features

### Transparent Scoring
Every metric includes:
- **Confidence score** (HIGH/MEDIUM/LOW)
- **Data source citation** (Census ACS, Google Places, NYC Open Data)
- **Assumptions disclosed**

### Interactive Map Visualization
- Population density heatmaps
- Median age distribution overlays
- Median income distribution overlays
- Location markers with scoring
- Collapsible sidebars for layer control

### Real-Time Analysis
Change parameters and re-run analysis:
- Adjust budget → New locations unlock
- Change target demographic → Different neighborhoods score higher
- Dynamic agent-based scoring

### Comprehensive Reports
- PDF export with full location analysis
- Revenue projections (Conservative/Moderate/Optimistic)
- Competitor gap analysis
- Demographic breakdowns

---

## Output: Business Opportunity Package

```
╔═══════════════════════════════════════════════════════════════╗
║  VANTAGE OPPORTUNITY REPORT                                   ║
╠═══════════════════════════════════════════════════════════════╣
║  #1 RECOMMENDATION: CHELSEA / HIGH LINE                       ║
║  Overall Score: 87/100 | Confidence: HIGH                     ║
║                                                               ║
║  SCORE BREAKDOWN                                              ║
║  ├─ Foot Traffic:     92/100  (HIGH confidence)               ║
║  ├─ Target Demo:      88/100  (HIGH confidence)               ║
║  ├─ Transit Access:   85/100  (HIGH confidence)               ║
║  ├─ Competition Gap:  79/100  (MEDIUM confidence)             ║
║  └─ Rent Fit:         82/100  (MEDIUM confidence)             ║
║                                                               ║
║  COMPETITOR INTELLIGENCE (Live Data)                          ║
║  Found 3 competitors — Gap: No late-night option              ║
║                                                               ║
║  REVENUE PROJECTION                                           ║
║  Conservative: $18,200/mo | Expected: $24,500/mo              ║
║  Break-even: 8 months                                         ║
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

### Backend Setup

```bash
# Navigate to project root
cd hackbrown-2

# Install Python dependencies
pip install -r requirements.txt

# Set up data directory (if needed)
# Data files should be in backend/data/

# Run Flask server
python backend/http_server.py
```

The backend server will run on `http://localhost:8020`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/ui

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with:
# VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
# VITE_API_URL=http://localhost:8020

# Run development server
npm run dev
```

The frontend will run on `http://localhost:5173` (or the next available port)

### Full Stack Development

1. Start the backend server in one terminal
2. Start the frontend dev server in another terminal
3. Open `http://localhost:5173` in your browser

---

## Project Structure

```
hackbrown-2/
├── backend/
│   ├── agents/
│   │   ├── 0-Input.py          # Input handler
│   │   ├── 1-orchestrator.py   # Main orchestrator agent
│   │   ├── 2-location_scout.py # Location scoring agent
│   │   ├── 3-competitor_intel.py # Competitor analysis agent
│   │   ├── 4-revenue_analyst.py  # Revenue projection agent
│   │   └── data/                # Agent data files
│   ├── data/                    # Data files (GeoJSON, JSON)
│   ├── data_service.py          # Data fetching service
│   └── http_server.py           # Flask API bridge
├── frontend/
│   └── ui/
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/  # React components
│       │   │   ├── contexts/     # React contexts
│       │   │   └── App.tsx       # Main app component
│       │   ├── services/         # API service
│       │   └── utils/            # Utilities (PDF export)
│       ├── public/
│       │   └── data/             # Public data files
│       └── package.json
└── requirements.txt
```

---

## Data Sources

- **NYC Open Data** — Business licenses, pedestrian counts, subway stations
- **Google Places API** — Live competitor data (ratings, reviews, hours)
- **Census ACS** — Demographics, income distribution
- **RentCast API** — Rent price estimates
- **NYC Neighborhood GeoJSON** — Neighborhood boundaries and shapes

---

## API Endpoints

### GET /submit
Submit a location analysis request.

**Query Parameters:**
- `type` (string): Business type (e.g., "Boba Tea Shop")
- `demo` (string): Target demographic (e.g., "Gen Z Students")
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
  ]
}
```

### GET /health
Health check endpoint.

---

## Why Vantage Wins

| Dimension | Competitors | Vantage |
|-----------|-------------|---------|
| Cost | $10K–$50K/year | Accessible |
| Transparency | Black box | Every number cited |
| Interactivity | Static reports | Real-time analysis |
| Speed | Weeks | 60 seconds |
| Validation | "Trust us" | Confidence scores |
| Visualization | Basic maps | Interactive heatmaps |

---

## The Pitch

> "Site selection consulting costs $10,000 to $50,000. Enterprise tools are priced for chains, not first-time owners.
>
> We built an AI agent system that does in 60 seconds what consultants charge $10K for — and it shows exactly where every number comes from.
>
> Vantage. Find Your Edge."

---

## License

This project was built for Hack@Brown 2026.

---

## Disclaimer

This project was developed with assistance from AI coding tools.

---

**Built with dedication at Hack@Brown 2026**
