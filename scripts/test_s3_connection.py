#!/usr/bin/env python3
"""
Test S3 connection and verify data files are accessible
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_dir))

# Load environment variables from .env if it exists
env_file = backend_dir / '.env'
if env_file.exists():
    print(f"📖 Loading environment from {env_file}")
    with open(env_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

print("╔══════════════════════════════════════════════════════════════╗")
print("║                                                              ║")
print("║   🧪 TESTING AWS S3 CONNECTION                                ║")
print("║                                                              ║")
print("╚══════════════════════════════════════════════════════════════╝")
print()

# Check if boto3 is installed
try:
    import boto3
    print("✅ boto3 is installed")
except ImportError:
    print("❌ boto3 is NOT installed")
    print()
    print("Install it with:")
    print("  pip3 install boto3")
    sys.exit(1)

# Check environment variables
print("\n📋 Checking environment variables...")
use_aws = os.getenv('USE_AWS', 'false').lower() == 'true'
bucket = os.getenv('AWS_S3_BUCKET', 'vantage-location-data')
region = os.getenv('AWS_REGION', 'us-east-2')
access_key = os.getenv('AWS_ACCESS_KEY_ID', '')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY', '')

print(f"  USE_AWS: {use_aws}")
print(f"  Bucket: {bucket}")
print(f"  Region: {region}")
print(f"  Access Key: {'✅ Set' if access_key else '❌ Missing'}")
print(f"  Secret Key: {'✅ Set' if secret_key else '❌ Missing'}")

if not use_aws:
    print("\n⚠️  USE_AWS is not set to 'true'")
    print("   Set USE_AWS=true in backend/.env")

if not access_key or not secret_key:
    print("\n❌ AWS credentials not found!")
    print("   Add them to backend/.env:")
    print("   AWS_ACCESS_KEY_ID=your_key")
    print("   AWS_SECRET_ACCESS_KEY=your_secret")
    sys.exit(1)

print("\n🔌 Testing S3 connection...")
try:
    from aws_data_service import AWSDataService
    print("✅ AWSDataService imported")
    
    service = AWSDataService()
    print(f"✅ Service initialized (use_aws={service.use_aws})")
    
    if not service.use_aws:
        print("\n⚠️  AWS is disabled or not configured")
        print("   Check USE_AWS=true in backend/.env")
        sys.exit(1)
    
    # Test files
    test_files = [
        ('business_licenses.json', 'get_business_licenses'),
        ('neighborhoods.geojson', 'get_neighborhoods'),
        ('Demographics.json', 'get_demographics'),
        ('subway_stations.json', 'get_subway_stations'),
    ]
    
    print("\n📦 Testing file access from S3...")
    print()
    
    success_count = 0
    for filename, method_name in test_files:
        print(f"Testing {filename}...", end=" ")
        try:
            method = getattr(service, method_name)
            data = method()
            
            if data:
                if isinstance(data, list):
                    count = len(data)
                    print(f"✅ Loaded {count} items")
                elif isinstance(data, dict):
                    if 'features' in data:
                        count = len(data['features'])
                        print(f"✅ Loaded GeoJSON with {count} features")
                    else:
                        print(f"✅ Loaded dictionary")
                else:
                    print(f"✅ Loaded data")
                success_count += 1
            else:
                print(f"⚠️  No data returned")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 TEST RESULTS")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Successfully loaded: {success_count}/{len(test_files)} files")
    print()
    
    if success_count == len(test_files):
        print("🎉 ALL TESTS PASSED! S3 connection is working!")
        print()
        print("Your backend is ready to use AWS S3!")
        print("Restart your backend and check logs for:")
        print('  "✅ Loaded ... from S3"')
    elif success_count > 0:
        print("⚠️  Some files loaded successfully, but not all")
        print("   Check if all files were uploaded to S3")
    else:
        print("❌ No files could be loaded from S3")
        print("   Check:")
        print("   1. Files are uploaded to S3 bucket")
        print("   2. Bucket name is correct")
        print("   3. AWS credentials have read permissions")
        
except Exception as e:
    print(f"\n❌ Error testing S3 connection: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
