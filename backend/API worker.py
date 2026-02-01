"""API worker serving frontend requests.

Expected JSON payload:
- business_type (string)
- target_demo (string)
- monthly_budget (number) or budget (number)
"""

from __future__ import annotations

import json
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


if __name__ == "__main__":
	app.run(host="localhost", port=8020, debug=True)
