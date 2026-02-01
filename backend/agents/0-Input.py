from uagents import Agent, Context, Model

# This is here just because it makes it easy to start this agent multiple times to give inputs without restarting all the others

class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str
    latitude: float
    longitude: float
    rent_estimate: float

inputter = Agent(
    name="inputter",
    seed="inputter_seed_phrase",
    port=7999,
    endpoint=["http://localhost:7999/submit"],
    network="testnet",
)

# Use the actual agent address derived from the seed phrase
ORCHESTRATOR_ADDRESS = "agent1q2wva7fjhjqfklv8sna6q3ftcaf32pt7fev5q9w0qwn5earml3a8qz24n4f"

@inputter.on_event("startup")
async def startup_handler(ctx: Context):
    ctx.logger.info(f'My name is {ctx.agent.name} and my address is {ctx.agent.address}')
    ctx.logger.info(f'Attempting to send message to orchestrator at {ORCHESTRATOR_ADDRESS}')
    
    # Get user input
    print("\n=== Business Location Analysis ===")
    use_test = input("Use test data? (yes/no, default=yes): ").strip().lower()
    
    if use_test == "" or use_test == "yes" or use_test == "y":
        # Use dummy test data
        neighborhood = "Williamsburg, Brooklyn"
        business_type = "Coffee Shop"
        target_demo = "Young professionals, ages 25-35"
        latitude = 40.732132
        longitude = -73.998418
        rent_estimate = 4000 # monthly
        print(f"\n✓ Using test data:")
        print(f"  Neighborhood: {neighborhood}")
        print(f"  Business: {business_type}")
        print(f"  Demographics: {target_demo}")
        print(f"  Location: ({latitude}, {longitude})\n")
        print(f"  Rent Estimate: {rent_estimate}\n")
    else:
        # Get real user input
        neighborhood = input("Enter neighborhood: ")
        business_type = input("Enter business type: ")
        target_demo = input("Enter target demographic: ")
        latitude = float(input("Enter latitude: "))
        longitude = float(input("Enter longitude: "))
        rent_estimate = float(input("Enter rent estimate: "))
    
    # Create and send the score request
    score_request = ScoreRequest(
        neighborhood=neighborhood,
        business_type=business_type,
        target_demo=target_demo,
        latitude=latitude,
        longitude=longitude,
        rent_estimate=rent_estimate
    )
    
    ctx.logger.info(f"Sending ScoreRequest for {neighborhood}")
    await ctx.send(ORCHESTRATOR_ADDRESS, score_request)


if __name__ == "__main__":
    inputter.run()
