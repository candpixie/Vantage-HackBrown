"""
Flask App Entrypoint for Deployment
Imports the main Flask application from http_server.py
"""
from backend.http_server import app

# This makes the Flask app discoverable by deployment platforms
if __name__ == "__main__":
    app.run()
