from uagents import Agent, Context, Model
import json
from math import radians, cos, sin, asin, sqrt

with open("data/subway_stations.json") as f:
    subway_data = json.load(f)

location_scout = Agent(
    name="location_scout",
    seed="scout_seed_phrase",
    port=8001,
    endpoint=["http://localhost:8001/submit"],
    network="testnet",
)
class Message(Model):
    message: str

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str
    latitude: float
    longitude: float

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
# # Foot Traffic Calculation
# def calculate_foot_traffic(neighborhood_code):
#     """
#     Based on business density from licenses data
#     """
#     businesses = [b for b in business_data if b['nta_code'] == neighborhood_code]
#     density = len(businesses) / neighborhood_area
    
#     # Normalize to 0-100
#     # High density = high foot traffic (proxy)
#     max_density = 500  # businesses per sq km
#     score = min(100, (density / max_density) * 100)
#     return score

# # Transit Access Calculation
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
    # foot_traffic = calculate_foot_traffic(neighborhood)      # 30%
    # demo_match = calculate_demo_match(neighborhood, target_demo)  # 25%
    transit_result = calculate_transit_access(latitude, longitude)   # Currently 100% weight
    # competition = calculate_competition(neighborhood)         # 15%
    # rent_fit = calculate_rent_fit(neighborhood, budget)      # 10%
    
    # For now, use only transit score (other factors will be added later)
    # Once more factors are added, calculate weighted total:
    # total = (
    #     foot_traffic * 0.30 +
    #     demo_match * 0.25 +
    #     transit_result['score'] * 0.20 +
    #     competition * 0.15 +
    #     rent_fit * 0.10
    # )
    
    total = transit_result['score']  # Temporary: 100% weight on transit
    
    # Confidence based on available data
    confidence = "high" if transit_result['count'] > 0 else "low"
    
    return {
        "score": round(total),
        "confidence": confidence,
        "breakdown": {
            "transit_access": transit_result,
            # Additional factors will be added here
        }
    }




if __name__ == "__main__":
    location_scout.run()