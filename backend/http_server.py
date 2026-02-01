"""
Flask HTTP Bridge Server for Vantage Location Intelligence
Bridges REST API requests to uagents backend system

Supports both:
- Direct function calls (current implementation)
- Agentverse agent messaging (via environment variables)
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
import requests
import json
import sys
import os
from typing import Dict, List, Any, Optional
from geopy.geocoders import Nominatim
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Agentverse configuration - agent addresses can be overridden via environment
# For Agentverse deployment, set these to registered agent addresses
ORCHESTRATOR_ADDRESS = os.getenv(
    "ORCHESTRATOR_ADDRESS",
    "agent1q2wva7fjhjqfklv8sna6q3ftcaf32pt7fev5q9w0qwn5earml3a8qz24n4f"
)
LOCATION_SCOUT_ADDRESS = os.getenv(
    "LOCATION_SCOUT_ADDRESS",
    "agent1qtmh344czvgrgregw9xf7490s7a9qc9twvz3njq6ye6rn0gnpwjg53el5um"
)
COMPETITOR_INTEL_ADDRESS = os.getenv(
    "COMPETITOR_INTEL_ADDRESS",
    "agent1qwztegem8pxg4u3edsvwngrnx2pqu9ju8fd50kz9l4yvakqqysn2xjdamxu"
)
REVENUE_ANALYST_ADDRESS = os.getenv(
    "REVENUE_ANALYST_ADDRESS",
    "agent1qvjvmz2ej8vnjpxnw8fhkazfky2mfx5se4au508xapjrmdkhf9782cwpm5q"
)

# Agent endpoints for Agentverse (if using HTTP messaging instead of direct calls)
ORCHESTRATOR_ENDPOINT = os.getenv("ORCHESTRATOR_ENDPOINT")
LOCATION_SCOUT_ENDPOINT = os.getenv("LOCATION_SCOUT_ENDPOINT")
COMPETITOR_INTEL_ENDPOINT = os.getenv("COMPETITOR_INTEL_ENDPOINT")
REVENUE_ANALYST_ENDPOINT = os.getenv("REVENUE_ANALYST_ENDPOINT")

# Use Agentverse messaging if endpoints are configured
USE_AGENTVERSE_MESSAGING = all([
    ORCHESTRATOR_ENDPOINT,
    LOCATION_SCOUT_ENDPOINT,
    COMPETITOR_INTEL_ENDPOINT,
    REVENUE_ANALYST_ENDPOINT
])

if USE_AGENTVERSE_MESSAGING:
    print("🌐 Agentverse messaging mode enabled")
    print(f"   Orchestrator: {ORCHESTRATOR_ENDPOINT}")
    print(f"   Location Scout: {LOCATION_SCOUT_ENDPOINT}")
    print(f"   Competitor Intel: {COMPETITOR_INTEL_ENDPOINT}")
    print(f"   Revenue Analyst: {REVENUE_ANALYST_ENDPOINT}")
else:
    print("📦 Direct function call mode (default)")
    print("   Set agent endpoints in environment to enable Agentverse messaging")

# Add backend directory to path to import agent functions
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / 'agents'))

# Change working directory to agents folder so data files can be loaded
import os
_original_cwd = os.getcwd()
agents_dir = str(backend_dir / 'agents')
if os.path.exists(agents_dir):
    os.chdir(agents_dir)

# Import agent calculation functions directly using importlib
try:
    import importlib.util
    
    # Import location_scout functions
    scout_path = backend_dir / "agents" / "2-location_scout.py"
    spec = importlib.util.spec_from_file_location("location_scout", scout_path)
    location_scout_module = importlib.util.module_from_spec(spec)
    # Set up the module's __file__ and path for relative imports
    location_scout_module.__file__ = str(scout_path)
    location_scout_module.__package__ = "agents"
    # Change to agents directory so data files can be found
    import os
    old_cwd = os.getcwd()
    os.chdir(str(backend_dir / "agents"))
    try:
        spec.loader.exec_module(location_scout_module)
        calculate_location_score = location_scout_module.calculate_location_score
    finally:
        os.chdir(old_cwd)
    
    # Import competitor_intel functions
    intel_path = backend_dir / "agents" / "3-competitor_intel.py"
    spec = importlib.util.spec_from_file_location("competitor_intel", intel_path)
    competitor_intel_module = importlib.util.module_from_spec(spec)
    competitor_intel_module.__file__ = str(intel_path)
    competitor_intel_module.__package__ = "agents"
    old_cwd = os.getcwd()
    os.chdir(str(backend_dir / "agents"))
    try:
        spec.loader.exec_module(competitor_intel_module)
        get_nearby_competitors = competitor_intel_module.get_nearby_competitors
        calculate_saturation = competitor_intel_module.calculate_saturation
        calculate_confidence = competitor_intel_module.calculate_confidence
    finally:
        os.chdir(old_cwd)
    
    # Import revenue_analyst functions
    revenue_path = backend_dir / "agents" / "4-revenue_analyst.py"
    spec = importlib.util.spec_from_file_location("revenue_analyst", revenue_path)
    revenue_analyst_module = importlib.util.module_from_spec(spec)
    revenue_analyst_module.__file__ = str(revenue_path)
    revenue_analyst_module.__package__ = "agents"
    old_cwd = os.getcwd()
    os.chdir(str(backend_dir / "agents"))
    try:
        spec.loader.exec_module(revenue_analyst_module)
        calculate_revenue = revenue_analyst_module.calculate_revenue
    finally:
        os.chdir(old_cwd)
    
    print("✓ Successfully imported agent functions")
except Exception as e:
    print(f"Warning: Could not import agent functions: {e}")
    import traceback
    traceback.print_exc()
    calculate_location_score = None
    get_nearby_competitors = None
    calculate_saturation = None
    calculate_confidence = None
    calculate_revenue = None

# Import data service
try:
    from data_service import data_service
    print("✓ Successfully imported data_service")
except ImportError as e:
    print(f"Warning: Could not import data_service: {e}")
    data_service = None

app = Flask(__name__)

# Enable CORS for frontend access (including Vercel deployments)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:5174", 
            "http://localhost:5175",
            "https://*.vercel.app",
            "https://vantage-*.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Default NYC location (Manhattan)
DEFAULT_LAT = 40.7128
DEFAULT_LNG = -74.0060
DEFAULT_NEIGHBORHOOD = "Manhattan, NY"

# Pre-cached demo queries for instant results
DEMO_QUERIES = {
    # Key: (business_type, target_demo, budget_range)
    # Demo query 1: Boba tea shop for students
    ("boba tea shop", "students", 8500): {
        "locations": [
            {
                "id": 1,
                "name": "East Village",
                "score": 92,
                "x": 45.2,
                "y": 38.5,
                "status": "HIGH",
                "confidence": "HIGH",
                "metrics": [
                    {"label": "Foot Traffic", "score": 88, "confidence": "high"},
                    {"label": "Transit Access", "score": 95, "confidence": "high"},
                    {"label": "Elite Density", "score": 85, "confidence": "medium"},
                    {"label": "Net Disposable", "score": 78, "confidence": "medium"}
                ],
                "competitors": [
                    {"name": "Gong Cha", "rating": 4.2, "reviews": 450, "distance": "0.3 mi", "status": "Open", "weakness": "Limited seating"},
                    {"name": "Vivi Bubble Tea", "rating": 4.0, "reviews": 320, "distance": "0.5 mi", "status": "Open", "weakness": "Older storefront"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$28,500", "annual": "342k", "margin": "42%"},
                    {"scenario": "Moderate", "monthly": "$42,200", "annual": "506k", "margin": "58%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$58,800", "annual": "706k", "margin": "68%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for boba tea shop", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 8500,
                "address": "123 St. Marks Place, East Village, NY",
                "lat": 40.7282,
                "lng": -73.9857,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            },
            {
                "id": 2,
                "name": "Greenwich Village",
                "score": 89,
                "x": 44.8,
                "y": 39.2,
                "status": "HIGH",
                "confidence": "HIGH",
                "metrics": [
                    {"label": "Foot Traffic", "score": 85, "confidence": "high"},
                    {"label": "Transit Access", "score": 92, "confidence": "high"},
                    {"label": "Elite Density", "score": 88, "confidence": "high"},
                    {"label": "Net Disposable", "score": 82, "confidence": "medium"}
                ],
                "competitors": [
                    {"name": "Ten Ren Tea", "rating": 4.3, "reviews": 520, "distance": "0.4 mi", "status": "Open", "weakness": "Premium pricing"},
                    {"name": "Kung Fu Tea", "rating": 4.1, "reviews": 380, "distance": "0.6 mi", "status": "Open", "weakness": "Limited customization"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$26,800", "annual": "322k", "margin": "40%"},
                    {"scenario": "Moderate", "monthly": "$39,500", "annual": "474k", "margin": "56%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$55,200", "annual": "662k", "margin": "66%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for boba tea shop", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 8200,
                "address": "456 Bleecker St, Greenwich Village, NY",
                "lat": 40.7336,
                "lng": -74.0027,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            },
            {
                "id": 3,
                "name": "Lower East Side",
                "score": 86,
                "x": 46.1,
                "y": 37.8,
                "status": "HIGH",
                "confidence": "MEDIUM",
                "metrics": [
                    {"label": "Foot Traffic", "score": 82, "confidence": "medium"},
                    {"label": "Transit Access", "score": 88, "confidence": "high"},
                    {"label": "Elite Density", "score": 80, "confidence": "medium"},
                    {"label": "Net Disposable", "score": 75, "confidence": "medium"}
                ],
                "competitors": [
                    {"name": "CoCo Fresh Tea", "rating": 4.0, "reviews": 290, "distance": "0.5 mi", "status": "Open", "weakness": "Small storefront"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$24,200", "annual": "290k", "margin": "38%"},
                    {"scenario": "Moderate", "monthly": "$35,800", "annual": "430k", "margin": "54%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$49,500", "annual": "594k", "margin": "64%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for boba tea shop", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 7800,
                "address": "789 Orchard St, Lower East Side, NY",
                "lat": 40.7180,
                "lng": -73.9880,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            }
        ],
        "cached_at": "2025-02-01T00:00:00Z"
    },
    # Demo query 2: Coffee shop for professionals
    ("coffee shop", "professionals", 12000): {
        "locations": [
            {
                "id": 1,
                "name": "Financial District",
                "score": 94,
                "x": 43.5,
                "y": 35.2,
                "status": "HIGH",
                "confidence": "HIGH",
                "metrics": [
                    {"label": "Foot Traffic", "score": 96, "confidence": "high"},
                    {"label": "Transit Access", "score": 98, "confidence": "high"},
                    {"label": "Elite Density", "score": 92, "confidence": "high"},
                    {"label": "Net Disposable", "score": 95, "confidence": "high"}
                ],
                "competitors": [
                    {"name": "Starbucks Reserve", "rating": 4.4, "reviews": 1200, "distance": "0.2 mi", "status": "Open", "weakness": "Premium pricing"},
                    {"name": "Blue Bottle Coffee", "rating": 4.5, "reviews": 890, "distance": "0.3 mi", "status": "Open", "weakness": "Limited seating"},
                    {"name": "Joe Coffee", "rating": 4.2, "reviews": 650, "distance": "0.4 mi", "status": "Open", "weakness": "Small space"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$48,500", "annual": "582k", "margin": "45%"},
                    {"scenario": "Moderate", "monthly": "$72,800", "annual": "874k", "margin": "62%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$102,500", "annual": "1230k", "margin": "72%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for coffee shop", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 12000,
                "address": "100 Wall St, Financial District, NY",
                "lat": 40.7074,
                "lng": -74.0113,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            },
            {
                "id": 2,
                "name": "Midtown East",
                "score": 91,
                "x": 45.8,
                "y": 40.5,
                "status": "HIGH",
                "confidence": "HIGH",
                "metrics": [
                    {"label": "Foot Traffic", "score": 93, "confidence": "high"},
                    {"label": "Transit Access", "score": 95, "confidence": "high"},
                    {"label": "Elite Density", "score": 90, "confidence": "high"},
                    {"label": "Net Disposable", "score": 88, "confidence": "high"}
                ],
                "competitors": [
                    {"name": "Gregorys Coffee", "rating": 4.3, "reviews": 780, "distance": "0.3 mi", "status": "Open", "weakness": "Crowded during rush"},
                    {"name": "La Colombe", "rating": 4.4, "reviews": 920, "distance": "0.4 mi", "status": "Open", "weakness": "Higher prices"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$45,200", "annual": "542k", "margin": "43%"},
                    {"scenario": "Moderate", "monthly": "$68,500", "annual": "822k", "margin": "60%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$96,200", "annual": "1154k", "margin": "70%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for coffee shop", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 11500,
                "address": "456 Lexington Ave, Midtown East, NY",
                "lat": 40.7505,
                "lng": -73.9776,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            }
        ],
        "cached_at": "2025-02-01T00:00:00Z"
    },
    # Demo query 3: Bakery for families
    ("bakery", "families", 6000): {
        "locations": [
            {
                "id": 1,
                "name": "Upper West Side",
                "score": 90,
                "x": 44.2,
                "y": 42.8,
                "status": "HIGH",
                "confidence": "HIGH",
                "metrics": [
                    {"label": "Foot Traffic", "score": 85, "confidence": "high"},
                    {"label": "Transit Access", "score": 92, "confidence": "high"},
                    {"label": "Elite Density", "score": 88, "confidence": "high"},
                    {"label": "Net Disposable", "score": 86, "confidence": "high"}
                ],
                "competitors": [
                    {"name": "Levain Bakery", "rating": 4.6, "reviews": 2400, "distance": "0.5 mi", "status": "Open", "weakness": "Long lines"},
                    {"name": "Maison Kayser", "rating": 4.3, "reviews": 1100, "distance": "0.6 mi", "status": "Open", "weakness": "French-focused"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$22,800", "annual": "274k", "margin": "48%"},
                    {"scenario": "Moderate", "monthly": "$34,500", "annual": "414k", "margin": "65%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$48,200", "annual": "578k", "margin": "75%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for bakery", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 6000,
                "address": "789 Amsterdam Ave, Upper West Side, NY",
                "lat": 40.7870,
                "lng": -73.9754,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            },
            {
                "id": 2,
                "name": "Park Slope",
                "score": 87,
                "x": 46.5,
                "y": 41.2,
                "status": "HIGH",
                "confidence": "MEDIUM",
                "metrics": [
                    {"label": "Foot Traffic", "score": 82, "confidence": "medium"},
                    {"label": "Transit Access", "score": 88, "confidence": "high"},
                    {"label": "Elite Density", "score": 85, "confidence": "medium"},
                    {"label": "Net Disposable", "score": 83, "confidence": "medium"}
                ],
                "competitors": [
                    {"name": "Buttermilk Bakeshop", "rating": 4.4, "reviews": 680, "distance": "0.4 mi", "status": "Open", "weakness": "Limited hours"}
                ],
                "revenue": [
                    {"scenario": "Conservative", "monthly": "$20,500", "annual": "246k", "margin": "46%"},
                    {"scenario": "Moderate", "monthly": "$31,200", "annual": "374k", "margin": "63%", "isRecommended": True},
                    {"scenario": "Optimistic", "monthly": "$43,800", "annual": "526k", "margin": "73%"}
                ],
                "checklist": [
                    {"text": "Verify zoning permits for bakery", "completed": False},
                    {"text": "Contact landlord for lease terms", "completed": False},
                    {"text": "Check foot traffic data for peak hours", "completed": True},
                    {"text": "Review competitor pricing strategy", "completed": False},
                    {"text": "Schedule site visit with realtor", "completed": False}
                ],
                "rent_price": 5800,
                "address": "234 7th Ave, Park Slope, NY",
                "lat": 40.6681,
                "lng": -73.9800,
                "dataSource": "Industry-standard benchmarks",
                "merchantCount": 0,
                "assumptions": []
            }
        ],
        "cached_at": "2025-02-01T00:00:00Z"
    }
}


def get_demo_cache_key(business_type: str, target_demo: str, budget: float) -> Optional[tuple]:
    """Check if query matches a demo query (with fuzzy matching)"""
    business_type_lower = business_type.lower()
    target_demo_lower = target_demo.lower()
    
    # Normalize business types
    business_mapping = {
        "boba": "boba tea shop",
        "boba tea": "boba tea shop",
        "tea shop": "boba tea shop",
        "coffee": "coffee shop",
        "cafe": "coffee shop",
        "coffee shop": "coffee shop",
        "bakery": "bakery",
        "baker": "bakery",
        "bake shop": "bakery"
    }
    
    # Normalize demographics
    demo_mapping = {
        "student": "students",
        "students": "students",
        "young professionals": "professionals",
        "professional": "professionals",
        "professionals": "professionals",
        "family": "families",
        "families": "families"
    }
    
    normalized_business = business_mapping.get(business_type_lower, business_type_lower)
    normalized_demo = demo_mapping.get(target_demo_lower, target_demo_lower)
    
    # Check budget ranges (within 20% tolerance)
    for (cached_business, cached_demo, cached_budget), cached_data in DEMO_QUERIES.items():
        if (normalized_business == cached_business and 
            normalized_demo == cached_demo and
            abs(budget - cached_budget) / cached_budget <= 0.2):  # 20% tolerance
            return (cached_business, cached_demo, cached_budget)
    
    return None


# Note: Agent addresses are now defined at the top of the file
# We're calling agent functions directly, but can switch to Agentverse messaging
# if endpoints are configured via environment variables

# Request state management (in-memory)
request_states: Dict[str, Dict[str, Any]] = {}


def geocode_location(location_pref: str) -> tuple:
    """Geocode location preference to lat/lng coordinates"""
    try:
        geolocator = Nominatim(user_agent="vantage-location-intelligence")
        location = geolocator.geocode(f"{location_pref}, New York, NY", timeout=10)
        if location:
            return location.latitude, location.longitude, location_pref
    except Exception as e:
        print(f"Geocoding failed: {e}")
    
    # Fallback to default Manhattan location
    return DEFAULT_LAT, DEFAULT_LNG, DEFAULT_NEIGHBORHOOD


def call_location_scout(business_type: str, target_demo: str, lat: float, lng: float, neighborhood: str) -> Optional[Dict]:
    """Call location_scout agent function directly"""
    if not calculate_location_score:
        return None
    try:
        result = calculate_location_score(neighborhood, business_type, target_demo, lat, lng)
        return {
            "score": result.get("score", 0),
            "confidence": result.get("confidence", "medium"),
            "breakdown": result.get("breakdown", {})
        }
    except Exception as e:
        print(f"Error calling location_scout: {e}")
        return None


def call_competitor_intel(business_type: str, lat: float, lng: float) -> Optional[Dict]:
    """Call competitor_intel agent function directly"""
    if not get_nearby_competitors or not calculate_saturation or not calculate_confidence:
        return None
    try:
        search_radius = 1000
        competitors = get_nearby_competitors(lat, lng, business_type, search_radius)
        saturation = calculate_saturation(len(competitors))
        confidence, confidence_basis = calculate_confidence(competitors, search_radius)
        
        # Gap analysis
        if len(competitors) == 0:
            gap = "No direct competitors — unproven market. First-mover advantage but higher risk."
        elif len(competitors) <= 3:
            avg_rating = sum(c.get("rating", 0) for c in competitors) / len(competitors) if competitors else 0
            if avg_rating < 4.0:
                gap = "Weak competition — opportunity to win on quality and service."
            else:
                gap = "Proven market with room for differentiation. Focus on unique offerings."
        else:
            gap = "Saturated market — need strong differentiation (niche flavors, experience, pricing)."
        
        return {
            "score": saturation,
            "confidence": confidence,
            "breakdown": {
                "competitors": competitors,
                "saturation_score": saturation,
                "gap_analysis": gap,
                "competitor_count": len(competitors),
                "confidence_basis": confidence_basis
            }
        }
    except Exception as e:
        print(f"Error calling competitor_intel: {e}")
        return None


def process_single_location(
    loc_id: int,
    place: Dict,
    business_type: str,
    target_demo: str,
    budget: float,
    neighborhood: str,
    lat: float,
    lng: float,
    data_service: Any = None
) -> Dict:
    """
    Process a single location - can be called in parallel.
    Extracted from the sequential loop for parallel processing.
    """
    loc_lat = place.get("lat", lat)
    loc_lng = place.get("lng", lng)
    place_address = place.get("address", f"{neighborhood} - Location {loc_id}")
    place_rent = place.get("price", budget)
    
    # Call agent functions directly
    location_scout_data = call_location_scout(
        business_type,
        target_demo,
        loc_lat,
        loc_lng,
        neighborhood
    )
    
    competitor_data = call_competitor_intel(
        business_type,
        loc_lat,
        loc_lng
    )
    
    if not location_scout_data or not competitor_data:
        # Use mock data if agents don't respond
        location_scout_data = {
            "score": 75 + loc_id * 5,
            "confidence": "medium",
            "breakdown": {
                "foot_traffic": {"score": 70, "nearby_locations": [], "average_pedestrians": 1000, "count": 0},
                "transit_access": {"score": 80, "nearby_stations": [], "count": 0}
            }
        }
        competitor_data = {
            "score": 60,
            "confidence": "medium",
            "breakdown": {
                "competitors": [],
                "saturation_score": 60,
                "gap_analysis": "Moderate competition",
                "competitor_count": 3
            }
        }
    
    # Extract data for revenue analyst
    foot_traffic_score = location_scout_data.get("breakdown", {}).get("foot_traffic", {}).get("score", 0)
    competition_count = competitor_data.get("breakdown", {}).get("competitor_count", 0)
    
    # Call revenue analyst with location data for Visa API
    revenue_data = call_revenue_analyst(
        business_type,
        foot_traffic_score,
        competition_count,
        place_rent,  # Use actual rent from listing
        latitude=loc_lat,  # Pass location for Visa API
        longitude=loc_lng  # Pass location for Visa API
    )
    
    if not revenue_data:
        # Mock revenue data
        revenue_data = {
            "conservative": int(place_rent * 3),
            "moderate": int(place_rent * 5),
            "optimistic": int(place_rent * 7),
            "breakeven_months": 6,
            "confidence": "medium",
            "assumptions": [f"Estimated rent: ${int(place_rent)}/mo"]
        }
    
    # Calculate "magic number" - composite score from orchestrator
    location_score = location_scout_data.get("score", 0)
    competition_score = competitor_data.get("breakdown", {}).get("saturation_score", 0)
    revenue_score = min(100, (revenue_data.get("moderate", 0) / place_rent) * 10) if place_rent > 0 else 0
    
    # Magic number: weighted composite score
    magic_number = int(
        location_score * 0.4 +      # 40% location quality
        competition_score * 0.3 +   # 30% competition (less is better, so inverted)
        revenue_score * 0.3          # 30% revenue potential
    )
    
    # Add magic number to location_scout_data
    location_scout_data["magic_number"] = magic_number
    location_scout_data["composite_breakdown"] = {
        "location_score": location_score,
        "competition_score": competition_score,
        "revenue_score": revenue_score,
        "weights": {"location": 0.4, "competition": 0.3, "revenue": 0.3}
    }
    
    # Transform to LocationResult
    location_result = transform_to_location_result(
        location_scout_data,
        competitor_data,
        revenue_data,
        loc_lat,
        loc_lng,
        place_address,
        business_type,
        loc_id
    )
    
    # Add additional data from data service
    if data_service:
        location_result["rent_price"] = place_rent
        location_result["address"] = place_address
        location_result["demographics"] = data_service.get_location_demographics(loc_lat, loc_lng)
        location_result["magic_number"] = magic_number
    
    return location_result


def call_revenue_analyst(
    business_type: str,
    foot_traffic_score: int,
    competition_count: int,
    rent_estimate: float,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None
) -> Optional[Dict]:
    """Call revenue_analyst agent function directly"""
    if not calculate_revenue:
        return None
    try:
        # Try to get Visa merchant data if location is available
        visa_merchant_data = None
        data_source = "benchmarks"
        
        if latitude is not None and longitude is not None:
            try:
                from agents.visa_api_service import get_nearby_merchants, get_merchant_spending_insights
                visa_merchant_data = get_nearby_merchants(
                    lat=latitude,
                    lng=longitude,
                    business_type=business_type,
                    radius=1000
                )
                if visa_merchant_data:
                    data_source = "visa_api"
                    print(f"✓ Using Visa API data: {visa_merchant_data.get('merchant_count', 0)} merchants found")
            except ImportError:
                print("⚠️  Visa API service not available")
            except Exception as e:
                print(f"⚠️  Visa API call failed: {e}. Using benchmarks.")
        
        # Call calculate_revenue with optional Visa data
        conservative, moderate, optimistic, breakeven = calculate_revenue(
            foot_traffic_score,
            competition_count,
            business_type,
            rent_estimate,
            visa_merchant_data=visa_merchant_data
        )
        
        # Determine confidence based on data source
        if visa_merchant_data:
            confidence = "high"
        elif foot_traffic_score > 0 and competition_count >= 0:
            confidence = "medium"
        else:
            confidence = "low"
        
        # Build assumptions list
        assumptions = [
            f"Foot traffic score: {foot_traffic_score}/100",
            f"Nearby competitors: {competition_count}",
            f"Estimated rent: ${int(rent_estimate)}/mo",
        ]
        
        if visa_merchant_data:
            merchant_count = visa_merchant_data.get("merchant_count", 0)
            assumptions.append(f"Visa API data: {merchant_count} nearby merchants with transaction data")
            assumptions.append("Revenue projections enhanced with real transaction volumes")
        else:
            assumptions.append("Industry-standard conversion rates applied")
            if latitude is None or longitude is None:
                assumptions.append("Location data not available for Visa API lookup")
        
        return {
            "conservative": conservative,
            "moderate": moderate,
            "optimistic": optimistic,
            "breakeven_months": min(breakeven, 36),
            "confidence": confidence,
            "assumptions": assumptions
        }
    except Exception as e:
        print(f"Error calling revenue_analyst: {e}")
        return None


def transform_to_location_result(
    location_scout_data: Dict,
    competitor_data: Dict,
    revenue_data: Dict,
    lat: float,
    lng: float,
    neighborhood: str,
    business_type: str,
    location_id: int
) -> Dict:
    """Transform agent responses to frontend LocationResult format"""
    
    # Extract scores
    location_score = location_scout_data.get("score", 0)
    competitor_score = competitor_data.get("score", 0)
    
    # Determine status from overall score
    if location_score >= 80:
        status = "HIGH"
    elif location_score >= 60:
        status = "MEDIUM"
    else:
        status = "LOW"
    
    # Transform metrics
    breakdown = location_scout_data.get("breakdown", {})
    foot_traffic = breakdown.get("foot_traffic", {})
    transit_access = breakdown.get("transit_access", {})
    
    metrics = [
        {
            "label": "Foot Traffic",
            "score": foot_traffic.get("score", 0),
            "confidence": location_scout_data.get("confidence", "MEDIUM").upper()
        },
        {
            "label": "Transit Access",
            "score": transit_access.get("score", 0),
            "confidence": location_scout_data.get("confidence", "MEDIUM").upper()
        },
        {
            "label": "Competition",
            "score": competitor_data.get("breakdown", {}).get("saturation_score", 0),
            "confidence": competitor_data.get("confidence", "MEDIUM").upper()
        }
    ]
    
    # Transform competitors
    competitors_list = competitor_data.get("breakdown", {}).get("competitors", [])
    competitors = []
    gap_analysis = competitor_data.get("breakdown", {}).get("gap_analysis", "No gap analysis available")
    
    for comp in competitors_list[:10]:  # Limit to 10 competitors
        competitors.append({
            "name": comp.get("name", "Unknown"),
            "rating": comp.get("rating", 0),
            "reviews": comp.get("reviews", 0),
            "distance": f"{comp.get('distance', 0):.1f} mi" if isinstance(comp.get('distance'), (int, float)) else "N/A",
            "status": "Open",
            "weakness": gap_analysis  # Use gap_analysis as weakness
        })
    
    # Transform revenue
    revenue_projections = []
    if revenue_data:
        conservative = revenue_data.get("conservative", 0)
        moderate = revenue_data.get("moderate", 0)
        optimistic = revenue_data.get("optimistic", 0)
        rent_estimate = revenue_data.get("assumptions", [{}])[0] if revenue_data.get("assumptions") else {}
        rent_str = str(rent_estimate).split("$")[-1].split("/")[0] if "$" in str(rent_estimate) else "8500"
        try:
            rent_val = float(rent_str.replace(",", ""))
        except:
            rent_val = 8500
        
        # Calculate margins (rough estimate: margin = (revenue - rent - costs) / revenue)
        def calc_margin(rev, rent):
            costs = rev * 0.4  # Assume 40% costs
            margin_pct = ((rev - rent - costs) / rev * 100) if rev > 0 else 0
            return max(0, min(100, int(margin_pct)))
        
        revenue_projections = [
            {
                "scenario": "Conservative",
                "monthly": f"${conservative:,}",
                "annual": f"${conservative * 12 // 1000}k",
                "margin": f"{calc_margin(conservative, rent_val)}%"
            },
            {
                "scenario": "Moderate",
                "monthly": f"${moderate:,}",
                "annual": f"${moderate * 12 // 1000}k",
                "margin": f"{calc_margin(moderate, rent_val)}%",
                "isRecommended": True
            },
            {
                "scenario": "Optimistic",
                "monthly": f"${optimistic:,}",
                "annual": f"${optimistic * 12 // 1000}k",
                "margin": f"{calc_margin(optimistic, rent_val)}%"
            }
        ]
    
    # Generate location name from neighborhood
    location_name = neighborhood.split(",")[0] if "," in neighborhood else neighborhood
    
    # Convert lat/lng to map percentages (rough approximation for NYC)
    # NYC bounds: lat 40.5-40.9, lng -74.3 to -73.7
    x = ((lng + 74.3) / 0.6) * 100  # Convert to 0-100%
    y = ((lat - 40.5) / 0.4) * 100  # Convert to 0-100%
    x = max(0, min(100, x))
    y = max(0, min(100, y))
    
    # Generate checklist
    checklist = [
        {"text": f"Verify zoning permits for {business_type}", "completed": False},
        {"text": "Contact landlord for lease terms", "completed": False},
        {"text": "Check foot traffic data for peak hours", "completed": True},
        {"text": "Review competitor pricing strategy", "completed": False},
        {"text": "Schedule site visit with realtor", "completed": False}
    ]
    
    # Extract Visa data from revenue_data if available
    visa_data_source = None
    visa_merchant_count = 0
    visa_confidence = revenue_data.get("confidence", "medium") if revenue_data else "medium"
    visa_assumptions = revenue_data.get("assumptions", []) if revenue_data else []
    
    # Check if Visa data was used by examining assumptions
    for assumption in visa_assumptions:
        if "Visa API" in assumption or "Visa Merchant" in assumption:
            visa_data_source = "Visa Merchant Data"
            # Extract merchant count from assumption like "Visa API data: 5 nearby merchants"
            if "nearby merchants" in assumption:
                try:
                    merchant_count_str = assumption.split("nearby merchants")[0].split(":")[-1].strip()
                    visa_merchant_count = int(merchant_count_str.split()[0])
                except:
                    pass
            break
    
    if not visa_data_source:
        visa_data_source = "Industry-standard benchmarks"
    
    return {
        "id": location_id,
        "name": location_name,
        "score": location_score,
        "x": round(x, 1),
        "y": round(y, 1),
        "status": status,
        "confidence": status,  # Overall confidence
        "metrics": metrics,
        "competitors": competitors,
        "revenue": revenue_projections,
        "checklist": checklist,
        # Visa integration data for frontend dashboard
        "dataSource": visa_data_source,
        "merchantCount": visa_merchant_count,
        "assumptions": visa_assumptions
    }


def generate_multiple_locations(base_lat: float, base_lng: float, count: int = 3) -> List[tuple]:
    """Generate multiple nearby locations for demo purposes"""
    locations = []
    # Generate locations with slight variations
    variations = [
        (0, 0),  # Original
        (0.01, 0.01),  # Slightly NE
        (-0.01, 0.01),  # Slightly NW
        (0.01, -0.01),  # Slightly SE
        (-0.01, -0.01)  # Slightly SW
    ]
    
    for i, (lat_offset, lng_offset) in enumerate(variations[:count]):
        locations.append((
            base_lat + lat_offset,
            base_lng + lng_offset,
            f"Location {i+1}"
        ))
    
    return locations


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "vantage-http-bridge"})


def generate_ai_insights(location_data: Dict) -> List[Dict]:
    """
    Generate AI insights using Google Gemini API
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        print("⚠️  GEMINI_API_KEY not configured, returning mock insights")
        return []
    
    try:
        import google.generativeai as genai
        
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Build context from location data
        location_name = location_data.get("name", "Location")
        score = location_data.get("score", 0)
        metrics = location_data.get("metrics", [])
        competitors = location_data.get("competitors", [])
        revenue = location_data.get("revenue", [])
        rent_price = location_data.get("rent_price", 0)
        address = location_data.get("address", "")
        business_type = location_data.get("business_type", "retail business")
        target_demo = location_data.get("target_demo", "customers")
        
        # Format metrics
        metrics_text = "\n".join([f"- {m.get('label', '')}: {m.get('score', 0)}/100" for m in metrics])
        
        # Format competitors
        competitors_text = "\n".join([f"- {c.get('name', '')}: {c.get('rating', 0)}★ ({c.get('distance', 'N/A')})" for c in competitors[:5]])
        
        # Format revenue
        revenue_text = "\n".join([f"- {r.get('scenario', '')}: {r.get('monthly', 'N/A')}/mo" for r in revenue])
        
        prompt = f"""You are a commercial real estate analyst for NYC. Analyze this location and generate 4-5 actionable insights.

Location: {location_name}
Address: {address}
Overall Score: {score}/100
Monthly Rent: ${rent_price:,}
Business Type: {business_type}
Target Demographic: {target_demo}

Metrics:
{metrics_text}

Nearby Competitors:
{competitors_text}

Revenue Projections:
{revenue_text}

Generate insights in JSON format with this exact structure:
{{
  "insights": [
    {{
      "type": "opportunity|risk|trend|tip",
      "title": "Short title (max 6 words)",
      "description": "Actionable insight (2-3 sentences)"
    }}
  ]
}}

Focus on:
- Specific opportunities based on metrics and competition
- Risks to consider (rent, competition, market trends)
- Demographic or market trends
- Actionable tips for success

Return ONLY valid JSON, no markdown or extra text."""
        
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up response (remove markdown code blocks if present)
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        # Parse JSON
        import json
        result = json.loads(response_text)
        insights = result.get("insights", [])
        
        # Validate and format insights
        formatted_insights = []
        for insight in insights[:5]:  # Limit to 5 insights
            if "type" in insight and "title" in insight and "description" in insight:
                formatted_insights.append({
                    "type": insight["type"],
                    "title": insight["title"],
                    "description": insight["description"]
                })
        
        return formatted_insights
        
    except ImportError:
        print("⚠️  google-generativeai not installed. Install with: pip install google-generativeai")
        return []
    except Exception as e:
        print(f"⚠️  Gemini API error: {e}")
        import traceback
        traceback.print_exc()
        return []


