"""
Data Service for fetching rent prices, vacant spots, and demographics
Integrates with NYC Open Data, RentCast API, and local data files
"""
import json
import os
import requests
from typing import List, Dict, Any, Optional
from pathlib import Path

# API Keys (should be in environment variables)
NYC_TOKEN = os.getenv('NYC_DATA_TOKEN', '9i6PoUpIhhs3MQtMgrzwD6V2w')
RENTCAST_KEY = os.getenv('RENTCAST_API_KEY', '1c1465889dc540fea690207174029aff')

# Data URLs
NTA_GEOJSON_URL = 'https://data.cityofnewyork.us/resource/9nt8-h7nd.geojson'
POPULATION_URL = 'https://data.cityofnewyork.us/resource/swpk-hqdp.json'
CENSUS_URL = 'https://api.census.gov/data/2022/acs/acs5?get=NAME,B01002_001E,B19013_001E,B01003_001E&for=county:005,047,061,081,085&in=state:36'
RENTCAST_URL = 'https://api.rentcast.io/v1/listings/rental'

# Data directory
DATA_DIR = Path(__file__).parent / 'data'


class DataService:
    """Service for fetching and managing location data"""
    
    def __init__(self):
        self.rent_listings = []
        self.business_licenses = []
        self.demographics = {}
        self.neighborhoods = None
        self._load_local_data()
    
    def _load_local_data(self):
        """Load data from local JSON files"""
        try:
            # Load business licenses (potential vacant spots)
            biz_file = DATA_DIR / 'business_licenses.json'
            if biz_file.exists():
                with open(biz_file, 'r') as f:
                    self.business_licenses = json.load(f)
                    print(f"Loaded {len(self.business_licenses)} business licenses")
        except Exception as e:
            print(f"Error loading local data: {e}")
    
    def fetch_rent_listings(self, city: str = "New York", state: str = "NY", limit: int = 100) -> List[Dict]:
        """Fetch rental listings from RentCast API"""
        try:
            url = f"{RENTCAST_URL}?city={city}&state={state}&status=Active&limit={limit}"
            headers = {'X-Api-Key': RENTCAST_KEY, 'Accept': 'application/json'}
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                listings = []
                for item in (data if isinstance(data, list) else []):
                    listings.append({
                        'id': item.get('id', ''),
                        'address': item.get('formattedAddress') or item.get('addressLine1', 'Address unavailable'),
                        'lat': item.get('latitude'),
                        'lng': item.get('longitude'),
                        'price': item.get('price'),
                        'sqft': item.get('squareFootage'),
                        'bedrooms': item.get('bedrooms'),
                        'bathrooms': item.get('bathrooms'),
                        'propertyType': item.get('propertyType', 'Commercial'),
                        'listingType': item.get('listingType', 'Rental'),
                    })
                self.rent_listings = listings
                return listings
            else:
                print(f"RentCast API error: {response.status_code}")
                return self._get_mock_rent_listings()
        except Exception as e:
            print(f"Error fetching rent listings: {e}")
            return self._get_mock_rent_listings()
    
    def _get_mock_rent_listings(self) -> List[Dict]:
        """Return mock commercial rental listings"""
        return [
            {
                'id': 'm1', 'address': '235 E 22nd St, NY 10010',
                'lat': 40.7378, 'lng': -73.9823, 'price': 8500, 'sqft': 1200,
                'propertyType': 'Commercial', 'listingType': 'Rental'
            },
            {
                'id': 'm2', 'address': '156 W 56th St, NY 10019',
                'lat': 40.7649, 'lng': -73.9795, 'price': 12000, 'sqft': 1500,
                'propertyType': 'Commercial', 'listingType': 'Rental'
            },
            {
                'id': 'm3', 'address': '42 Greene St, NY 10013',
                'lat': 40.7226, 'lng': -74.0022, 'price': 9500, 'sqft': 1100,
                'propertyType': 'Commercial', 'listingType': 'Rental'
            },
            {
                'id': 'm4', 'address': '298 DeKalb Ave, Brooklyn, NY 11205',
                'lat': 40.6892, 'lng': -73.9712, 'price': 6000, 'sqft': 900,
                'propertyType': 'Commercial', 'listingType': 'Rental'
            },
            {
                'id': 'm5', 'address': '502 Park Ave, NY 10022',
                'lat': 40.7638, 'lng': -73.969, 'price': 15000, 'sqft': 2000,
                'propertyType': 'Commercial', 'listingType': 'Rental'
            },
        ]
    
    def get_vacant_spots(self, lat: float, lng: float, radius_miles: float = 0.5) -> List[Dict]:
        """Get potentially vacant commercial spots from business licenses"""
        vacant_spots = []
        
        # Filter business licenses near the location
        for biz in self.business_licenses[:1000]:  # Limit for performance
            try:
                biz_lat = float(biz.get('latitude', 0))
                biz_lng = float(biz.get('longitude', 0))
                
                if biz_lat == 0 or biz_lng == 0:
                    continue
                
                # Calculate distance (simple approximation)
                distance = ((biz_lat - lat) ** 2 + (biz_lng - lng) ** 2) ** 0.5 * 69  # Rough miles
                
                if distance <= radius_miles:
                    vacant_spots.append({
                        'address': f"{biz.get('building', '')} {biz.get('street', '')}",
                        'lat': biz_lat,
                        'lng': biz_lng,
                        'zipcode': biz.get('zipcode', ''),
                        'borough': biz.get('boro', ''),
                        'distance': round(distance, 2),
                    })
            except (ValueError, TypeError):
                continue
        
        return vacant_spots[:20]  # Return top 20
    
    def fetch_demographics(self) -> Dict[str, Any]:
        """Fetch demographics data from NYC Open Data and Census"""
        try:
            # Fetch neighborhood shapes
            nta_url = f"{NTA_GEOJSON_URL}?$limit=500&$$app_token={NYC_TOKEN}"
            nta_response = requests.get(nta_url, timeout=10)
            if nta_response.status_code == 200:
                self.neighborhoods = nta_response.json()
            
            # Fetch population data
            pop_response = requests.get(POPULATION_URL, timeout=10)
            population_data = {}
            if pop_response.status_code == 200:
                pop_data = pop_response.json()
                for item in pop_data:
                    nta_code = item.get('nta_code')
                    if nta_code:
                        population_data[nta_code] = {
                            'population': item.get('population', 0),
                            'density': item.get('density', 0),
                        }
            
            # Fetch census data
            census_response = requests.get(CENSUS_URL, timeout=10)
            census_data = {}
            if census_response.status_code == 200:
                # Parse census data (CSV format)
                lines = census_response.text.strip().split('\n')
                if len(lines) > 1:
                    headers = lines[0].split(',')
                    for line in lines[1:]:
                        values = line.split(',')
                        if len(values) >= len(headers):
                            county = values[-1] if len(values) > 0 else ''
                            census_data[county] = {
                                'median_age': values[1] if len(values) > 1 else 0,
                                'median_income': values[2] if len(values) > 2 else 0,
                                'total_population': values[3] if len(values) > 3 else 0,
                            }
            
            self.demographics = {
                'neighborhoods': self.neighborhoods,
                'population': population_data,
                'census': census_data,
            }
            
            return self.demographics
        except Exception as e:
            print(f"Error fetching demographics: {e}")
            return {}
    
    def get_location_demographics(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get demographics for a specific location"""
        # This would ideally match the location to an NTA code
        # For now, return average NYC demographics
        return {
            'median_income': 70000,
            'median_age': 36,
            'population_density': 27000,
            'household_size': 2.5,
        }
    
    def get_rent_prices_nearby(self, lat: float, lng: float, radius_miles: float = 0.5) -> List[Dict]:
        """Get rent prices for listings near a location"""
        nearby_listings = []
        
        for listing in self.rent_listings:
            if listing.get('lat') and listing.get('lng'):
                distance = ((listing['lat'] - lat) ** 2 + (listing['lng'] - lng) ** 2) ** 0.5 * 69
                if distance <= radius_miles:
                    listing_copy = listing.copy()
                    listing_copy['distance'] = round(distance, 2)
                    nearby_listings.append(listing_copy)
        
        return sorted(nearby_listings, key=lambda x: x.get('distance', 999))[:10]


# Global instance
data_service = DataService()
