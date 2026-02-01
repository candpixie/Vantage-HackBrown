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
@orchestrator.on_event("startup")
async def startup_function(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {orchestrator.name} and my address is {orchestrator.address}.")

    # Send message to location_scout to start process
    # ask for location score for a sample business
    location_scout_address = "agent1qtmh344czvgrgregw9xf7490s7a9qc9twvz3njq6ye6rn0gnpwjg53el5um"
    msg = ScoreRequest(
        neighborhood="Williamsburg, Brooklyn",
        business_type="Coffee Shop",
        target_demo="Young professionals, ages 25-35",
        latitude=40.721990,
        longitude= -73.927764)
    ctx.logger.info(f"Sending message to location_scout at {location_scout_address}")
    await ctx.send(location_scout_address, msg)
    
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

