"""
AWS-based data service for Vantage
Reads data from S3 instead of local files
Falls back to local files if AWS is not configured
"""
import boto3
import json
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from botocore.exceptions import ClientError

# AWS Configuration
AWS_REGION = os.getenv('AWS_REGION', 'us-east-2')
S3_BUCKET = os.getenv('AWS_S3_BUCKET', 'vantage-location-data')
USE_AWS = os.getenv('USE_AWS', 'false').lower() == 'true'

# Initialize AWS clients
s3_client = None

if USE_AWS:
    try:
        s3_client = boto3.client('s3', region_name=AWS_REGION)
        print("✅ AWS S3 client initialized")
    except Exception as e:
        print(f"⚠️  AWS S3 initialization failed: {e}")
        print("   Falling back to local files")
        USE_AWS = False


class AWSDataService:
    """Service for fetching data from AWS S3 with local fallback"""
    
    def __init__(self):
        self.use_aws = USE_AWS and s3_client is not None
        self.s3_bucket = S3_BUCKET
        self._cache = {}  # Simple in-memory cache
        self.data_dir = Path(__file__).parent.parent / 'data'
    
    def _get_from_s3(self, s3_key: str) -> Optional[Any]:
        """Fetch JSON/GeoJSON file from S3"""
        if not self.use_aws:
            return None
        
        # Check cache first
        if s3_key in self._cache:
            return self._cache[s3_key]
        
        try:
            response = s3_client.get_object(Bucket=self.s3_bucket, Key=s3_key)
            content = response['Body'].read().decode('utf-8')
            data = json.loads(content)
            self._cache[s3_key] = data  # Cache for this session
            print(f"✅ Loaded {s3_key} from S3")
            return data
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'NoSuchKey':
                print(f"⚠️  File {s3_key} not found in S3")
            else:
                print(f"⚠️  Error loading {s3_key} from S3: {e}")
            return None
        except Exception as e:
            print(f"⚠️  Error parsing {s3_key} from S3: {e}")
            return None
    
    def _get_from_local(self, filename: str) -> Optional[Any]:
        """Fallback to local file"""
        file_path = self.data_dir / filename
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                print(f"✅ Loaded {filename} from local storage")
                return data
            except Exception as e:
                print(f"⚠️  Error loading {filename} from local: {e}")
        else:
            print(f"⚠️  Local file not found: {filename}")
        return None
    
    def get_business_licenses(self) -> List[Dict]:
        """Get business licenses from S3 or local"""
        data = self._get_from_s3('business_licenses.json')
        if data is None:
            data = self._get_from_local('business_licenses.json')
        return data if isinstance(data, list) else []
    
    def get_demographics(self) -> Dict:
        """Get demographics data from S3 or local"""
        data = self._get_from_s3('Demographics.json')
        if data is None:
            data = self._get_from_local('Demographics.json')
        return data if isinstance(data, dict) else {}
    
    def get_neighborhoods(self) -> Optional[Dict]:
        """Get neighborhoods GeoJSON from S3 or local"""
        data = self._get_from_s3('neighborhoods.geojson')
        if data is None:
            data = self._get_from_local('neighborhoods.geojson')
        return data
    
    def get_neighborhoods_json(self) -> Optional[Dict]:
        """Get neighborhoods JSON from S3 or local"""
        data = self._get_from_s3('neighborhoods.json')
        if data is None:
            data = self._get_from_local('neighborhoods.json')
        return data
    
    def get_restaurant_inspections(self) -> List[Dict]:
        """Get restaurant inspections from S3 or local"""
        data = self._get_from_s3('restaurant_inspections.json')
        if data is None:
            data = self._get_from_local('restaurant_inspections.json')
        return data if isinstance(data, list) else []
    
    def get_subway_stations(self) -> List[Dict]:
        """Get subway stations from S3 or local"""
        data = self._get_from_s3('subway_stations.json')
        if data is None:
            data = self._get_from_local('subway_stations.json')
        return data if isinstance(data, list) else []
    
    def get_financial_data(self) -> Dict:
        """Get financial data by neighborhood from S3 or local"""
        data = self._get_from_s3('financial_by_neighbourhod.json')
        if data is None:
            data = self._get_from_local('financial_by_neighbourhod.json')
        return data if isinstance(data, dict) else {}
    
    def get_pedestrian_counts(self) -> Optional[Dict]:
        """Get pedestrian counts from S3 or local"""
        data = self._get_from_s3('pedestrian_counts.json')
        if data is None:
            data = self._get_from_local('pedestrian_counts.json')
        return data
    
    def get_pedestrian_counts_geojson(self) -> Optional[Dict]:
        """Get pedestrian counts GeoJSON from S3 or local"""
        data = self._get_from_s3('Bi-Annual_Pedestrian_Counts.geojson')
        if data is None:
            data = self._get_from_local('Bi-Annual_Pedestrian_Counts.geojson')
        return data
