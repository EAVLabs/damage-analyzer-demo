"""
Entry point for the Damage Analyzer Flask application.

Usage:
    gunicorn -w 4 -b 0.0.0.0:5000 run:app

The server reads PORT from the environment (defaults to 5000).
"""

import os
from app import create_app

app = create_app()

# Note: For production, use a WSGI server like gunicorn.
# Example: gunicorn -w 4 -b 0.0.0.0:5000 run:app
