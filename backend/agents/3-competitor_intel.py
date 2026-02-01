# competitor_intel.py
from uagents import Agent, Context, Model
import requests
import os

class CompetitorRequest(Model):
    lat: float
    lng: float
    business_type: str
    radius: int = 1000  # meters

class Competitor(Model):
    name: str
    rating: float
    reviews: int
    price_level: int
    address: str

class CompetitorResponse(Model):
    competitors: list
    saturation_score: int  # 0-100, higher = more saturated
    gap_analysis: str
    data_source: str

competitor_intel = Agent(
    name="competitor_intel",
    seed="compdawg",
    port=8002,
    endpoint=["http://localhost:8002/submit"],
    network="testnet"
)

GOOGLE_PLACES_API_KEY = "AIzaSyD8miMgNXY0knfl3zPD4RroatsVKJRGGQc"

def get_nearby_competitors(lat, lng, business_type, radius):
    """Fetch competitors from Google Places API"""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "type": business_type,
        "key": GOOGLE_PLACES_API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        results = response.json().get("results", [])
        
        competitors = []
        for place in results[:10]:
            competitors.append({
                "name": place["name"],
                "rating": place.get("rating", 0),
                "reviews": place.get("user_ratings_total", 0),
                "price_level": place.get("price_level", 0),
                "address": place.get("vicinity", "")
            })
        return competitors
    except:
        return []  # Fallback to empty on error

def calculate_saturation(competitor_count):
    """More competitors = higher saturation score"""
    if competitor_count == 0:
        return 20  # Unproven market
    elif competitor_count <= 2:
        return 30  # Low saturation
    elif competitor_count <= 5:
        return 50  # Moderate
    elif competitor_count <= 8:
        return 70  # High
    else:
        return 90  # Oversaturated

@competitor_intel.on_message(model=CompetitorRequest)
async def analyze_competitors(ctx: Context, sender: str, msg: CompetitorRequest):
    ctx.logger.info(f"Analyzing competitors for {msg.business_type} at ({msg.lat}, {msg.lng})")
    
    competitors = get_nearby_competitors(msg.lat, msg.lng, msg.business_type, msg.radius)
    saturation = calculate_saturation(len(competitors))
    
    # Simple gap analysis
    if len(competitors) == 0:
        gap = "No direct competitors — unproven market. First-mover advantage but higher risk."
    elif len(competitors) <= 3:
        avg_rating = sum(c["rating"] for c in competitors) / len(competitors)
        if avg_rating < 4.0:
            gap = "Weak competition — opportunity to win on quality and service."
        else:
            gap = "Proven market with room for differentiation. Focus on unique offerings."
    else:
        gap = "Saturated market — need strong differentiation (niche flavors, experience, pricing)."
    
    response = CompetitorResponse(
        competitors=competitors,
        saturation_score=saturation,
        gap_analysis=gap,
        data_source="Google Places API (live)"
    )
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    competitor_intel.run()
