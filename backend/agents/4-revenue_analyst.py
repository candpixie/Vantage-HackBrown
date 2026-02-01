# revenue_analyst.py
from uagents import Agent, Context, Model
import os
from typing import Optional
import os

# Import Visa API service
try:
    from visa_api_service import get_nearby_merchants, get_merchant_spending_insights
    VISA_API_AVAILABLE = True
except ImportError:
    VISA_API_AVAILABLE = False
    print("⚠️  Visa API service not available. Using benchmark data only.")

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

# Agent configuration - supports Agentverse deployment
AGENT_ENDPOINT = os.getenv("REVENUE_ANALYST_ENDPOINT", "http://localhost:8003/submit")
AGENT_PORT = int(os.getenv("REVENUE_ANALYST_PORT", "8003"))
AGENT_NETWORK = os.getenv("FETCH_AI_NETWORK", "testnet")

revenue_analyst = Agent(
    name="revenue_analyst",
    seed="revdawg",
    port=AGENT_PORT,
    endpoint=[AGENT_ENDPOINT],
    network=AGENT_NETWORK
)

# Agentverse metadata (for registration)
AGENT_METADATA = {
    "name": "vantage-revenue-analyst",
    "description": "Projects revenue scenarios (conservative, moderate, optimistic) with Visa API integration for location intelligence",
    "version": "1.0.0",
    "capabilities": ["revenue_projection", "financial_analysis", "visa_integration", "break_even"],
    "tags": ["location-intelligence", "financial-analysis", "revenue-projection", "visa"],
    "author": "Vantage Team"
}

# Industry benchmarks (monthly)
BENCHMARKS = {
    "bubble tea": {"conversion_rate": 0.03, "avg_ticket": 7.50, "margin": 0.65},
    "coffee shop": {"conversion_rate": 0.04, "avg_ticket": 6.00, "margin": 0.60},
    "bakery": {"conversion_rate": 0.025, "avg_ticket": 12.00, "margin": 0.55},
    "restaurant": {"conversion_rate": 0.02, "avg_ticket": 25.00, "margin": 0.45},
    "pizza": {"conversion_rate": 0.03, "avg_ticket": 20.00, "margin": 0.70},
    "bar": {"conversion_rate": 0.045, "avg_ticket": 20.00, "margin": 0.75},
    "gym": {"conversion_rate": 0.015, "avg_ticket": 60.00, "margin": 0.80},
    "clothing_store": {"conversion_rate": 0.02, "avg_ticket": 55.00, "margin": 0.55},
    "bookstore": {"conversion_rate": 0.02, "avg_ticket": 25.00, "margin": 0.45},
    "default": {"conversion_rate": 0.025, "avg_ticket": 10.00, "margin": 0.50}
}

def estimate_daily_traffic(foot_traffic_score):
    """Convert score to estimated daily passersby"""
    # Score 100 = ~5000 daily passersby (Times Square level)
    # Score 50 = ~1500 daily passersby (average neighborhood)
    # Score 20 = ~500 daily passersby (quiet residential)
    return int((foot_traffic_score / 100) * 4500 + 500)

