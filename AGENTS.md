# Vantage — Location Intelligence Platform

AI-powered, multi-agent location-intelligence app for NYC small-business site selection. Two parts:

- **Frontend** (`frontend/`): React 18 + Vite 6 + Tailwind v4 SPA (Figma Make export). This is the product UI.
- **Backend** (`backend/`): Flask HTTP bridge that serves precomputed results from a JSON "database". An optional offline Fetch.ai uAgents pipeline regenerates that JSON but is not on the live request path.

## Cursor Cloud specific instructions

- **Frontend `package.json` is committed but was historically `.gitignore`d.** This is a Figma Make export; there was originally no `package.json` in the repo. It has been reconstructed from the source imports and committed (`frontend/package.json` + `frontend/package-lock.json`), and `.gitignore` was updated so they persist. Do not re-add these to `.gitignore`. If frontend deps look wrong, they were inferred from imports, so add missing packages as needed.
- **Backend entrypoint filename has a space and differs from the docs.** The Flask app is `backend/API worker.py` (note the space), NOT `backend/http_server.py` (which the README and `deployment/railway.toml` reference but does not exist). Run it quoted: `python3 "backend/API worker.py"`. `START_SERVER.md`'s `run_backend.sh` also does not exist.
- **Services / ports:**
  - Frontend dev server (Vite): `cd frontend && npm run dev` → http://localhost:5173
  - Flask API bridge: `python3 "backend/API worker.py"` → http://localhost:8020 (`/health`, `GET|POST /submit`, `POST /generate-insights`)
- **Frontend↔backend wiring:** the frontend calls `import.meta.env.VITE_API_URL || 'http://localhost:8020'`, so with the Flask server running locally no `.env.local` is needed. If the backend is down, `src/services/api.ts` falls back to rich mock data, so the UI still renders.
- **API keys are all optional for local dev.** Without `VITE_GOOGLE_MAPS_API_KEY` the map renders a "key not configured" placeholder; without `GEMINI_API_KEY` the `/generate-insights` endpoint returns a mock insight; RentCast/NYC/OpenAI features degrade gracefully. Put frontend keys in `frontend/.env.local` (gitignored) as `VITE_*` vars.
- **`/submit` needs a non-empty `backend/agents/output/orchestrator_results.json`** (committed sample ships in the repo). It returns 404 if that file is empty. The uAgents pipeline (`backend/agents/*.py`, ports 8000–8003) only regenerates this file and is optional; `3-competitor_intel.py` hard-fails to import without `GOOGLE_PLACES_API_KEY`.
- **No lint or automated test setup exists** in this repo (no ESLint/tsconfig/pytest config). "Build" check for the frontend is `cd frontend && npm run build`.
- Node v22 and Python 3.12 are used in this environment.
