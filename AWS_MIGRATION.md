# 🚀 AWS Database Migration Guide for Vantage

## 📊 Current Data Inventory

You have **~89MB** of data files:

| File | Size | Type | Usage |
|------|------|------|-------|
| `business_licenses.json` | 31MB | JSON | Location analysis |
| `restaurant_inspections.json` | 44MB | JSON | Competitor analysis |
| `Demographics.json` | 4.2MB | JSON | Demographics scoring |
| `neighborhoods.json` | 4.4MB | JSON | Neighborhood data |
| `neighborhoods.geojson` | 4.4MB | GeoJSON | Map overlays |
| `financial_by_neighbourhod.json` | 708KB | JSON | Financial data |
| `subway_stations.json` | 272KB | JSON | Transit analysis |
| `Bi-Annual_Pedestrian_Counts.geojson` | 268KB | GeoJSON | Foot traffic |
| `pedestrian_counts.json` | 4KB | JSON | Foot traffic |

---

## 🎯 Recommended AWS Architecture

### **Option 1: S3 + DynamoDB (Recommended for Start)**

**Best for:** Quick migration, cost-effective, scalable

```
┌─────────────────┐
│   S3 Bucket     │  ← Store large JSON/GeoJSON files
│  vantage-data   │     (business_licenses, demographics, etc.)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   DynamoDB      │  ← Store frequently queried data
│   Tables        │     (business_licenses, neighborhoods)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Lambda/EC2     │  ← Your backend reads from AWS
│  Backend        │
└─────────────────┘
```

**Cost:** ~$1-5/month (within free tier for first year)

### **Option 2: S3 + RDS PostgreSQL**

**Best for:** Complex queries, relational data

```
┌─────────────────┐
│   S3 Bucket     │  ← Store GeoJSON files
│  vantage-data   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  RDS PostgreSQL │  ← Structured data with SQL queries
│  vantage-db     │
└─────────────────┘
```

**Cost:** ~$15-30/month (RDS instance)

### **Option 3: S3 Only (Simplest)**

**Best for:** Minimal changes, just cloud storage

```
┌─────────────────┐
│   S3 Bucket     │  ← All files stored here
│  vantage-data   │     Backend reads directly from S3
└─────────────────┘
```

**Cost:** ~$0.50/month (very cheap!)

---

## 🚀 Quick Start: S3 Migration (Recommended)

### Step 1: Create S3 Bucket

1. **Go to AWS Console:** https://console.aws.amazon.com/s3/
2. **Click:** "Create bucket"
3. **Bucket name:** `vantage-location-data` (must be globally unique)
4. **Region:** `us-east-2` (Ohio - same as your console)
5. **Settings:**
   - ✅ Block all public access (keep private)
   - ✅ Enable versioning (optional)
   - ✅ Enable encryption (recommended)
6. **Click:** "Create bucket"

### Step 2: Upload Data Files

**Option A: AWS Console (Easiest)**

1. Click on your bucket
2. Click "Upload"
3. Drag & drop all files from `data/` folder
4. Click "Upload"

**Option B: AWS CLI (Faster for large files)**

```bash
# Install AWS CLI (if not installed)
# macOS: brew install awscli

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region: us-east-2

# Upload all files
cd /Users/candyxie/hackbrown-2
aws s3 sync data/ s3://vantage-location-data/ --exclude "*.git*"
```

### Step 3: Create IAM User for Backend

