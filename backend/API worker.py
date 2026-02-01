"""API worker serving frontend requests.

Expected JSON payload:
- business_type (string)
- target_demo (string)
- monthly_budget (number) or budget (number)
"""

from __future__ import annotations

from typing import Any, Dict, Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


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

	monthly_budget = payload.get("monthly_budget", payload.get("budget"))
	return jsonify({
		"status": "ok",
		"data": payload,
	})


if __name__ == "__main__":
	app.run(host="localhost", port=8020, debug=True)
