from uagents import Agent, Context, Model
import json
from pathlib import Path
import asyncio
from typing import List
import sys

# Add parent directory to path to import data_service
sys.path.append(str(Path(__file__).parent.parent))
from data_service import data_service

# this will create the dataset by repeatidly calling orchestrator agent on each vacant rental property

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str
    latitude: float
    longitude: float
    rent_estimate: float

# Rent estimates by borough (monthly commercial rent per sqft * average 1000 sqft)
BOROUGH_RENT_ESTIMATES = {
    'MANHATTAN': 12000,
    'BROOKLYN': 6500,
    'QUEENS': 5500,
    'BRONX': 4000,
    'STATEN ISLAND': 4500,
}

# Default target demographics by borough
BOROUGH_DEMOGRAPHICS = {
    'MANHATTAN': 'young professionals',
    'BROOKLYN': 'families and millennials',
    'QUEENS': 'diverse communities',
    'BRONX': 'local residents',
    'STATEN ISLAND': 'suburban families',
}

inputter = Agent(
    name="inputter",
    seed="inputter_seed_phrase",
    port=7999,
    endpoint="http://localhost:7999/submit",
)

# Use the actual agent address derived from the seed phrase
ORCHESTRATOR_ADDRESS = "agent1q2wva7fjhjqfklv8sna6q3ftcaf32pt7fev5q9w0qwn5earml3a8qz24n4f"

def load_vacant_storefronts(limit=5):
    """Load vacant storefront data from geojson file"""
    data_path = Path(__file__).parent / 'data' / 'Storefronts_Vacant_or_Not.geojson'
    
    try:
        with open(data_path, 'r') as f:
            data = json.load(f)
        
        vacant_storefronts = []
        for feature in data.get('features', []):
            if not feature:
                continue
                
            props = feature.get('properties') or {}
            geom = feature.get('geometry') or {}
            
            # Check if vacant (vacant_on_12_31 == 'Y' or == 'Yes')
            vacant_status = props.get('vacant_on_12_31')
            if vacant_status in ['Y', 'Yes']:
                # Get coordinates
                coords = geom.get('coordinates', [])
                if len(coords) >= 2 and coords[0] and coords[1]:
                    try:
                        storefront = {
                            'address': props.get('property_street_address_or', 'Unknown Address'),
                            'borough': props.get('borough', 'MANHATTAN'),
                            'neighborhood': props.get('nbhd') or props.get('nta') or 'Unknown',
                            'latitude': float(coords[1]),
                            'longitude': float(coords[0]),
                            'business_activity': props.get('primary_business_activity', 'retail'),
                            'zip_code': props.get('zip_code', ''),
                        }
                        vacant_storefronts.append(storefront)
                        
                        if len(vacant_storefronts) >= limit:
                            break
                    except (ValueError, TypeError) as e:
                        # Skip invalid coordinates
                        continue
        
        return vacant_storefronts
    except Exception as e:
        print(f"Error loading vacant storefronts: {e}")
        import traceback
        traceback.print_exc()
        return []


def get_rent_estimate(storefront: dict) -> float:
    """Get rent estimate using data_service API or fallback to hardcoded values"""
    lat = storefront['latitude']
    lng = storefront['longitude']
    borough = storefront['borough']
    
    # Try to get nearby rent prices from data_service
    nearby_listings = data_service.get_rent_prices_nearby(lat, lng, radius_miles=0.5)
    
    if nearby_listings:
        # Calculate average rent from nearby commercial listings
        commercial_rents = [
            listing['price'] for listing in nearby_listings 
            if listing.get('price') and listing.get('propertyType') == 'Commercial'
        ]
        
        if commercial_rents:
            avg_rent = sum(commercial_rents) / len(commercial_rents)
            return round(avg_rent, 2)
    
    # Fallback to hardcoded estimates if no data available
    return BOROUGH_RENT_ESTIMATES.get(borough, 6000)


@inputter.on_event("startup")
async def startup_handler(ctx: Context):
    ctx.logger.info(f'My name is {ctx.agent.name} and my address is {ctx.agent.address}')
    ctx.logger.info(f'Loading vacant storefronts data...')
    
    # Load vacant storefronts
    vacant_storefronts = load_vacant_storefronts(limit=100)
    ctx.logger.info(f'Loaded {len(vacant_storefronts)} vacant storefronts')
    
    # Fetch rent listings from data service
    ctx.logger.info('Fetching rent listings from data service...')
    rent_listings = data_service.fetch_rent_listings(limit=200)
    ctx.logger.info(f'Loaded {len(rent_listings)} rent listings')
    
    # Send score request for each vacant storefront
    for i, storefront in enumerate(vacant_storefronts):
        # Get rent estimate using data service or fallback
        rent_estimate = get_rent_estimate(storefront)
        
        # Get target demographic
        borough = storefront['borough']
        target_demo = BOROUGH_DEMOGRAPHICS.get(borough, 'general public')
        
        # Determine business type (default to retail if not specified)
        business_type = storefront.get('business_activity', 'retail')
        if not business_type or business_type.lower() in ['', 'none', 'unknown']:
            business_type = 'retail'
        
        # Create and send the score request
        score_request = ScoreRequest(
            neighborhood=storefront['neighborhood'],
            business_type=business_type,
            target_demo=target_demo,
            latitude=storefront['latitude'],
            longitude=storefront['longitude'],
            rent_estimate=rent_estimate
        )
        
        ctx.logger.info(f"[{i+1}/{len(vacant_storefronts)}] Sending ScoreRequest for {storefront['address']} in {storefront['neighborhood']} (rent: ${rent_estimate})")
        await ctx.send(ORCHESTRATOR_ADDRESS, score_request)
        
        # Add a small delay to avoid overwhelming the orchestrator
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    inputter.run()
