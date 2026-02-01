#!/usr/bin/env python3
"""
Deploy Vantage agents to Fetch.ai Agentverse
Registers all 4 agents on the Agentverse marketplace
"""
import os
import sys
import yaml
import json
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))

def load_config():
    """Load agentverse_config.yaml"""
    config_path = Path(__file__).parent.parent / 'agentverse_config.yaml'
    if not config_path.exists():
        print(f"❌ Config file not found: {config_path}")
        return None
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    return config

def check_credentials():
    """Check if Fetch.ai credentials are configured"""
    api_key = os.getenv('FETCH_AI_API_KEY')
    network = os.getenv('FETCH_AI_NETWORK', 'testnet')
    
    if not api_key:
        print("❌ FETCH_AI_API_KEY not found in environment")
        print("   Add to backend/.env:")
        print("   FETCH_AI_API_KEY=your_api_key_here")
        return False
    
    print(f"✅ Fetch.ai credentials found")
    print(f"   Network: {network}")
    return True

def check_agent_endpoints(config):
    """Check if agent endpoints are configured"""
    required_endpoints = [
        'ORCHESTRATOR_ENDPOINT',
        'LOCATION_SCOUT_ENDPOINT',
        'COMPETITOR_INTEL_ENDPOINT',
        'REVENUE_ANALYST_ENDPOINT'
    ]
    
    missing = []
    for endpoint_var in required_endpoints:
        endpoint = os.getenv(endpoint_var)
        if not endpoint or endpoint.startswith('http://localhost'):
            missing.append(endpoint_var)
    
    if missing:
        print(f"⚠️  Agent endpoints not configured:")
        for var in missing:
            print(f"   {var} is not set or still using localhost")
        print()
        print("For localhost testing, this is OK.")
        print("For Agentverse deployment, set public endpoints:")
        print("   ORCHESTRATOR_ENDPOINT=https://orchestrator.railway.app/submit")
        print("   LOCATION_SCOUT_ENDPOINT=https://location-scout.railway.app/submit")
        print("   etc.")
        return False
    
    print("✅ All agent endpoints configured")
    return True

def register_agent(agent_config, agent_name):
    """Register a single agent on Agentverse"""
    print(f"\n📦 Registering {agent_name}...")
    print(f"   Name: {agent_config['name']}")
    print(f"   Description: {agent_config['description'][:60]}...")
    print(f"   Endpoint: {agent_config.get('endpoint', 'N/A')}")
    
    # TODO: Implement actual Agentverse API registration
    # This is a placeholder - actual implementation depends on Agentverse API
    
    api_key = os.getenv('FETCH_AI_API_KEY')
    api_url = os.getenv('AGENTVERSE_API_URL', 'https://api.agentverse.ai')
    
    print(f"   ⚠️  Registration API call would go to: {api_url}")
    print(f"   ⚠️  Using API key: {api_key[:10]}...")
    
    # Example registration payload (adjust based on actual Agentverse API)
    registration_payload = {
        "name": agent_config['name'],
        "display_name": agent_config.get('display_name', agent_config['name']),
        "description": agent_config['description'],
        "version": agent_config['version'],
        "capabilities": agent_config['capabilities'],
        "tags": agent_config['tags'],
        "endpoint": agent_config.get('endpoint', ''),
        "network": agent_config.get('network', 'testnet'),
        "metadata": {
            "author": "Vantage Team",
            "source": "https://github.com/candpixie/Vantage-HackBrown"
        }
    }
    
    print(f"   📋 Registration payload prepared")
    print(f"   ⚠️  Actual API integration needed - see AGENTVERSE_SETUP.md")
    
    return True

def main():
    """Main deployment function"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║   🚀 VANTAGE AGENTS → AGENTVERSE DEPLOYMENT                  ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    
    # Load configuration
    config = load_config()
    if not config:
        return 1
    
    # Check credentials
    if not check_credentials():
        return 1
    
    # Check endpoints (warning only, not blocking)
    endpoints_ok = check_agent_endpoints(config.get('agents', {}))
    if not endpoints_ok:
        print("\n⚠️  Continuing with localhost endpoints (for testing)")
    
    # Register each agent
    agents = config.get('agents', {})
    registered = 0
    
    for agent_key, agent_config in agents.items():
        if register_agent(agent_config, agent_key):
            registered += 1
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 DEPLOYMENT SUMMARY")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Prepared registration for {registered}/{len(agents)} agents")
    print()
    print("⚠️  NOTE: This script prepares agent registration data.")
    print("   Actual registration requires:")
    print("   1. Agentverse API endpoint (check Agentverse docs)")
    print("   2. API authentication implementation")
    print("   3. Agent endpoints deployed to public URLs")
    print()
    print("📚 Next steps:")
    print("   1. Deploy agents to cloud (Railway, Render, etc.)")
    print("   2. Get public endpoint URLs")
    print("   3. Update environment variables with endpoints")
    print("   4. Use Agentverse dashboard or API to register agents")
    print("   5. Test agent discovery and communication")
    print()
    print("See AGENTVERSE_SETUP.md for detailed instructions.")
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
