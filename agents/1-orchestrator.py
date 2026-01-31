from uagents import Agent, Context, Model

# class AnalyzeRequest(Model):
#     business_type: str
#     target_demo: str
#     budget: int
#     location_pref: str

# class LocationResult(Model):
#     neighborhood: str
#     score: int
#     confidence: str
#     breakdown: dict


class ScoreResponse(Model):
    score: int


class ScoreRequest(Model):
    neighborhood: str
    business_type: str
    target_demo: str

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
        target_demo="Young professionals, ages 25-35")
    ctx.logger.info(f"Sending message to location_scout at {location_scout_address}")
    await ctx.send(location_scout_address, msg)
    
class Message(Model):
    message: str

@orchestrator.on_message(model=ScoreResponse)
async def handle_score_response(ctx: Context, sender: str, msg: ScoreResponse):
    ctx.logger.info(f'I have received a ScoreResponse from {sender}.')
    ctx.logger.info(f"Received score: {msg.score}")

# @orchestrator.on_message(model=AnalyzeRequest)
# async def handle_request(ctx: Context, sender: str, msg: AnalyzeRequest):
    # ctx.logger.info(f'I have received an AnalyzeRequest from {sender}.')
    # ctx.logger.info(f"Received request: {msg}")
    
    # TODO: Dispatch to other agents in parallel
    # For MVP: Return hardcoded response
    
    # result = LocationResult(
    #     neighborhood="Chinatown",
    #     score=87,
    #     confidence="high",
    #     breakdown={
    #         "foot_traffic": 92,
    #         "demo_match": 85,
    #         "transit": 95,
    #         "competition": 75,
    #         "rent_fit": 80
    #     }
    # )
    
#     await ctx.send(sender, result)

if __name__ == "__main__":
    orchestrator.run()

