from uagents import Agent, Context, Model
import json
import os
from math import radians, cos, sin, asin, sqrt
from pathlib import Path

# Try to use AWS S3 data service, fallback to local files
try:
    import sys
    backend_dir = Path(__file__).parent.parent
    sys.path.insert(0, str(backend_dir))
    from aws_data_service import AWSDataService
    data_service = AWSDataService()
    USE_AWS_DATA = data_service.use_aws
except Exception as e:
    print(f"⚠️  AWS data service not available: {e}. Using local files.")
    USE_AWS_DATA = False
    data_service = None

# Load data from S3 or local files
subway_data = []
pedestrian_data = None

if USE_AWS_DATA and data_service:
    try:
        subway_data = data_service.get_subway_stations() or []
        # Get GeoJSON pedestrian data
        pedestrian_data = data_service.get_pedestrian_counts_geojson()
        # Ensure it's in GeoJSON format
        if not pedestrian_data or not isinstance(pedestrian_data, dict):
            pedestrian_data = {"features": []}
        elif 'features' not in pedestrian_data:
            pedestrian_data = {"features": []}
        print("✅ Loaded data from AWS S3")
    except Exception as e:
        print(f"⚠️  Error loading from S3: {e}. Falling back to local files.")
        USE_AWS_DATA = False

if not USE_AWS_DATA:
    # Fallback to local files
    data_dir = Path(__file__).parent / "data"
    try:
        with open(data_dir / "subway_stations.json") as f:
            subway_data = json.load(f)
        with open(data_dir / "Bi-Annual_Pedestrian_Counts.geojson") as f:
            pedestrian_data = json.load(f)
        print("✅ Loaded data from local files")
    except Exception as e:
        print(f"⚠️  Error loading local data: {e}")
        subway_data = []
        pedestrian_data = {"features": []}

# Agent configuration - supports Agentverse deployment
AGENT_ENDPOINT = os.getenv("LOCATION_SCOUT_ENDPOINT", "http://localhost:8001/submit")
AGENT_PORT = int(os.getenv("LOCATION_SCOUT_PORT", "8001"))
AGENT_NETWORK = os.getenv("FETCH_AI_NETWORK", "testnet")

location_scout = Agent(
    name="location_scout",
    seed="scout_seed_phrase",
    port=AGENT_PORT,
    endpoint=[AGENT_ENDPOINT],
    network=AGENT_NETWORK,
)

# Agentverse metadata (for registration)
AGENT_METADATA = {
    "name": "vantage-location-scout",
    "description": "Analyzes demographics, foot traffic, and transit access for location intelligence scoring",
    "version": "1.0.0",
    "capabilities": ["demographics", "foot_traffic", "transit_access", "location_scoring"],
    "tags": ["location-intelligence", "real-estate", "analytics", "nyc"],
    "author": "Vantage Team"
}
class Message(Model):
    message: str

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str
    latitude: float
    longitude: float
    rent_estimate: float

class ScoreResponse(Model):
    score: int
    confidence: str 
    breakdown: dict = {}


# Use the actual agent address derived from the seed phrase
ORCHESTRATOR_ADDRESS = "agent1q2wva7fjhjqfklv8sna6q3ftcaf32pt7fev5q9w0qwn5earml3a8qz24n4f"

@location_scout.on_event("startup")
async def startup_handler(ctx : Context):
    ctx.logger.info(f'My name is {ctx.agent.name} and my address  is {ctx.agent.address}')
    # Register the orchestrator's endpoint for local communication
    ctx.logger.info(f'Attempting to send message to orchestrator at {ORCHESTRATOR_ADDRESS}')
    await ctx.send(ORCHESTRATOR_ADDRESS, Message(message = 'Hi Orchestrator, fuck fetch.ai lol'))


@location_scout.on_message(model=ScoreRequest)
async def handle_message(ctx: Context, sender: str, scoreRequest: ScoreRequest):
    ctx.logger.info(f'I have received a request for {scoreRequest.neighborhood}')
    
    # Calculate location score with all factors
    location_result = calculate_location_score(
        scoreRequest.neighborhood, 
        scoreRequest.business_type, 
        scoreRequest.target_demo,
        scoreRequest.latitude,
        scoreRequest.longitude
    )
    
    final_score = location_result['score']
    
    ctx.logger.info(f'Location score: {location_result["score"]}')
    ctx.logger.info(f'Breakdown: {location_result["breakdown"]}')
    ctx.logger.info(f'Sending back overall score: {final_score}')
    
    await ctx.send(
        ORCHESTRATOR_ADDRESS, 
        ScoreResponse(
            score=final_score,
            confidence=location_result['confidence'],
            breakdown=location_result['breakdown']
        )
    )

