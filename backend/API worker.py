"""API worker serving frontend requests.

Expected JSON payload:
- business_type (string)
- target_demo (string)
- monthly_budget (number) or budget (number)
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Path to orchestrator results database
DATABASE_PATH = Path(__file__).parent / "agents" / "output" / "orchestrator_results.json"


REQUIRED_FIELDS = ("business_type", "target_demo")


def _validate_payload(payload: Dict[str, Any]) -> Tuple[bool, str]:
	missing = [field for field in REQUIRED_FIELDS if field not in payload]
	if missing:
		return False, f"Missing required field(s): {', '.join(missing)}"

	if not isinstance(payload.get("business_type"), str) or not payload["business_type"].strip():
		return False, "business_type must be a non-empty string"

	if not isinstance(payload.get("target_demo"), str) or not payload["target_demo"].strip():
		return False, "target_demo must be a non-empty string"

	monthly_budget = payload.get("monthly_budget", payload.get("budget"))


	if not isinstance(monthly_budget, (int, float)):
		return False, "monthly_budget must be a number"

	return True, ""


def _load_database() -> Dict[str, Any]:
	"""Load orchestrator results from JSON database."""
	try:
		if not DATABASE_PATH.exists():
			return {"results": [], "metadata": {}}
		
		with open(DATABASE_PATH, 'r') as f:
			return json.load(f)
	except Exception as e:
		print(f"Error loading database: {e}")
		return {"results": [], "metadata": {}}


def _filter_results(
	results: List[Dict[str, Any]],
	business_type: str,
	target_demo: str,
	monthly_budget: float
) -> List[Dict[str, Any]]:
	"""Filter results based on request parameters.
	
	Uses flexible matching:
	- Business type: partial match or common aliases (e.g., 'boba' matches 'retail')
	- Demographics: partial match
	- Budget: 50% tolerance to show more options
	"""
	filtered = []
	
	# Business type aliases for flexible matching
	business_aliases = {
		'boba': ['retail', 'food', 'beverage', 'cafe', 'restaurant'],
		'coffee': ['retail', 'food', 'beverage', 'cafe', 'restaurant'],
		'restaurant': ['retail', 'food', 'dining'],
		'cafe': ['retail', 'food', 'beverage', 'restaurant'],
		'shop': ['retail', 'store'],
		'store': ['retail', 'shop'],
	}
	
	business_lower = business_type.lower()
	
	for result in results:
		req = result.get("request", {})
		result_business = req.get("business_type", "").lower()
		
		# Flexible business type matching
		business_match = False
		if result_business == business_lower:
			business_match = True
		elif business_lower in result_business or result_business in business_lower:
			business_match = True
		else:
			# Check aliases
			for alias_key, alias_values in business_aliases.items():
				if alias_key in business_lower:
					if result_business in alias_values:
						business_match = True
						break
		
		if not business_match:
			continue
		
		# Match target demographic (case-insensitive partial match) - more flexible
		result_demo = req.get("target_demo", "").lower()
		request_demo = target_demo.lower()
		# Allow match if any word overlaps or if demo contains common terms
		demo_match = (
			request_demo in result_demo or 
			result_demo in request_demo or
			any(word in result_demo for word in request_demo.split()) or
			any(word in request_demo for word in result_demo.split())
		)
		# Always include if we matched business type (demo is secondary)
		
		# Filter by budget with 50% tolerance to show more options
		rent_estimate = req.get("rent_estimate", 0)
		if rent_estimate > monthly_budget * 1.5:
			continue
		
		filtered.append(result)
	
	# If no results with strict matching, return all results sorted by score
	if not filtered:
		filtered = results[:]
	
	# Sort by overall score (descending)
	filtered.sort(key=lambda x: x.get("overall_score", 0), reverse=True)
	
	return filtered


@app.get("/health")
def health_check() -> Any:
	return jsonify({"status": "ok"})


@app.route("/submit", methods=["POST", "GET"])
def submit_request() -> Any:
	if request.method == "GET":
		payload = {
			"business_type": request.args.get("type"),
			"target_demo": request.args.get("demo"),
			"monthly_budget": request.args.get("budget", type=float),
		}
	else:
		payload = request.get_json(silent=True) or {}
	
	is_valid, error_message = _validate_payload(payload)
	if not is_valid:
		return jsonify({"status": "error", "error": error_message}), 400

	# Extract parameters (safe after validation)
	business_type: str = payload["business_type"]
	target_demo: str = payload["target_demo"]
	monthly_budget: float = payload.get("monthly_budget", payload.get("budget"))
	
	# Load database and filter results
	database = _load_database()
	all_results = database.get("results", [])
	
	if not all_results:
		return jsonify({
			"status": "error",
			"error": "No results available in database. Please run the orchestrator first."
		}), 404
	
	# Filter results based on criteria
	matching_results = _filter_results(
		all_results,
		business_type,
		target_demo,
		monthly_budget
	)
	
	if not matching_results:
		return jsonify({
			"status": "ok",
			"message": "No locations match your criteria",
			"results": [],
			"total_count": 0,
			"request": payload
		})
	
	return jsonify({
		"status": "ok",
		"results": matching_results,
		"total_count": len(matching_results),
		"request": payload,
		"metadata": database.get("metadata", {})
	})


def generate_ai_insights(location_data: Dict[str, Any]) -> List[Dict[str, Any]]:
	"""
	Generate AI insights using Google Gemini API
	"""
	# Replace YOUR_GEMINI_API_KEY_HERE with your actual Gemini API key
	gemini_api_key = "AIzaSyB7a__9evbglKws4nVo7-BZmtkbNLwyDPo"
	try:
		from google import genai
		from google.genai import Client
		
		client = genai.Client(api_key=gemini_api_key)
		model_name = 'gemma-3-27b-it'
		
		# Build context from location data
		location_name = location_data.get("name", "Location")
		score = location_data.get("score", 0)
		metrics = location_data.get("metrics", [])
		competitors = location_data.get("competitors", [])
		revenue = location_data.get("revenue", [])
		rent_price = location_data.get("rent_price", 0)
		address = location_data.get("address", "")
		business_type = location_data.get("business_type", "retail business")
		target_demo = location_data.get("target_demo", "customers")
		
		# Format metrics
		metrics_text = "\n".join([f"- {m.get('label', '')}: {m.get('score', 0)}/100" for m in metrics])
		
		# Format competitors
		competitors_text = "\n".join([f"- {c.get('name', '')}: {c.get('rating', 0)}★ ({c.get('distance', 'N/A')})" for c in competitors[:5]])
		
		# Format revenue
		revenue_text = "\n".join([f"- {r.get('scenario', '')}: {r.get('monthly', 'N/A')}/mo" for r in revenue])
		
		prompt = f"""You are a commercial real estate analyst for NYC. Analyze this location and generate 4-5 actionable insights. Location: {location_name}
