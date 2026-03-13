"""
Entry point for the Damage Analyzer Flask application.

Usage:
    flask run --host=0.0.0.0 --port=5000

The server reads PORT from the environment (defaults to 5000).
"""

import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

# Note: For production, use a WSGI server like gunicorn.
# Example: flask run --host=0.0.0.0 --port=5000
