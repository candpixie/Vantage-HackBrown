#!/usr/bin/env python3
"""
Upload Vantage data files to AWS S3
Run this script to migrate your local data to AWS
"""
import boto3
import os
import json
from pathlib import Path
from botocore.exceptions import ClientError

# Configuration
BUCKET_NAME = os.getenv('AWS_S3_BUCKET', 'vantage-location-data')
AWS_REGION = os.getenv('AWS_REGION', 'us-east-2')
DATA_DIR = Path(__file__).parent.parent / 'data'

def check_aws_credentials():
    """Check if AWS credentials are configured"""
    try:
        session = boto3.Session()
        credentials = session.get_credentials()
        if credentials is None:
            print("❌ AWS credentials not found!")
            print("\nTo configure AWS credentials:")
            print("1. Install AWS CLI: brew install awscli")
            print("2. Run: aws configure")
            print("3. Enter your Access Key ID and Secret Access Key")
            print("\nOr set environment variables:")
            print("  export AWS_ACCESS_KEY_ID=your_key")
            print("  export AWS_SECRET_ACCESS_KEY=your_secret")
            return False
        print("✅ AWS credentials found")
        return True
    except Exception as e:
        print(f"❌ Error checking credentials: {e}")
        return False

def check_bucket_exists(s3_client, bucket_name):
    """Check if S3 bucket exists"""
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"✅ Bucket '{bucket_name}' exists")
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"❌ Bucket '{bucket_name}' does not exist")
            print(f"\nCreate it in AWS Console:")
            print(f"  https://console.aws.amazon.com/s3/")
            print(f"  Or run: aws s3 mb s3://{bucket_name} --region {AWS_REGION}")
        else:
            print(f"❌ Error checking bucket: {e}")
        return False

def upload_file(s3_client, file_path: Path, s3_key: str):
    """Upload a file to S3"""
    try:
        file_size = file_path.stat().st_size
        size_mb = file_size / (1024 * 1024)
        
        print(f"📤 Uploading {file_path.name} ({size_mb:.2f} MB)...", end=" ")
        
        s3_client.upload_file(
            str(file_path),
            BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': 'application/json' if file_path.suffix == '.json' else 'application/geo+json'}
        )
        
        print("✅")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main migration function"""
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║                                                              ║")
    print("║   🚀 VANTAGE DATA → AWS S3 MIGRATION                        ║")
    print("║                                                              ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    
    # Check AWS credentials
    if not check_aws_credentials():
        return
    
    # Initialize S3 client
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
        print(f"✅ Connected to AWS S3 (region: {AWS_REGION})")
    except Exception as e:
        print(f"❌ Error connecting to S3: {e}")
        return
    
    # Check if bucket exists
    if not check_bucket_exists(s3_client, BUCKET_NAME):
        return
    
    # Files to upload
    files_to_upload = [
        'business_licenses.json',
        'restaurant_inspections.json',
        'Demographics.json',
        'neighborhoods.json',
        'neighborhoods.geojson',
        'financial_by_neighbourhod.json',
        'subway_stations.json',
        'Bi-Annual_Pedestrian_Counts.geojson',
        'pedestrian_counts.json'
    ]
    
    print(f"\n📁 Data directory: {DATA_DIR}")
    print(f"📦 S3 bucket: s3://{BUCKET_NAME}")
    print(f"\n📋 Files to upload: {len(files_to_upload)}")
    print()
    
    # Upload files
    uploaded = 0
    failed = 0
    total_size = 0
    
    for filename in files_to_upload:
        file_path = DATA_DIR / filename
        if file_path.exists():
            file_size = file_path.stat().st_size
            total_size += file_size
            if upload_file(s3_client, file_path, filename):
                uploaded += 1
            else:
                failed += 1
        else:
            print(f"⚠️  File not found: {filename}")
            failed += 1
    
    # Summary
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 MIGRATION SUMMARY")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Uploaded: {uploaded}/{len(files_to_upload)} files")
    if failed > 0:
        print(f"❌ Failed: {failed} files")
    print(f"📦 Total size: {total_size / (1024 * 1024):.2f} MB")
    print()
    
    if uploaded == len(files_to_upload):
        print("🎉 Migration complete! All files uploaded to S3.")
        print()
        print("Next steps:")
        print("1. Update backend/.env with AWS credentials")
        print("2. Set USE_AWS=true in backend/.env")
        print("3. Install boto3: pip install boto3")
        print("4. Restart backend server")
    else:
        print("⚠️  Some files failed to upload. Check errors above.")

if __name__ == '__main__':
    main()