def calculate_revenue(
    foot_traffic_score: int,
    competition_count: int,
    business_type: str,
    rent: float,
    visa_merchant_data: Optional[dict] = None
):
    """
    Calculate conservative/moderate/optimistic monthly revenue
    
    Args:
        foot_traffic_score: Foot traffic score (0-100)
        competition_count: Number of nearby competitors
        business_type: Type of business
        rent: Monthly rent estimate
        visa_merchant_data: Optional merchant data from Visa API
    """
    
    benchmarks = BENCHMARKS.get(business_type.lower(), BENCHMARKS["default"])
    daily_traffic = estimate_daily_traffic(foot_traffic_score)
    
    # Adjust conversion rate based on competition
    base_conversion = benchmarks["conversion_rate"]
    if competition_count == 0:
        conversion = base_conversion * 1.2  # No competition boost
    elif competition_count <= 3:
        conversion = base_conversion  # Normal
    elif competition_count <= 6:
        conversion = base_conversion * 0.8  # Some cannibalization
    else:
        conversion = base_conversion * 0.6  # Heavy competition
    
    avg_ticket = benchmarks["avg_ticket"]
    margin = benchmarks["margin"]
    
    # Enhance with Visa API data if available
    if visa_merchant_data:
        spending_insights = get_merchant_spending_insights(visa_merchant_data)
        market_activity = spending_insights.get("market_activity_score", 50)
        
        # Adjust conversion rate based on market activity from Visa data
        # Higher market activity = higher conversion potential
        activity_multiplier = 1.0 + (market_activity / 100) * 0.3  # Up to 30% boost
        conversion = conversion * activity_multiplier
        
        # If we have transaction volume data, use it to refine estimates
        estimated_spending = spending_insights.get("estimated_monthly_spending", 0)
        if estimated_spending > 0:
            # Use Visa transaction data as a baseline, adjusted for our business
            base_monthly = estimated_spending * (conversion / base_conversion)
        else:
            # Fall back to traffic-based calculation
            daily_customers = daily_traffic * conversion
            base_monthly = daily_customers * avg_ticket * 30
    else:
        # Standard calculation without Visa data
        daily_customers = daily_traffic * conversion
        base_monthly = daily_customers * avg_ticket * 30
    
    # Three scenarios
    conservative = int(base_monthly * 0.6)
    moderate = int(base_monthly)
    optimistic = int(base_monthly * 1.5)
    
    # Breakeven (months to recover ~$50K startup + 6 months rent)
    startup_cost = 50000 + (rent * 6)
    monthly_profit = moderate * margin - rent
    if monthly_profit > 0:
        breakeven = int(startup_cost / monthly_profit)
    else:
        breakeven = 99  # Not viable
    
    return conservative, moderate, optimistic, breakeven

@revenue_analyst.on_message(model=RevenueRequest)
async def project_revenue(ctx: Context, sender: str, msg: RevenueRequest):
    ctx.logger.info(f"Projecting revenue for {msg.business_type} in {msg.neighborhood}")
    
    # Try to get Visa merchant data if location is available
    visa_merchant_data = None
    data_source = "benchmarks"
    
    if VISA_API_AVAILABLE and msg.latitude is not None and msg.longitude is not None:
        ctx.logger.info(f"Calling Visa API for merchant data at ({msg.latitude}, {msg.longitude})")
        try:
            visa_merchant_data = get_nearby_merchants(
                lat=msg.latitude,
                lng=msg.longitude,
                business_type=msg.business_type,
                radius=1000  # 1km radius
            )
            if visa_merchant_data:
                ctx.logger.info(f"Received Visa merchant data: {visa_merchant_data.get('merchant_count', 0)} merchants found")
                data_source = "visa_api"
            else:
                ctx.logger.info("Visa API returned no data, using benchmarks")
        except Exception as e:
            ctx.logger.warning(f"Visa API call failed: {e}. Falling back to benchmarks.")
    
    # Calculate revenue with or without Visa data
    conservative, moderate, optimistic, breakeven = calculate_revenue(
        msg.foot_traffic_score,
        msg.competition_count,
        msg.business_type,
        msg.rent_estimate,
        visa_merchant_data=visa_merchant_data
    )
    
    # Confidence based on data quality
    if visa_merchant_data:
        confidence = "high"  # Visa API data provides higher confidence
    elif msg.foot_traffic_score > 0 and msg.competition_count >= 0:
        confidence = "medium"
    else:
        confidence = "low"
    
    # Build assumptions list
    assumptions = [
        f"Foot traffic score: {msg.foot_traffic_score}/100",
        f"Nearby competitors: {msg.competition_count}",
        f"Estimated rent: ${int(msg.rent_estimate)}/mo",
    ]
    
    if visa_merchant_data:
        merchant_count = visa_merchant_data.get("merchant_count", 0)
        assumptions.append(f"Visa API data: {merchant_count} nearby merchants with transaction data")
        assumptions.append("Revenue projections enhanced with real transaction volumes")
    else:
        assumptions.append("Industry-standard conversion rates applied")
        if msg.latitude is None or msg.longitude is None:
            assumptions.append("Location data not available for Visa API lookup")
    
    response = RevenueResponse(
        conservative=conservative,
        moderate=moderate,
        optimistic=optimistic,
        breakeven_months=min(breakeven, 36),
        confidence=confidence,
        assumptions=assumptions
    )
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    revenue_analyst.run()
