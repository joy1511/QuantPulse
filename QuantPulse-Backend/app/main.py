"""
QuantPulse India Backend - Main Application Entry Point

This is the main FastAPI application file that:
1. Creates and configures the FastAPI app instance
2. Sets up CORS middleware for frontend communication
3. Registers all API routers
4. Defines the root endpoint

To run this application:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    
Or simply:
    python run.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Import configuration
from app.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    ALLOWED_ORIGINS,
)

# Import routers
from app.routers import health
from app.routers import stocks
from app.routers import news
from app.routers import predictions


# =============================================================================
# Create FastAPI Application
# =============================================================================

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    docs_url="/docs",       # Swagger UI available at /docs
    redoc_url="/redoc",     # ReDoc available at /redoc
)


# =============================================================================
# CORS Middleware Configuration
# =============================================================================
# CORS (Cross-Origin Resource Sharing) allows the frontend running on a
# different port/domain to make requests to this API.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # List of allowed frontend origins
    allow_credentials=True,          # Allow cookies and auth headers
    allow_methods=["*"],             # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],             # Allow all headers
)


# =============================================================================
# Register Routers
# =============================================================================
# Each router handles a specific domain of the API.
# Add new routers here as the application grows.

app.include_router(health.router)
app.include_router(stocks.router)
app.include_router(news.router)
app.include_router(predictions.router)


# =============================================================================
# Root Endpoint
# =============================================================================

@app.get("/", tags=["Root"])
async def root():
    """
    Root Endpoint
    
    Provides a welcome message and basic API information.
    This is the first endpoint users will see when accessing the API directly.
    
    Returns:
        dict: Welcome message with API information
    """
    return {
        "message": "Welcome to QuantPulse India API",
        "description": "AI-powered stock market analytics for NSE",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }
