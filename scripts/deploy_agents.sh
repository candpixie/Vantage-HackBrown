#!/bin/bash
# Deploy Vantage Agents to Cloud Platforms
# Supports Railway, Render, Fly.io deployment

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   🚀 VANTAGE AGENTS DEPLOYMENT SCRIPT                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PLATFORM="${1:-railway}"  # railway, render, flyio
AGENTS=("orchestrator" "location_scout" "competitor_intel" "revenue_analyst")

echo "📋 Deployment Configuration:"
echo "   Platform: $PLATFORM"
echo "   Agents: ${AGENTS[*]}"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python 3 found${NC}"

if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ requirements.txt found${NC}"

# Check environment variables
echo ""
echo "🔐 Checking environment variables..."

REQUIRED_VARS=(
    "AWS_S3_BUCKET"
    "AWS_REGION"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Set these in your deployment platform's environment variables."
else
    echo -e "${GREEN}✅ All required environment variables set${NC}"
fi

# Platform-specific deployment
case $PLATFORM in
    railway)
        echo ""
        echo "🚂 Railway Deployment:"
        echo "   1. Install Railway CLI: npm i -g @railway/cli"
        echo "   2. Login: railway login"
        echo "   3. For each agent, create a new service:"
        echo "      railway init"
        echo "      railway up"
        echo ""
        echo "   Each agent needs its own Railway service with:"
        echo "   - Root directory: backend/agents"
        echo "   - Start command: python <agent_file>.py"
        echo "   - Environment variables from backend/.env"
        ;;
    render)
        echo ""
        echo "🎨 Render Deployment:"
        echo "   1. Go to: https://dashboard.render.com"
        echo "   2. Create a new 'Web Service' for each agent"
        echo "   3. Connect your GitHub repository"
        echo "   4. Configure each service:"
        echo "      - Root Directory: backend/agents"
        echo "      - Build Command: pip install -r ../../requirements.txt"
        echo "      - Start Command: python <agent_file>.py"
        echo "      - Environment: Python 3"
        echo "   5. Add environment variables in Render dashboard"
        ;;
    flyio)
        echo ""
        echo "✈️  Fly.io Deployment:"
        echo "   1. Install Fly CLI: curl -L https://fly.io/install.sh | sh"
        echo "   2. Login: fly auth login"
        echo "   3. For each agent, create a fly.toml and deploy:"
        echo "      fly launch"
        echo "      fly deploy"
        ;;
    *)
        echo -e "${RED}❌ Unknown platform: $PLATFORM${NC}"
        echo "Supported platforms: railway, render, flyio"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Deploy each agent to $PLATFORM (see instructions above)"
echo "2. Get public endpoint URLs for each agent"
echo "3. Update environment variables:"
echo "   ORCHESTRATOR_ENDPOINT=https://your-orchestrator-url.com/submit"
echo "   LOCATION_SCOUT_ENDPOINT=https://your-location-scout-url.com/submit"
echo "   COMPETITOR_INTEL_ENDPOINT=https://your-competitor-intel-url.com/submit"
echo "   REVENUE_ANALYST_ENDPOINT=https://your-revenue-analyst-url.com/submit"
echo ""
echo "4. Register agents on Agentverse:"
echo "   python3 scripts/deploy_to_agentverse.py"
echo ""
echo "5. Test agent communication:"
echo "   python3 scripts/test_agentverse.py"
echo ""
echo "📚 See AGENTVERSE_SETUP.md for detailed instructions"
echo ""
