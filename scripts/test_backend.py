#!/usr/bin/env python3
"""Quick test script to verify backend is working"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("Testing backend endpoints...\n")

# Test health endpoint
print("1. Testing /health endpoint...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    print("   ✓ Health check passed\n")
except Exception as e:
    print(f"   ✗ Health check failed: {e}\n")
    exit(1)

# Test submit endpoint
print("2. Testing /submit endpoint...")
try:
    test_request = {
        "business_type": "coffee shop",
        "target_demo": "students",
        "budget": 5000,
        "location_pref": "NYC"
    }
    response = requests.post(
        f"{BASE_URL}/submit",
        json=test_request,
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response status: {data.get('status')}")
    print(f"   Locations returned: {len(data.get('locations', []))}")
    print(f"   Agent statuses: {len(data.get('agent_statuses', []))}")
    print("   ✓ Submit endpoint passed\n")
except Exception as e:
    print(f"   ✗ Submit endpoint failed: {e}\n")
    exit(1)

print("All tests passed! Backend is working correctly.")
print(f"\nBackend is running at: {BASE_URL}")
print("Frontend should be able to connect now.")