Address: {address}
Overall Score: {score}/100
Monthly Rent: ${rent_price:,}
Business Type: {business_type}
Target Demographic: {target_demo}

Metrics:
{metrics_text}

Nearby Competitors:
{competitors_text}

Revenue Projections:
{revenue_text}

Generate insights in JSON format with this exact structure:
{{
  "insights": [
    {{
      "type": "opportunity|risk|trend|tip",
      "title": "Short title (max 6 words)",
      "description": "Actionable insight (2-3 sentences)"
    }}
  ]
}}

Focus on:
- Specific opportunities based on metrics and competition
- Risks to consider (rent, competition, market trends)
- Demographic or market trends
- Actionable tips for success

Return ONLY valid JSON, no markdown or extra text."""
		
		response = client.models.generate_content(
			model=model_name,
			contents=prompt
		)
		response_text = response.text.strip()
		print(f"Gemini response: {response_text}")
		
		# Clean up response (remove markdown code blocks if present)
		if response_text.startswith("```json"):
			response_text = response_text[7:]
		if response_text.startswith("```"):
			response_text = response_text[3:]
		if response_text.endswith("```"):
			response_text = response_text[:-3]
		response_text = response_text.strip()
		
		# Parse JSON
		result = json.loads(response_text)
		insights = result.get("insights", [])
		
		# Validate and format insights
		formatted_insights = []
		for insight in insights[:5]:  # Limit to 5 insights
			if "type" in insight and "title" in insight and "description" in insight:
				formatted_insights.append({
					"type": insight["type"],
					"title": insight["title"],
					"description": insight["description"]
				})
		
		return formatted_insights
		
	except ImportError:
		print("⚠️  google-genai not installed. Install with: pip install google-genai")
		return []
	except Exception as e:
		print(f"⚠️  Gemini API error: {e}")
		import traceback
		traceback.print_exc()
		return []


@app.route('/generate-insights', methods=['POST'])
def generate_insights() -> Any:
	"""Generate AI insights for a location using Gemini API"""
	try:
		data = request.get_json()
		if not data:
			return jsonify({"error": "No data provided"}), 400
		
		insights = generate_ai_insights(data)
		
		if not insights:
			# Return mock insights as fallback
			return jsonify({
				"insights": [
					{
						"type": "tip",
						"title": "AI Insights Unavailable",
						"description": "Gemini API is not configured. Set GEMINI_API_KEY environment variable to enable AI insights."
					}
				]
			})
		
		return jsonify({"insights": insights})
		
	except Exception as e:
		print(f"Error generating insights: {e}")
		import traceback
		traceback.print_exc()
		return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
	app.run(host="localhost", port=8020, debug=True)