def calculate_foot_traffic(lat, lng):
    """
    Calculate foot traffic based on nearby pedestrian counting locations
    Returns score 0-100 based on average pedestrian counts within 0.25 miles
    """
    nearby_counts = []
    
    for feature in pedestrian_data['features']:
        # Extract coordinates from GeoJSON
        coords = feature['geometry']['coordinates']
        count_lng, count_lat = coords[0], coords[1]
        
        # Calculate distance
        distance = haversine(lat, lng, count_lat, count_lng)
        
        # Include locations within 0.25 miles
        if distance <= 0.25:
            props = feature['properties']
            
            # Extract recent count data (most recent available periods)
            # Use oct24 (October 2024) and may25 (May 2025) as most recent
            recent_counts = []
            
            # October 2024 data
            if 'oct24_am' in props and props['oct24_am'] != "0":
                try:
                    recent_counts.append(int(props['oct24_am']))
                except (ValueError, TypeError):
                    pass
            if 'oct24_pm' in props and props['oct24_pm'] != "0":
                try:
                    recent_counts.append(int(props['oct24_pm']))
                except (ValueError, TypeError):
                    pass
            if 'oct24_md' in props and props['oct24_md'] != "0":
                try:
                    recent_counts.append(int(props['oct24_md']))
                except (ValueError, TypeError):
                    pass
            
            # May 2025 data
            if 'may25_am' in props and props['may25_am'] != "0":
                try:
                    recent_counts.append(int(props['may25_am']))
                except (ValueError, TypeError):
                    pass
            if 'may25_pm' in props and props['may25_pm'] != "0":
                try:
                    recent_counts.append(int(props['may25_pm']))
                except (ValueError, TypeError):
                    pass
            if 'may25_md' in props and props['may25_md'] != "0":
                try:
                    recent_counts.append(int(props['may25_md']))
                except (ValueError, TypeError):
                    pass
            
            if recent_counts:
                avg_count = sum(recent_counts) / len(recent_counts)
                nearby_counts.append({
                    'location': props.get('street_nam', 'Unknown'),
                    'distance': round(distance, 2),
                    'avg_count': round(avg_count),
                    'borough': props.get('borough', 'Unknown')
                })
    
    # Calculate score based on pedestrian traffic
    if not nearby_counts:
        return {
            'score': 0,
            'nearby_locations': [],
            'average_pedestrians': 0,
            'count': 0
        }
    
    # Get average pedestrian count from all nearby locations
    total_avg = sum(loc['avg_count'] for loc in nearby_counts) / len(nearby_counts)
    
    # Normalize to 0-100 score
    # Based on pedestrian count ranges:
    # 0-1000: Low traffic (0-40)
    # 1000-3000: Medium traffic (40-70)
    # 3000-5000: High traffic (70-90)
    # 5000+: Very high traffic (90-100)
    if total_avg <= 1000:
        score = (total_avg / 1000) * 40
    elif total_avg <= 3000:
        score = 40 + ((total_avg - 1000) / 2000) * 30
    elif total_avg <= 5000:
        score = 70 + ((total_avg - 3000) / 2000) * 20
    else:
        score = 90 + min((total_avg - 5000) / 5000 * 10, 10)
    
    return {
        'score': round(min(score, 100)),
        'nearby_locations': nearby_counts,
        'average_pedestrians': round(total_avg),
        'count': len(nearby_counts)
    }

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in miles
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    
    # Radius of earth in miles
    miles = 3959 * c
    return miles

# Transit Access Calculation
def calculate_transit_access(lat, lng, subway_data=subway_data,):
    """
    Count subway stations within 0.5 mile
    Returns score 0-100 based on proximity to subway stations
    """
    nearby_stations = []
    for station in subway_data:
        station_lat = float(station['gtfs_latitude'])
        station_lng = float(station['gtfs_longitude'])
        distance = haversine(lat, lng, station_lat, station_lng)
        if distance <= 0.5:  # miles
            nearby_stations.append({
                'name': station['stop_name'],
                'distance': round(distance, 2),
                'routes': station.get('daytime_routes', '')
            })
    
    # Score based on count and add breakdown
    station_count = len(nearby_stations)
    if station_count >= 3:
        score = 100
    elif station_count == 2:
        score = 80
    elif station_count == 1:
        score = 60
    else:
        score = 30
    
    return {
        'score': score,
        'nearby_stations': nearby_stations,
        'count': station_count
    }

def calculate_location_score(neighborhood, business_type, target_demo, latitude, longitude):
    """
    Returns score 0-100 with confidence level
    Calculates overall location score based on multiple factors
    """
    
    # Component scores (each 0-100)
    foot_traffic_result = calculate_foot_traffic(latitude, longitude)  # 40% weight
    transit_result = calculate_transit_access(latitude, longitude)     # 60% weight
    # demo_match = calculate_demo_match(neighborhood, target_demo)      # Future
    # TODO: implement this 
    
    # Calculate weighted total with current factors
    total = (
        foot_traffic_result['score'] * 0.40 +
        transit_result['score'] * 0.60
    )
    
    # Confidence based on available data
    data_points = 0
    if transit_result['count'] > 0:
        data_points += 1
    if foot_traffic_result['count'] > 0:
        data_points += 1
    
    if data_points >= 2:
        confidence = "high"
    elif data_points == 1:
        confidence = "medium"
    else:
        confidence = "low"
    
    return {
        "score": round(total),
        "confidence": confidence,
        "breakdown": {
            "foot_traffic": foot_traffic_result,
            "transit_access": transit_result,
            # Additional factors will be added here
        }
    }


if __name__ == "__main__":
    location_scout.run()
