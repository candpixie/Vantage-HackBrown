# storefront_visualizer.py
from uagents import Agent, Context, Model
import requests
import base64
import os

class StorefrontRequest(Model):
    business_type: str
    neighborhood: str
    style: str = "modern minimalist"  # or "cozy traditional", "trendy industrial"

class StorefrontResponse(Model):
    image_base64: str
    prompt_used: str
    success: bool
    error: str = ""

storefront_visualizer = Agent(
    name="storefront_visualizer",
    seed="storefront_visualizer_seed_phrase"
)

STABILITY_API_KEY = os.getenv("STABILITY_API_KEY")

def generate_storefront(business_type, neighborhood, style):
    """Generate AI mockup via Stability AI"""
    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    
    headers = {
        "Authorization": f"Bearer {STABILITY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Craft prompt for best results
    prompt = f"Professional storefront mockup of a {business_type} in {neighborhood} NYC, {style} interior design, large glass windows, street view perspective, daytime golden hour lighting, architectural photography, 4k quality, no text or signage"
    
    negative_prompt = "blurry, low quality, distorted, text, watermark, logo, people, cars"
    
    payload = {
        "text_prompts": [
            {"text": prompt, "weight": 1},
            {"text": negative_prompt, "weight": -1}
        ],
        "cfg_scale": 7,
        "height": 768,
        "width": 1024,
        "samples": 1,
        "steps": 30
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            image_b64 = data["artifacts"][0]["base64"]
            return image_b64, prompt, True, ""
        else:
            return "", prompt, False, f"API error: {response.status_code}"
    except Exception as e:
        return "", prompt, False, str(e)

@storefront_visualizer.on_message(model=StorefrontRequest)
async def generate_mockup(ctx: Context, sender: str, msg: StorefrontRequest):
    ctx.logger.info(f"Generating storefront for {msg.business_type} in {msg.neighborhood}")
    
    image_b64, prompt, success, error = generate_storefront(
        msg.business_type,
        msg.neighborhood,
        msg.style
    )
    
    response = StorefrontResponse(
        image_base64=image_b64,
        prompt_used=prompt,
        success=success,
        error=error
    )
    
    await ctx.send(sender, response)

if __name__ == "__main__":
    storefront_visualizer.run()
