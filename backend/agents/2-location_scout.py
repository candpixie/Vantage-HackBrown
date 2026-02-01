# location_scout.py
from uagents import Agent, Context, Model
import json

# Load data at startup
with open("data/business_licenses.json") as f:
    business_data = json.load(f)
    
with open("data/subway_stations.json") as f:
    subway_data = json.load(f)

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str

class ScoreResponse(Model):
    score: int
    confidence: str
    breakdown: dict
    data_sources: list

location_scout = Agent(
    name="location_scout",
    seed="scout_seed_phrase",
    port=8001,
    endpoint=["http://localhost:8001/submit"]
)


@location_scout.on_message(model=ScoreRequest)
async def score_location(ctx: Context, sender: str, msg: ScoreRequest):
    # Calculate score using local data
    score = calculate_location_score(
        msg.neighborhood, 
        msg.business_type,
        msg.target_demo
    )
    
    response = ScoreResponse(
        score=score["score"],
        confidence=score["confidence"],
        breakdown=score["breakdown"],
        data_sources=[
            "NYC Business Licenses (61K records)",
            "MTA Subway Stations (473 stations)"
        ]
    )
    
    await ctx.send(sender, response)

def calculate_location_score(neighborhood, business_type, target_demo):
    """
    Returns score 0-100 with confidence level
    """
    
    # Component scores (each 0-100)
    foot_traffic = calculate_foot_traffic(neighborhood)      # 30%
    demo_match = calculate_demo_match(neighborhood, target_demo)  # 25%
    transit = calculate_transit_access(neighborhood)         # 20%
    competition = calculate_competition_score(neighborhood, business_type)  # 15%
    rent_fit = calculate_rent_fit(neighborhood, budget)      # 10%
    
    # Weighted total
    total = (
        foot_traffic * 0.30 +
        demo_match * 0.25 +
        transit * 0.20 +
        competition * 0.15 +
        rent_fit * 0.10
    )
    
    # Confidence based on data availability
    confidence = calculate_confidence(data_points_used, total_possible)
    
    return {
        "score": round(total),
        "confidence": confidence,  # "high", "medium", "low"
        "breakdown": {
            "foot_traffic": foot_traffic,
            "demo_match": demo_match,
            "transit": transit,
            "competition": competition,
            "rent_fit": rent_fit
        }
    }

# Foot Traffic Calculation
def calculate_foot_traffic(neighborhood_code):
    """
    Based on business density from licenses data
    """
    businesses = [b for b in business_data if b['nta_code'] == neighborhood_code]
    density = len(businesses) / neighborhood_area
    
    # Normalize to 0-100
    # High density = high foot traffic (proxy)
    max_density = 500  # businesses per sq km
    score = min(100, (density / max_density) * 100)
    
    return score

# Transit Access Calculation
def calculate_transit_access(lat, lng):
    """
    Count subway stations within 0.5 mile
    """
    nearby_stations = []
    for station in subway_data:
        distance = haversine(lat, lng, station['lat'], station['lng'])
        if distance <= 0.5:  # miles
            nearby_stations.append(station)
    
    # Score based on count
    if len(nearby_stations) >= 3:
        return 100
    elif len(nearby_stations) == 2:
        return 80
    elif len(nearby_stations) == 1:
        return 60
    else:
        return 30

# Competition Score Calculation
def calculate_competition_score(neighborhood, business_type):
    """
    Paradox: Some competition = good (proven market)
    Too much competition = bad (saturated)
    """
    competitors = count_competitors(neighborhood, business_type)
    
    if competitors == 0:
        return 50  # Unproven market
    elif competitors <= 3:
        return 90  # Sweet spot - proven but not saturated
    elif competitors <= 6:
        return 70  # Getting crowded
    elif competitors <= 10:
        return 50  # Saturated
    else:
        return 30  # Oversaturated

if __name__ == "__main__":
    location_scout.run()