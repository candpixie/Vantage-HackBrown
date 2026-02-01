# revenue_analyst.py
from uagents import Agent, Context, Model

class RevenueRequest(Model):
    business_type: str
    neighborhood: str
    foot_traffic_score: int  # 0-100
    competition_count: int
    avg_transaction: float  # estimated per customer
    rent_estimate: float  # monthly

class RevenueResponse(Model):
    conservative: int
    moderate: int
    optimistic: int
    breakeven_months: int
    confidence: str
    assumptions: list

revenue_analyst = Agent(
    name="revenue_analyst",
    seed="revdawg",
    port=8003,
    endpoint=["http://localhost:8003/submit"],
    network="testnet"
)

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

def calculate_revenue(foot_traffic_score, competition_count, business_type, rent):
    """Calculate conservative/moderate/optimistic monthly revenue"""
    
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
    
    # Daily customers
    daily_customers = daily_traffic * conversion
    
    # Monthly revenue (30 days)
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
    
    conservative, moderate, optimistic, breakeven = calculate_revenue(
        msg.foot_traffic_score,
        msg.competition_count,
        msg.business_type,
        msg.rent_estimate
    )
    
    # Confidence based on data quality
    if msg.foot_traffic_score > 0 and msg.competition_count >= 0:
        confidence = "medium"
    else:
        confidence = "low"
    
    response = RevenueResponse(
        conservative=conservative,
        moderate=moderate,
        optimistic=optimistic,
        breakeven_months=min(breakeven, 36),
        confidence=confidence,
        assumptions=[
            f"Foot traffic score: {msg.foot_traffic_score}/100",
            f"Nearby competitors: {msg.competition_count}",
            f"Estimated rent: ${int(msg.rent_estimate)}/mo",
            "Industry-standard conversion rates applied"
        ]
    )
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    revenue_analyst.run()