@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    """Generate AI insights for a location using Gemini API"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        insights = generate_ai_insights(data)
        
        if not insights:
            # Return mock insights as fallback
            return jsonify({
                "insights": [
                    {
                        "type": "tip",
                        "title": "AI Insights Unavailable",
                        "description": "Gemini API is not configured. Set GEMINI_API_KEY environment variable to enable AI insights."
                    }
                ]
            })
        
        return jsonify({"insights": insights})
        
    except Exception as e:
        print(f"Error generating insights: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/submit', methods=['GET'])
def submit_analysis():
    """Submit analysis request - GET with query parameters"""
    # Parse query parameters
    business_type = request.args.get('type', '').strip()
    target_demo = request.args.get('demo', '').strip()
    budget_str = request.args.get('budget', '').strip()
    
    if not business_type or not target_demo or not budget_str:
        return jsonify({
            "status": "error",
            "error": "Missing required parameters: type, demo, budget"
        }), 400
    
    try:
        budget = float(budget_str)
    except ValueError:
        return jsonify({
            "status": "error",
            "error": "Invalid budget parameter"
        }), 400
    
    # Check if this matches a demo query
    demo_key = get_demo_cache_key(business_type, target_demo, budget)
    if demo_key and demo_key in DEMO_QUERIES:
        print(f"✅ Using pre-cached demo query: {demo_key}")
        cached_data = DEMO_QUERIES[demo_key]
        
        # Return cached results instantly
        return jsonify({
            "status": "completed",
            "progress": 100,
            "agent_statuses": [
                {"agent_id": "scout", "agent_name": "Location Scout", "status": "done", "progress": 100},
                {"agent_id": "intel", "agent_name": "Competitor Intel", "status": "done", "progress": 100},
                {"agent_id": "analyst", "agent_name": "Revenue Analyst", "status": "done", "progress": 100}
            ],
            "locations": cached_data["locations"],
            "cached": True  # Flag to indicate this was cached
        })
    
    # Use default NYC location (Manhattan)
    lat, lng, neighborhood = DEFAULT_LAT, DEFAULT_LNG, DEFAULT_NEIGHBORHOOD
    
    # Initialize data service and fetch data
    if data_service:
        try:
            data_service.fetch_rent_listings()
            data_service.fetch_demographics()
        except Exception as e:
            print(f"Warning: Data service initialization failed: {e}")
    
    # Get rentable places from data service
    rentable_places = []
    if data_service:
        try:
            # Get rent listings near the location
            rentable_places = data_service.get_rent_prices_nearby(lat, lng, radius_miles=2.0)
            # Also get vacant spots
            vacant_spots = data_service.get_vacant_spots(lat, lng, radius_miles=1.0)
            # Combine and limit to top locations
            all_places = rentable_places[:5] + [v for v in vacant_spots[:3] if v not in rentable_places]
        except Exception as e:
            print(f"Error getting rentable places: {e}")
            all_places = []
    else:
        all_places = []
    
    # If no rentable places found, generate variations
    if not all_places:
        location_variations = generate_multiple_locations(lat, lng, 3)
        all_places = [{"lat": loc_lat, "lng": loc_lng, "address": f"Location {i+1}", "price": budget * 1.2} 
                      for i, (loc_lat, loc_lng, _) in enumerate(location_variations)]
    
    all_locations = []
    agent_statuses = []
    
    # Process each rentable place in parallel for 3-5x speedup
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Submit all location processing tasks
        futures = {
            executor.submit(
                process_single_location,
                loc_id,
                place,
                business_type,
                target_demo,
                budget,
                neighborhood,
                lat,
                lng,
                data_service
            ): loc_id
            for loc_id, place in enumerate(all_places[:5], 1)  # Limit to 5 locations
        }
        
        # Collect results as they complete
        for future in as_completed(futures):
            try:
                location_result = future.result()
                all_locations.append(location_result)
            except Exception as e:
                print(f"Error processing location: {e}")
                import traceback
                traceback.print_exc()
                # Add fallback mock location on error
                loc_id = futures[future]
                fallback_result = {
                    "id": loc_id,
                    "name": f"Location {loc_id}",
                    "score": 70,
                    "x": 50.0,
                    "y": 50.0,
                    "status": "MEDIUM",
                    "metrics": [],
                    "competitors": [],
                    "revenue": [],
                    "checklist": []
                }
                all_locations.append(fallback_result)
    
    # Create agent statuses
    agent_statuses = [
        {"agent_id": "scout", "agent_name": "Location Scout", "status": "done", "progress": 100},
        {"agent_id": "intel", "agent_name": "Competitor Intel", "status": "done", "progress": 100},
        {"agent_id": "analyst", "agent_name": "Revenue Analyst", "status": "done", "progress": 100}
    ]
    
    # Return AnalysisResponse format
    return jsonify({
        "status": "completed",
        "progress": 100,
        "agent_statuses": agent_statuses,
        "locations": all_locations
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8020))
    print(f"Starting Vantage HTTP Bridge Server on port {port}...")
    print("Make sure all uagents are running:")
    print("  - location_scout on port 8001")
    print("  - competitor_intel on port 8003")
    print("  - revenue_analyst on port 8003")
    app.run(host='0.0.0.0', port=port, debug=False)

