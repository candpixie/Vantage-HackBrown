from uagents import Agent, Context, Model
import asyncio
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

# Master state storage - holds initial inputs for the current request
master_state = {}

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

    # STEP 1: Store master state (initial inputs that all agents need)
    master_state['business_type'] = msg.business_type
    master_state['neighborhood'] = msg.neighborhood
    master_state['rent_estimate'] = msg.rent_estimate
    master_state['target_demo'] = msg.target_demo
    master_state['latitude'] = msg.latitude
    master_state['longitude'] = msg.longitude
    
    # Reset output state for new request
    out.loc_result = None
    out.comp_result = None
    out.rev_result = None

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
    ctx.logger.info(f"Breakdown: {msg.breakdown}")
    
    # Determine which agent sent the response based on sender address
    if not out.loc_result:
        out.loc_result = msg
        ctx.logger.info("Stored location_scout result")
    elif not out.comp_result:
        out.comp_result = msg
        ctx.logger.info("Stored competitor_intel result")
    
    # STEP 2: Check if we have both responses, then call agent 4
    if out.loc_result and out.comp_result:
        ctx.logger.info("Both agents 2 and 3 have responded. Now calling agent 4...")
        
        # Extract data from responses
        foot_traffic_score = 0
        competition_count = 0
        
        # Get foot_traffic score from location_scout breakdown
        if out.loc_result.breakdown and 'foot_traffic' in out.loc_result.breakdown:
            foot_traffic_data = out.loc_result.breakdown['foot_traffic']
            # Use the score from foot_traffic, or fallback to overall score
            foot_traffic_score = foot_traffic_data.get('score', out.loc_result.score)
        
        # Get competition_count from competitor_intel breakdown
        if out.comp_result.breakdown and 'competitor_count' in out.comp_result.breakdown:
            competition_count = out.comp_result.breakdown['competitor_count']
        
        # Combine master state with agent 2 & 3 results and send to agent 4
        revenue_request = RevenueRequest(
            business_type=master_state['business_type'],
            neighborhood=master_state['neighborhood'],
            foot_traffic_score=foot_traffic_score,
            competition_count=competition_count,
            rent_estimate=master_state['rent_estimate'],
            latitude=master_state.get('latitude'),  # Pass location for Visa API
            longitude=master_state.get('longitude')  # Pass location for Visa API
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
        ctx.logger.info(f"Waiting for other response... (loc_result: {out.loc_result is not None}, comp_result: {out.comp_result is not None})")

@orchestrator.on_message(model=RevenueResponse)
async def handle_revenue_response(ctx: Context, sender: str, msg: RevenueResponse):
    ctx.logger.info(f'I have received a RevenueResponse from {sender}.')
    ctx.logger.info(f"Received conservative: {msg.conservative}")
    ctx.logger.info(f"Received moderate: {msg.moderate}")
    ctx.logger.info(f"Received optimistic: {msg.optimistic}")
    ctx.logger.info(f"Received breakeven_months: {msg.breakeven_months}")
    ctx.logger.info(f"Received confidence: {msg.confidence}")
    ctx.logger.info(f"Received assumptions: {msg.assumptions}")
    
    out.rev_result = msg
    
    ctx.logger.info("=== ALL RESPONSES RECEIVED ===")
    ctx.logger.info(f"Final Output: {out}")
    print(out.dict())

if __name__ == "__main__":
    out = output()
    orchestrator.run()
