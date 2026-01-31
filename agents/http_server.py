"""
HTTP Server wrapper for the orchestrator agent
Bridges HTTP requests to uagents agent communication
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
# Note: Can't import 1-orchestrator.py directly due to dash in filename
# We'll implement the logic directly here

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Store for async agent responses
response_store = {}

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok", "service": "orchestrator"}), 200

@app.route('/submit', methods=['POST'])
def submit_analysis():
    """Submit analysis request to orchestrator agent"""
    try:
        data = request.get_json()
        
        # Extract request data
        business_type = data.get('business_type', '')
        target_demo = data.get('target_demo', '')
        budget = data.get('budget', 0)
        location_pref = data.get('location_pref', '')
        
        # For now, return a mock response that matches the frontend format
        # TODO: Integrate with actual uagents agent communication
        # The uagents framework uses agent-to-agent messaging, not HTTP
        response = {
            "status": "completed",
            "progress": 100,
            "active_agent": None,
            "agent_statuses": [
                {"agent_id": "orchestrator", "agent_name": "Neural Core", "status": "done", "progress": 100},
                {"agent_id": "scout", "agent_name": "Geo-Scanner", "status": "done", "progress": 100},
                {"agent_id": "intel", "agent_name": "Ghost Intel", "status": "done", "progress": 100},
                {"agent_id": "analyst", "agent_name": "Market Analyst", "status": "done", "progress": 100},
                {"agent_id": "visualizer", "agent_name": "Optic Render", "status": "done", "progress": 100},
            ],
            "locations": [
                {
                    "id": 1,
                    "name": "Chelsea Highline",
                    "score": 98,
                    "x": 35,
                    "y": 45,
                    "status": "HIGH",
                    "metrics": [
                        {"label": "Elite Density", "score": 98, "confidence": "HIGH"},
                        {"label": "Net Disposable", "score": 95, "confidence": "HIGH"},
                        {"label": "Foot Velocity", "score": 92, "confidence": "HIGH"},
                        {"label": "Transit", "score": 96, "confidence": "HIGH"},
                        {"label": "Rent Alpha", "score": 88, "confidence": "HIGH"},
                    ],
                    "competitors": [
                        {"name": "Blue Bottle Coffee", "rating": 4.6, "reviews": 1247, "distance": "0.1 mi", "status": "Open", "weakness": "Premium pricing"},
                        {"name": "Joe Coffee", "rating": 4.4, "reviews": 892, "distance": "0.2 mi", "status": "Open", "weakness": "Limited seating"},
                    ],
                    "revenue": [
                        {"scenario": "Conservative", "monthly": "$28,500", "annual": "$342k", "margin": "22%"},
                        {"scenario": "Moderate", "monthly": "$42,200", "annual": "$506k", "margin": "28%", "isRecommended": True},
                        {"scenario": "Optimistic", "monthly": "$58,800", "annual": "$706k", "margin": "32%"},
                    ],
                    "checklist": [
                        {"text": "Verify zoning permits for food service", "completed": False},
                        {"text": "Contact landlord for lease terms", "completed": False},
                        {"text": "Check foot traffic data for peak hours", "completed": True},
                        {"text": "Review competitor pricing strategy", "completed": False},
                        {"text": "Schedule site visit with realtor", "completed": False},
                    ],
                },
                {
                    "id": 2,
                    "name": "Tribeca",
                    "score": 89,
                    "x": 60,
                    "y": 55,
                    "status": "HIGH",
                    "metrics": [
                        {"label": "Elite Density", "score": 92, "confidence": "HIGH"},
                        {"label": "Net Disposable", "score": 88, "confidence": "HIGH"},
                        {"label": "Foot Velocity", "score": 85, "confidence": "MEDIUM"},
                        {"label": "Transit", "score": 90, "confidence": "HIGH"},
                        {"label": "Rent Alpha", "score": 82, "confidence": "MEDIUM"},
                    ],
                    "competitors": [
                        {"name": "La Colombe", "rating": 4.7, "reviews": 2156, "distance": "0.2 mi", "status": "Open", "weakness": "High-end positioning"},
                        {"name": "Bluestone Lane", "rating": 4.5, "reviews": 1834, "distance": "0.3 mi", "status": "Open", "weakness": "Australian focus"},
                    ],
                    "revenue": [
                        {"scenario": "Conservative", "monthly": "$32,500", "annual": "$390k", "margin": "24%"},
                        {"scenario": "Moderate", "monthly": "$45,800", "annual": "$550k", "margin": "30%", "isRecommended": True},
                        {"scenario": "Optimistic", "monthly": "$62,400", "annual": "$749k", "margin": "34%"},
                    ],
                    "checklist": [
                        {"text": "Verify zoning permits for food service", "completed": False},
                        {"text": "Contact landlord for lease terms", "completed": False},
                        {"text": "Check foot traffic data for peak hours", "completed": False},
                        {"text": "Review competitor pricing strategy", "completed": False},
                        {"text": "Schedule site visit with realtor", "completed": False},
                    ],
                },
                {
                    "id": 3,
                    "name": "SoHo",
                    "score": 87,
                    "x": 50,
                    "y": 70,
                    "status": "HIGH",
                    "metrics": [
                        {"label": "Elite Density", "score": 94, "confidence": "HIGH"},
                        {"label": "Net Disposable", "score": 91, "confidence": "HIGH"},
                        {"label": "Foot Velocity", "score": 88, "confidence": "HIGH"},
                        {"label": "Transit", "score": 85, "confidence": "MEDIUM"},
                        {"label": "Rent Alpha", "score": 75, "confidence": "MEDIUM"},
                    ],
                    "competitors": [
                        {"name": "Café Gitane", "rating": 4.6, "reviews": 1923, "distance": "0.2 mi", "status": "Open", "weakness": "French bistro style"},
                        {"name": "Balthazar", "rating": 4.4, "reviews": 3456, "distance": "0.4 mi", "status": "Open", "weakness": "Upscale dining"},
                    ],
                    "revenue": [
                        {"scenario": "Conservative", "monthly": "$35,200", "annual": "$422k", "margin": "26%"},
                        {"scenario": "Moderate", "monthly": "$48,600", "annual": "$583k", "margin": "31%", "isRecommended": True},
                        {"scenario": "Optimistic", "monthly": "$65,800", "annual": "$790k", "margin": "35%"},
                    ],
                    "checklist": [
                        {"text": "Verify zoning permits for food service", "completed": False},
                        {"text": "Contact landlord for lease terms", "completed": False},
                        {"text": "Check foot traffic data for peak hours", "completed": False},
                        {"text": "Review competitor pricing strategy", "completed": False},
                        {"text": "Schedule site visit with realtor", "completed": False},
                    ],
                },
            ]
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/status/<request_id>', methods=['GET'])
def get_status(request_id):
    """Get analysis status (for polling)"""
    # For now, return completed status
    return jsonify({
        "status": "completed",
        "progress": 100
    }), 200

if __name__ == '__main__':
    print("Starting HTTP server on http://localhost:8000")
    print("Orchestrator agent backend ready")
    app.run(host='0.0.0.0', port=8000, debug=True)
