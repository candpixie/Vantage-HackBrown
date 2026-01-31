# orchestrator.py
from uagents import Agent, Context, Model

class AnalyzeRequest(Model):
    business_type: str
    target_demo: str
    budget: int
    location_pref: str

class LocationResult(Model):
    neighborhood: str
    score: int
    confidence: str
    breakdown: dict

orchestrator = Agent(
    name="orchestrator",
    seed="orchdawg",
    port=8000,
    endpoint=["http://localhost:8000/submit"]
)

@orchestrator.on_message(model=AnalyzeRequest)
async def handle_request(ctx: Context, sender: str, msg: AnalyzeRequest):
    ctx.logger.info(f"Received request: {msg}")
    
    # TODO: Dispatch to other agents in parallel
    # For MVP: Return hardcoded response
    
    result = LocationResult(
        neighborhood="Chinatown",
        score=87,
        confidence="high",
        breakdown={
            "foot_traffic": 92,
            "demo_match": 85,
            "transit": 95,
            "competition": 75,
            "rent_fit": 80
        }
    )
    
    await ctx.send(sender, result)

if __name__ == "__main__":
    orchestrator.run()

