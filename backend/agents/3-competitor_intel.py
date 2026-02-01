# competitor_intel.py
from uagents import Agent, Context, Model
import requests
import os
import json
import hashlib

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

class Competitor(Model):
    name: str
    rating: float
    reviews: int
    price_level: int
    address: str

competitor_intel = Agent(
    name="competitor_intel",
    seed="compdawg",
    port=8002,
    endpoint=["http://localhost:8002/submit"],
    network="testnet",
)

GOOGLE_PLACES_API_KEY = "AIzaSyD8miMgNXY0knfl3zPD4RroatsVKJRGGQc"

def get_nearby_competitors(lat, lng, business_type, radius):
    """Fetch competitors from Google Places API with Caching"""
    
    # Create cache directory if it doesn't exist
    if not os.path.exists(".cache"):
        os.makedirs(".cache")
        
    # Generate a unique filename based on query params
    cache_key = f"{lat}_{lng}_{business_type}_{radius}"
    cache_hash = hashlib.md5(cache_key.encode()).hexdigest()
    cache_path = f".cache/{cache_hash}.json"
    
    # Check cache first
    if os.path.exists(cache_path):
        print(f"💰 Loading from cache: {cache_path}")
        with open(cache_path, "r") as f:
            return json.load(f)
            
    print("🌍 Fetching from Google Places API...")
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
    """More competitors = less score"""
    if competitor_count == 0:
        return 90  # No competitors
    elif competitor_count <= 2:
        return 70  # Low saturation
    elif competitor_count <= 5:
        return 50  # Moderate
    elif competitor_count <= 8:
        return 30  # High
    else:
        return 20 # Very high saturation

def calculate_confidence(competitors, radius):
    """Estimate confidence from data quality (not saturation)."""
    competitor_count = len(competitors)
    total_reviews = sum(c.get("reviews", 0) for c in competitors)
    rated_count = sum(1 for c in competitors if c.get("rating", 0) > 0)

    # Coverage: at least half of results have ratings
    rating_coverage = rated_count / competitor_count if competitor_count > 0 else 0

    # Simple scoring from 0-100
    score = 0
    if competitor_count >= 5:
        score += 40
    elif competitor_count >= 3:
        score += 25
    elif competitor_count >= 1:
        score += 10

    if total_reviews >= 1000:
        score += 40
    elif total_reviews >= 300:
        score += 25
    elif total_reviews >= 50:
        score += 10

    if rating_coverage >= 0.7:
        score += 20
    elif rating_coverage >= 0.4:
        score += 10

    # Slightly reduce confidence for very small radius (less market coverage)
    if radius < 800:
        score = max(score - 10, 0)

    if score >= 70:
        return "high", {
            "confidence_score": score,
            "competitor_count": competitor_count,
            "total_reviews": total_reviews,
            "rating_coverage": round(rating_coverage, 2),
            "radius_meters": radius,
        }
    if score >= 40:
        return "medium", {
            "confidence_score": score,
            "competitor_count": competitor_count,
            "total_reviews": total_reviews,
            "rating_coverage": round(rating_coverage, 2),
            "radius_meters": radius,
        }
    return "low", {
        "confidence_score": score,
        "competitor_count": competitor_count,
        "total_reviews": total_reviews,
        "rating_coverage": round(rating_coverage, 2),
        "radius_meters": radius,
    }

@competitor_intel.on_message(model=ScoreRequest)
async def analyze_competitors(ctx: Context, sender: str, msg: ScoreRequest):
    ctx.logger.info(f"Analyzing competitors for {msg.business_type} at ({msg.latitude}, {msg.longitude})")

    search_radius = 1000
    competitors = get_nearby_competitors(msg.latitude, msg.longitude, msg.business_type, search_radius)
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
    
    # Determine confidence from data quality, not saturation
    confidence, confidence_basis = calculate_confidence(competitors, search_radius)
    
    response = ScoreResponse(
        score=saturation,
        confidence=confidence,
        breakdown={
            "competitors": competitors,
            "saturation_score": 100-saturation,
            "gap_analysis": gap,
            "competitor_count": len(competitors),
            "confidence_basis": confidence_basis
        }
    )
    
    await ctx.send(sender, response)


if __name__ == "__main__":
    competitor_intel.run()
