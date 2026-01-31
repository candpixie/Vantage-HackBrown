#!/bin/bash
# Run all backend agents
# Make sure to run from project root directory

cd "$(dirname "$0")"

echo "Starting SiteSelect Backend Agents..."
echo "Working directory: $(pwd)"
echo ""

# Start HTTP server (main entry point on port 8000)
echo "Starting HTTP Server on port 8000..."
python3 agents/http_server.py &
HTTP_SERVER_PID=$!

# Start location scout on port 8001
echo "Starting Location Scout on port 8001..."
python3 agents/2-location_scout.py &
SCOUT_PID=$!

# Start competitor intel
echo "Starting Competitor Intel..."
python3 agents/3-competitor_intel.py &
INTEL_PID=$!

# Start revenue analyst
echo "Starting Revenue Analyst..."
python3 agents/4-revenue_analyst.py &
ANALYST_PID=$!

# Start storefront visualizer
echo "Starting Storefront Visualizer..."
python3 agents/5-storefront-visualiser.py &
VISUALIZER_PID=$!

echo ""
echo "All agents started!"
echo "Orchestrator running on http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop all agents"
echo "PIDs: HTTP Server=$HTTP_SERVER_PID, Scout=$SCOUT_PID, Intel=$INTEL_PID, Analyst=$ANALYST_PID, Visualizer=$VISUALIZER_PID"

# Wait for interrupt
trap "kill $HTTP_SERVER_PID $SCOUT_PID $INTEL_PID $ANALYST_PID $VISUALIZER_PID 2>/dev/null; exit" INT
wait
