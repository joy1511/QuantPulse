"""
QuantPulse Backend Configuration

This module contains configuration settings for the FastAPI application.
Environment-specific settings are loaded safely for both local and production.
"""

import os

# Load .env ONLY for local development
if not os.getenv("RENDER"):  # Render sets this automatically
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        pass

# Application metadata
APP_NAME = "QuantPulse India Backend"
APP_VERSION = "0.1.0"
APP_DESCRIPTION = "Backend API service for QuantPulse India stock analytics platform"

# API Keys
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")

# Debug (remove after verification)
if NEWSAPI_KEY:
    print("✅ NEWSAPI_KEY loaded")
else:
    print("⚠️ NEWSAPI_KEY NOT FOUND")

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
]

# Server Configuration
HOST = "0.0.0.0"
PORT = int(os.getenv("PORT", 8000))
