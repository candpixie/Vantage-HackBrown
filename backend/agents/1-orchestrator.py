from uagents import Agent, Context, Model
import asyncio
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

class ScoreResponse(Model):
    score: int
    confidence: str 
    breakdown: dict = {}

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str
    latitude: float
    longitude: float
    rent_estimate: float # monthly

class RevenueRequest(Model):
    business_type: str
    neighborhood: str
    foot_traffic_score: int  # 0-100
    competition_count: int
    rent_estimate: float  # monthly
    latitude: Optional[float] = None  # Added for Visa API integration
    longitude: Optional[float] = None  # Added for Visa API integration

class RevenueResponse(Model):
    conservative: int
    moderate: int
    optimistic: int
    breakeven_months: int
    confidence: str
    assumptions: list

class output(Model):
    business_type: str = None
    neighborhood: str = None
    rent_estimate: float = None # monthly
    loc_result: ScoreResponse = None
    comp_result: ScoreResponse = None
    rev_result: RevenueResponse = None

orchestrator = Agent(
    name="orchestrator",
    seed="orchdawg",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
    network="testnet",
)

location_scout_address = "agent1qtmh344czvgrgregw9xf7490s7a9qc9twvz3njq6ye6rn0gnpwjg53el5um"
competitor_intel_address = "agent1qwztegem8pxg4u3edsvwngrnx2pqu9ju8fd50kz9l4yvakqqysn2xjdamxu"
revenue_analyst_address = "agent1qvjvmz2ej8vnjpxnw8fhkazfky2mfx5se4au508xapjrmdkhf9782cwpm5q"

# Database file path for storing results
DATABASE_FILE = Path(__file__).parent / 'output' / 'orchestrator_results.json'

# Request-specific state storage - keyed by a unique identifier (lat,lon)
# This allows handling multiple concurrent requests
request_states = {}

def load_database():
    """Load existing results from the JSON database file"""
    if DATABASE_FILE.exists():
        try:
            with open(DATABASE_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"results": [], "metadata": {"created_at": datetime.now().isoformat(), "total_entries": 0}}
    return {"results": [], "metadata": {"created_at": datetime.now().isoformat(), "total_entries": 0}}

def save_to_database(request_state: dict):
    """Save the complete analysis result to the JSON database"""
    # Load existing database
    db = load_database()
    
    loc_result = request_state.get('loc_result')
    comp_result = request_state.get('comp_result')
    rev_result = request_state.get('rev_result')
    
    # Create a new entry with all the data
    entry = {
        "id": len(db["results"]) + 1,
        "timestamp": datetime.now().isoformat(),
        "request": {
            "neighborhood": request_state.get('neighborhood'),
            "business_type": request_state.get('business_type'),
            "target_demo": request_state.get('target_demo'),
            "latitude": request_state.get('latitude'),
            "longitude": request_state.get('longitude'),
            "rent_estimate": request_state.get('rent_estimate')
        },
        "location_analysis": {
            "score": loc_result.score if loc_result else None,
            "confidence": loc_result.confidence if loc_result else None,
            "breakdown": loc_result.breakdown if loc_result else {}
        },
        "competitor_analysis": {
            "score": comp_result.score if comp_result else None,
            "confidence": comp_result.confidence if comp_result else None,
            "breakdown": comp_result.breakdown if comp_result else {}
        },
        "revenue_projection": {
            "conservative": rev_result.conservative if rev_result else None,
            "moderate": rev_result.moderate if rev_result else None,
            "optimistic": rev_result.optimistic if rev_result else None,
            "breakeven_months": rev_result.breakeven_months if rev_result else None,
            "confidence": rev_result.confidence if rev_result else None,
            "assumptions": rev_result.assumptions if rev_result else []
        },
        "overall_score": calculate_overall_score(loc_result, comp_result, rev_result)
    }
    
    # Append to results
    db["results"].append(entry)
    db["metadata"]["total_entries"] = len(db["results"])
    db["metadata"]["last_updated"] = datetime.now().isoformat()
    
    # Ensure the data directory exists
    DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Save to file
    with open(DATABASE_FILE, 'w') as f:
        json.dump(db, f, indent=2)
    
    return entry

def calculate_overall_score(loc_result, comp_result, rev_result):
    """Calculate a weighted overall score from all analyses"""
    if not loc_result or not comp_result:
        return None
    
    # Weight: 40% location, 30% competition, 30% revenue potential
    loc_score = loc_result.score if loc_result else 0
    comp_score = comp_result.score if comp_result else 0
    
    # For revenue, calculate a score based on moderate projection vs rent
    rev_score = 50  # default
    if rev_result and rev_result.moderate and rev_result.breakeven_months:
        # Better score if breakeven is faster and revenue is higher
        if rev_result.breakeven_months <= 6:
            rev_score = 90
        elif rev_result.breakeven_months <= 12:
            rev_score = 70
        elif rev_result.breakeven_months <= 18:
            rev_score = 50
        else:
            rev_score = 30
    
    overall = int(loc_score * 0.4 + comp_score * 0.3 + rev_score * 0.3)
    return overall