1. **Go to:** https://console.aws.amazon.com/iam/
2. **Click:** "Users" → "Create user"
3. **Username:** `vantage-backend`
4. **Access type:** ✅ Programmatic access
5. **Permissions:** Attach policy `AmazonS3ReadOnlyAccess`
6. **Click:** "Create user"
7. **Save:** Access Key ID and Secret Access Key (you'll need these!)

### Step 4: Update Backend Code

See `backend/aws_data_service.py` (created below)

---

## 💾 Option 2: DynamoDB Migration (For Queryable Data)

### Step 1: Create DynamoDB Tables

**Table 1: Business Licenses**

1. **Go to:** https://console.aws.amazon.com/dynamodb/
2. **Click:** "Create table"
3. **Table name:** `vantage-business-licenses`
4. **Partition key:** `license_id` (String)
5. **Sort key:** `neighborhood` (String) - optional
6. **Settings:** On-demand capacity
7. **Click:** "Create table"

**Table 2: Neighborhoods**

1. **Table name:** `vantage-neighborhoods`
2. **Partition key:** `neighborhood_id` (String)
3. **Settings:** On-demand capacity
4. **Click:** "Create table"

### Step 2: Import Data

Use the migration script below to import JSON → DynamoDB

---

## 📝 Migration Scripts

### Script 1: Upload to S3

```python
# scripts/upload_to_s3.py
import boto3
import os
from pathlib import Path

# Configuration
BUCKET_NAME = 'vantage-location-data'
DATA_DIR = Path(__file__).parent.parent / 'data'
AWS_REGION = 'us-east-2'

# Initialize S3 client
s3 = boto3.client('s3', region_name=AWS_REGION)

def upload_file(file_path: Path, s3_key: str):
    """Upload a file to S3"""
    try:
        s3.upload_file(str(file_path), BUCKET_NAME, s3_key)
        print(f"✅ Uploaded: {file_path.name} → s3://{BUCKET_NAME}/{s3_key}")
        return True
    except Exception as e:
        print(f"❌ Error uploading {file_path.name}: {e}")
        return False

def main():
    """Upload all data files to S3"""
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
    
    uploaded = 0
    for filename in files_to_upload:
        file_path = DATA_DIR / filename
        if file_path.exists():
            if upload_file(file_path, filename):
                uploaded += 1
        else:
            print(f"⚠️  File not found: {filename}")
    
    print(f"\n✅ Uploaded {uploaded}/{len(files_to_upload)} files to S3")

if __name__ == '__main__':
    main()
```

### Script 2: Import to DynamoDB

```python
# scripts/import_to_dynamodb.py
import boto3
import json
from pathlib import Path
from decimal import Decimal

# Configuration
DATA_DIR = Path(__file__).parent.parent / 'data'
AWS_REGION = 'us-east-2'

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)

def decimal_default(obj):
    """Convert float to Decimal for DynamoDB"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    raise TypeError

def import_business_licenses():
    """Import business licenses to DynamoDB"""
    table = dynamodb.Table('vantage-business-licenses')
    
    file_path = DATA_DIR / 'business_licenses.json'
    if not file_path.exists():
        print(f"❌ File not found: {file_path}")
        return
    
    print(f"📖 Reading {file_path}...")
    with open(file_path, 'r') as f:
        licenses = json.load(f)
    
    print(f"📊 Found {len(licenses)} licenses")
    print("📤 Uploading to DynamoDB...")
    
    # Batch write (DynamoDB allows 25 items per batch)
    batch_size = 25
    imported = 0
    
    for i in range(0, len(licenses), batch_size):
        batch = licenses[i:i+batch_size]
        with table.batch_writer() as writer:
            for license in batch:
                # Convert to DynamoDB format
                item = json.loads(json.dumps(license), parse_float=Decimal)
                item['license_id'] = str(license.get('license_id', f"LIC-{i}"))
                writer.put_item(Item=item)
        imported += len(batch)
        print(f"  ✅ Imported {imported}/{len(licenses)}...")
    
    print(f"✅ Successfully imported {imported} licenses to DynamoDB")

if __name__ == '__main__':
    import_business_licenses()
```

---

## 🔧 Updated Backend Service

### AWS Data Service

```python
# backend/aws_data_service.py
"""
AWS-based data service for Vantage
Reads data from S3 and DynamoDB instead of local files
"""
import boto3
import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path

# AWS Configuration
AWS_REGION = os.getenv('AWS_REGION', 'us-east-2')
S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'vantage-location-data')
USE_AWS = os.getenv('USE_AWS', 'false').lower() == 'true'

# Initialize AWS clients
s3_client = None
dynamodb = None

if USE_AWS:
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
        dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
        print("✅ AWS clients initialized")
    except Exception as e:
        print(f"⚠️  AWS initialization failed: {e}")
        print("   Falling back to local files")


class AWSDataService:
    """Service for fetching data from AWS S3/DynamoDB"""
    
    def __init__(self):
        self.use_aws = USE_AWS and s3_client is not None
        self.s3_bucket = S3_BUCKET
        self._cache = {}  # Simple in-memory cache
    
    def _get_from_s3(self, s3_key: str) -> Optional[Dict]:
        """Fetch JSON file from S3"""
        if not self.use_aws:
            return None
        
        # Check cache first
        if s3_key in self._cache:
            return self._cache[s3_key]
        
        try:
            response = s3_client.get_object(Bucket=self.s3_bucket, Key=s3_key)
            data = json.loads(response['Body'].read().decode('utf-8'))
            self._cache[s3_key] = data  # Cache for this session
            print(f"✅ Loaded {s3_key} from S3 ({len(data) if isinstance(data, list) else 'N/A'} items)")
            return data
        except Exception as e:
            print(f"⚠️  Error loading {s3_key} from S3: {e}")
            return None
    
    def _get_from_local(self, filename: str) -> Optional[Dict]:
        """Fallback to local file"""
        data_dir = Path(__file__).parent.parent / 'data'
        file_path = data_dir / filename
        if file_path.exists():
            with open(file_path, 'r') as f:
                return json.load(f)
        return None
    
    def get_business_licenses(self) -> List[Dict]:
        """Get business licenses from S3 or local"""
        data = self._get_from_s3('business_licenses.json')
        if data is None:
            data = self._get_from_local('business_licenses.json')
        return data if data else []
    
    def get_demographics(self) -> Dict:
        """Get demographics data from S3 or local"""
        data = self._get_from_s3('Demographics.json')
        if data is None:
            data = self._get_from_local('Demographics.json')
        return data if data else {}
    
    def get_neighborhoods(self) -> Optional[Dict]:
        """Get neighborhoods GeoJSON from S3 or local"""
        data = self._get_from_s3('neighborhoods.geojson')
        if data is None:
            data = self._get_from_local('neighborhoods.geojson')
        return data
    
    def get_restaurant_inspections(self) -> List[Dict]:
        """Get restaurant inspections from S3 or local"""
        data = self._get_from_s3('restaurant_inspections.json')
        if data is None:
            data = self._get_from_local('restaurant_inspections.json')
        return data if data else []
    
    def get_subway_stations(self) -> List[Dict]:
        """Get subway stations from S3 or local"""
        data = self._get_from_s3('subway_stations.json')
        if data is None:
            data = self._get_from_local('subway_stations.json')
        return data if data else []
    
    def query_business_licenses_dynamodb(self, neighborhood: str) -> List[Dict]:
        """Query business licenses from DynamoDB (if using DynamoDB)"""
        if not self.use_aws or dynamodb is None:
            return []
        
        try:
            table = dynamodb.Table('vantage-business-licenses')
            response = table.query(
                KeyConditionExpression='neighborhood = :n',
                ExpressionAttributeValues={':n': neighborhood}
            )
            return response.get('Items', [])
        except Exception as e:
            print(f"⚠️  DynamoDB query error: {e}")
            return []
```

---

## 🔐 Environment Variables

Add to `backend/.env`:

```bash
# AWS Configuration
USE_AWS=true
AWS_REGION=us-east-2
AWS_S3_BUCKET=vantage-location-data
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Or use IAM role (if running on EC2/Lambda)
```

---

## 📦 Install AWS SDK

Add to `requirements.txt`:

```txt
boto3>=1.34.0
```

Then install:

```bash
pip install boto3
```

---

## 💰 Cost Estimation

### S3 Storage (Option 1 - Recommended)
- **Storage:** 89MB × $0.023/GB = **$0.002/month**
- **Requests:** 1,000 GET requests/month = **$0.0004**
- **Total:** **~$0.01/month** (practically free!)

### DynamoDB (Optional)
- **On-demand:** Pay per request
- **First 25GB free** (free tier)
- **After:** $1.25 per million requests
- **Estimated:** **$0-2/month** (depending on usage)

### RDS PostgreSQL (If using)
- **db.t3.micro:** $15/month (free tier eligible for 1 year)
- **Storage:** $0.115/GB/month
- **Estimated:** **$15-20/month**

---

## ✅ Migration Checklist

- [ ] Create S3 bucket in AWS Console
- [ ] Upload all data files to S3
- [ ] Create IAM user with S3 read permissions
- [ ] Install `boto3`: `pip install boto3`
- [ ] Add AWS credentials to `backend/.env`
- [ ] Update `data_service.py` to use `AWSDataService`
- [ ] Test backend with AWS data
- [ ] (Optional) Create DynamoDB tables
- [ ] (Optional) Import frequently queried data to DynamoDB

---

## 🚀 Next Steps

1. **Start with S3** (easiest, cheapest)
2. **Test with your backend**
3. **Add DynamoDB later** if you need faster queries
4. **Consider RDS** if you need complex SQL queries

---

## 📚 AWS Resources

- [S3 Documentation](https://docs.aws.amazon.com/s3/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

**Ready to migrate?** Start with S3 - it's the easiest and cheapest option! 🎉
