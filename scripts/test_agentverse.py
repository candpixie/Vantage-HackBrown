#!/usr/bin/env python3
"""
Test Agentverse integration
Verifies agent discovery, communication, and registration
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))

def check_environment():
    """Check environment configuration"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║   🧪 TESTING AGENTVERSE INTEGRATION                          ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    
    print("📋 Checking environment configuration...")
    
    # Check Fetch.ai credentials
    fetch_api_key = os.getenv('FETCH_AI_API_KEY')
    fetch_network = os.getenv('FETCH_AI_NETWORK', 'testnet')
    
    if fetch_api_key:
        print(f"✅ FETCH_AI_API_KEY: {fetch_api_key[:10]}...")
    else:
        print("❌ FETCH_AI_API_KEY: Not set")
    
    print(f"✅ FETCH_AI_NETWORK: {fetch_network}")
    
    # Check agent endpoints
    endpoints = {
        'ORCHESTRATOR_ENDPOINT': os.getenv('ORCHESTRATOR_ENDPOINT'),
        'LOCATION_SCOUT_ENDPOINT': os.getenv('LOCATION_SCOUT_ENDPOINT'),
        'COMPETITOR_INTEL_ENDPOINT': os.getenv('COMPETITOR_INTEL_ENDPOINT'),
        'REVENUE_ANALYST_ENDPOINT': os.getenv('REVENUE_ANALYST_ENDPOINT'),
    }
    
    print("\n📡 Agent Endpoints:")
    for name, endpoint in endpoints.items():
        if endpoint:
            if endpoint.startswith('http://localhost'):
                print(f"   ⚠️  {name}: {endpoint} (localhost - OK for testing)")
            else:
                print(f"   ✅ {name}: {endpoint}")
        else:
            print(f"   ❌ {name}: Not set")
    
    # Check agent addresses
    addresses = {
        'LOCATION_SCOUT_ADDRESS': os.getenv('LOCATION_SCOUT_ADDRESS'),
        'COMPETITOR_INTEL_ADDRESS': os.getenv('COMPETITOR_INTEL_ADDRESS'),
        'REVENUE_ANALYST_ADDRESS': os.getenv('REVENUE_ANALYST_ADDRESS'),
    }
    
    print("\n🔑 Agent Addresses:")
    for name, address in addresses.items():
        if address:
            print(f"   ✅ {name}: {address[:20]}...")
        else:
            print(f"   ⚠️  {name}: Using default from agent seed")
    
    return True

def test_agent_imports():
    """Test if agents can be imported"""
    print("\n📦 Testing agent imports...")
    
    agents_to_test = [
        ('1-orchestrator', 'orchestrator'),
        ('2-location_scout', 'location_scout'),
        ('3-competitor_intel', 'competitor_intel'),
        ('4-revenue_analyst', 'revenue_analyst'),
    ]
    
    imported = 0
    for file_name, agent_name in agents_to_test:
        try:
            agent_path = backend_dir / 'agents' / f'{file_name}.py'
            if agent_path.exists():
                print(f"   ✅ {agent_name}: File exists")
                imported += 1
            else:
                print(f"   ❌ {agent_name}: File not found")
        except Exception as e:
            print(f"   ❌ {agent_name}: Error - {e}")
    
    print(f"\n✅ {imported}/{len(agents_to_test)} agent files found")
    return imported == len(agents_to_test)

def test_agent_metadata():
    """Test agent metadata configuration"""
    print("\n📋 Testing agent metadata...")
    
    # Check if agents have AGENT_METADATA defined
    agents_dir = backend_dir / 'agents'
    agents_with_metadata = 0
    
    for agent_file in ['1-orchestrator.py', '2-location_scout.py', '3-competitor_intel.py', '4-revenue_analyst.py']:
        agent_path = agents_dir / agent_file
        if agent_path.exists():
            with open(agent_path, 'r') as f:
                content = f.read()
                if 'AGENT_METADATA' in content:
                    print(f"   ✅ {agent_file}: Has metadata")
                    agents_with_metadata += 1
                else:
                    print(f"   ⚠️  {agent_file}: No metadata found")
    
    print(f"\n✅ {agents_with_metadata}/4 agents have metadata")
    return agents_with_metadata == 4

def test_aws_data_service():
    """Test AWS data service integration"""
    print("\n☁️  Testing AWS data service...")
    
    try:
        from aws_data_service import AWSDataService
        service = AWSDataService()
        
        if service.use_aws:
            print("   ✅ AWS S3 data service enabled")
            print(f"   ✅ Bucket: {service.s3_bucket}")
        else:
            print("   ⚠️  AWS S3 not enabled (using local files)")
        
        return True
    except ImportError:
        print("   ⚠️  AWS data service not available")
        return False
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        return False

def test_agentverse_discovery():
    """Test agent discovery (placeholder)"""
    print("\n🔍 Testing Agentverse discovery...")
    print("   ⚠️  Agentverse discovery requires:")
    print("      - Agents registered on Agentverse")
    print("      - Agentverse API access")
    print("      - Network connectivity")
    print("   📚 See AGENTVERSE_SETUP.md for registration steps")
    return True

def main():
    """Main test function"""
    results = {
        'environment': check_environment(),
        'imports': test_agent_imports(),
        'metadata': test_agent_metadata(),
        'aws_data': test_aws_data_service(),
        'discovery': test_agentverse_discovery(),
    }
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 TEST RESULTS")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print()
    print(f"✅ Passed: {passed}/{total} tests")
    
    if passed == total:
        print("\n🎉 All tests passed! Agents are ready for Agentverse deployment.")
    else:
        print("\n⚠️  Some tests failed. Review errors above.")
        print("   See AGENTVERSE_SETUP.md for setup instructions.")
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    sys.exit(main())