@orchestrator.on_event("startup")
async def startup_function(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {orchestrator.name} and my address is {orchestrator.address}.")


@orchestrator.on_message(model=ScoreRequest)
async def handle_score_request(ctx: Context, sender: str, msg: ScoreRequest):
    """
    Two-Step Waterfall Pattern:
    Step 1: Store master state, send requests to agents 2 & 3 in parallel
    Step 2: Wait for both responses, then combine with master state and send to agent 4
    
    loc scout returns:
    {
        "score": int,
        "confidence": str,
        "breakdown": {
            "foot_traffic": {
                "score": int,
                "nearby_locations": list,
                "average_pedestrians": int,
                "count": int
            },
            "transit_access": {
                "score": int,
                "nearby_stations": list,
                "count": int
            }
        }
    }

    competitor_intel returns:
    {
        "score": int,
        "confidence": str,
        "breakdown": {
            "competitors": list,
            "saturation_score": int,
            "gap_analysis": str,
            "competitor_count": int,
            "confidence_basis": {
                "competitor_count": int,
                "total_reviews": int,
                "rating_coverage": float,
                "radius_meters": int
            }
        }
    }

    revenue_analyst returns:
    {
        "conservative": int,
        "moderate": int,
        "optimistic": int,
        "breakeven_months": int,
        "confidence": str,
        "assumptions": list
    }   
    """

    ctx.logger.info(f'I have received a ScoreRequest from {sender}.')
    ctx.logger.info(f"Neighborhood: {msg.neighborhood}")
    ctx.logger.info(f"Business Type: {msg.business_type}")
    ctx.logger.info(f"Target Demographic: {msg.target_demo}")
    ctx.logger.info(f"Latitude: {msg.latitude}")
    ctx.logger.info(f"Longitude: {msg.longitude}")
    ctx.logger.info(f"Rent Estimate: {msg.rent_estimate}")

    # Create unique key for this request using coordinates
    request_key = f"{msg.latitude},{msg.longitude}"
    
    # Initialize request-specific state
    request_states[request_key] = {
        'business_type': msg.business_type,
        'neighborhood': msg.neighborhood,
        'rent_estimate': msg.rent_estimate,
        'target_demo': msg.target_demo,
        'latitude': msg.latitude,
        'longitude': msg.longitude,
        'loc_result': None,
        'comp_result': None,
        'rev_result': None
    }
    
    ctx.logger.info(f"Created request state with key: {request_key}")

    # Send requests to agents 2 & 3 in parallel (Step 1)
    score_request = ScoreRequest(
        neighborhood=msg.neighborhood,
        business_type=msg.business_type,
        target_demo=msg.target_demo,
        latitude=msg.latitude,
        longitude=msg.longitude,
        rent_estimate=msg.rent_estimate
    )
    
    ctx.logger.info(f"Sending message to location_scout at {location_scout_address}")
    await ctx.send(location_scout_address, score_request)

    ctx.logger.info(f"Sending message to competitor_intel at {competitor_intel_address}")
    await ctx.send(competitor_intel_address, score_request)
    
    ctx.logger.info("Waiting for responses from agents 2 and 3 before calling agent 4...")

@orchestrator.on_message(model=ScoreResponse)
async def handle_score_response(ctx: Context, sender: str, msg: ScoreResponse):
    ctx.logger.info(f'I have received a ScoreResponse from {sender}.')
    ctx.logger.info(f"Received score: {msg.score}")
    ctx.logger.info(f"Confidence: {msg.confidence}")
    ctx.logger.info(f"Breakdown keys: {list(msg.breakdown.keys()) if msg.breakdown else 'None'}")
    
    # Determine which agent sent the response based on breakdown content
    # Location scout has: foot_traffic, transit_access
    # Competitor intel has: competitors, saturation_score, competitor_count
    breakdown = msg.breakdown or {}
    
    is_location_response = 'foot_traffic' in breakdown or 'transit_access' in breakdown
    is_competitor_response = 'competitors' in breakdown or 'saturation_score' in breakdown or 'competitor_count' in breakdown
    
    response_type = None
    if is_location_response:
        response_type = 'loc'
        ctx.logger.info("Identified as LOCATION_SCOUT response (has foot_traffic/transit_access)")
    elif is_competitor_response:
        response_type = 'comp'
        ctx.logger.info("Identified as COMPETITOR_INTEL response (has competitors/saturation_score)")
    else:
        ctx.logger.warning(f"Could not identify response type from breakdown: {breakdown}")
        return
    
    # Find a request that's missing this response type
    matched_key = None
    for key, state in request_states.items():
        if response_type == 'loc' and state['loc_result'] is None:
            matched_key = key
            break
        elif response_type == 'comp' and state['comp_result'] is None:
            matched_key = key
            break
    
    if not matched_key:
        ctx.logger.warning(f"No pending request found for {response_type} response")
        return
    
    # Store the response in the correct state
    if response_type == 'loc':
        request_states[matched_key]['loc_result'] = msg
        ctx.logger.info(f"Stored location result for request {matched_key}")
    else:
        request_states[matched_key]['comp_result'] = msg
        ctx.logger.info(f"Stored competitor result for request {matched_key}")
    
    # STEP 2: Check if we have both responses, then call agent 4
    state = request_states[matched_key]
    if state['loc_result'] and state['comp_result']:
        ctx.logger.info(f"Both agents 2 and 3 have responded for request {matched_key}. Now calling agent 4...")
        
        # Extract data from responses
        foot_traffic_score = 0
        competition_count = 0
        
        # Get foot_traffic score from location_scout breakdown
        if state['loc_result'].breakdown and 'foot_traffic' in state['loc_result'].breakdown:
            foot_traffic_data = state['loc_result'].breakdown['foot_traffic']
            # Use the score from foot_traffic, or fallback to overall score
            foot_traffic_score = foot_traffic_data.get('score', state['loc_result'].score)
        
        # Get competition_count from competitor_intel breakdown
        if state['comp_result'].breakdown and 'competitor_count' in state['comp_result'].breakdown:
            competition_count = state['comp_result'].breakdown['competitor_count']
        
        # Combine state with agent 2 & 3 results and send to agent 4
        revenue_request = RevenueRequest(
            business_type=state['business_type'],
            neighborhood=state['neighborhood'],
            foot_traffic_score=foot_traffic_score,
            competition_count=competition_count,
            rent_estimate=state['rent_estimate'],
            latitude=state['latitude'],
            longitude=state['longitude']
        )
        
        ctx.logger.info(f"Sending RevenueRequest to revenue_analyst at {revenue_analyst_address}")
        ctx.logger.info(f"  - Business Type: {revenue_request.business_type}")
        ctx.logger.info(f"  - Neighborhood: {revenue_request.neighborhood}")
        ctx.logger.info(f"  - Foot Traffic Score: {revenue_request.foot_traffic_score}")
        ctx.logger.info(f"  - Competition Count: {revenue_request.competition_count}")
        ctx.logger.info(f"  - Rent Estimate: {revenue_request.rent_estimate}")
        ctx.logger.info(f"  - Location: ({revenue_request.latitude}, {revenue_request.longitude})")
        
        await ctx.send(revenue_analyst_address, revenue_request)
    else:
        ctx.logger.info(f"Waiting for other response for {matched_key}... (loc: {state['loc_result'] is not None}, comp: {state['comp_result'] is not None})")

@orchestrator.on_message(model=RevenueResponse)
async def handle_revenue_response(ctx: Context, sender: str, msg: RevenueResponse):
    ctx.logger.info(f'I have received a RevenueResponse from {sender}.')
    ctx.logger.info(f"Received conservative: {msg.conservative}")
    ctx.logger.info(f"Received moderate: {msg.moderate}")
    ctx.logger.info(f"Received optimistic: {msg.optimistic}")
    ctx.logger.info(f"Received breakeven_months: {msg.breakeven_months}")
    ctx.logger.info(f"Received confidence: {msg.confidence}")
    ctx.logger.info(f"Received assumptions: {msg.assumptions}")
    
    # Find a request that's missing the revenue result
    matched_key = None
    for key, state in request_states.items():
        if state['rev_result'] is None and state['loc_result'] and state['comp_result']:
            matched_key = key
            break
    
    if not matched_key:
        ctx.logger.warning("No pending request found for revenue response")
        return
    
    # Store the revenue result
    request_states[matched_key]['rev_result'] = msg
    
    ctx.logger.info(f"=== ALL RESPONSES RECEIVED FOR {matched_key} ===")
    state = request_states[matched_key]
    ctx.logger.info(f"Business: {state['business_type']}, Neighborhood: {state['neighborhood']}")
    
    # Save results to JSON database
    try:
        entry = save_to_database(state)
        ctx.logger.info(f"=== SAVED TO DATABASE ===")
        ctx.logger.info(f"Entry ID: {entry['id']}")
        ctx.logger.info(f"Overall Score: {entry['overall_score']}")
        ctx.logger.info(f"Database file: {DATABASE_FILE}")
        
        # Clean up the request state after saving
        del request_states[matched_key]
        ctx.logger.info(f"Cleaned up request state for {matched_key}")
    except Exception as e:
        ctx.logger.error(f"Failed to save to database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    orchestrator.run()
