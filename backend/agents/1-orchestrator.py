from uagents import Agent, Context, Model

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

orchestrator = Agent(
    name="orchestrator",
    seed="orchdawg",
    port=8000,
    endpoint=["http://localhost:8000/submit"],
    network="testnet",
)
location_scout_address = "agent1qtmh344czvgrgregw9xf7490s7a9qc9twvz3njq6ye6rn0gnpwjg53el5um"
competitor_intel_address = "agent1qd33unn63a8qxf8nnex00930nk6hz5scft09rxyk955vks7a7cef7ukd9sz"


@orchestrator.on_event("startup")
async def startup_function(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {orchestrator.name} and my address is {orchestrator.address}.")


@orchestrator.on_message(model=ScoreRequest)
async def handle_score_request(ctx: Context, sender: str, msg: ScoreRequest):
    ctx.logger.info(f'I have received a ScoreRequest from {sender}.')
    ctx.logger.info(f"Neighborhood: {msg.neighborhood}")
    ctx.logger.info(f"Business Type: {msg.business_type}")
    ctx.logger.info(f"Target Demographic: {msg.target_demo}")
    ctx.logger.info(f"Latitude: {msg.latitude}")
    ctx.logger.info(f"Longitude: {msg.longitude}")

    # ask for location score for that business
    msg = ScoreRequest(neighborhood=msg.neighborhood,
                       business_type=msg.business_type,
                       target_demo=msg.target_demo,
                       latitude=msg.latitude,
                       longitude=msg.longitude)
    ctx.logger.info(f"Sending message to location_scout at {location_scout_address}")
    await ctx.send(location_scout_address, msg)

    # ask for competitor intel for that business
    msg = ScoreRequest(neighborhood=msg.neighborhood,
                       business_type=msg.business_type,
                       target_demo=msg.target_demo,
                       latitude=msg.latitude,
                       longitude=msg.longitude)
    ctx.logger.info(f"Sending message to competitor_intel at {competitor_intel_address}")
    await ctx.send(competitor_intel_address, msg)

  
class Message(Model):
    message: str

@orchestrator.on_message(model=ScoreResponse)
async def handle_score_response(ctx: Context, sender: str, msg: ScoreResponse):
    ctx.logger.info(f'I have received a ScoreResponse from {sender}.')
    ctx.logger.info(f"Received score: {msg.score}")
    ctx.logger.info(f"Confidence: {msg.confidence}")
    ctx.logger.info(f"Breakdown: {msg.breakdown}")

if __name__ == "__main__":
    orchestrator.run()

