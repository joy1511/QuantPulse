"""
QuantPulse India Backend - Production-Grade Market Data Engine

This is the main FastAPI application file that:
1. Creates and configures the FastAPI app instance
2. Sets up CORS middleware for frontend communication
3. Registers all API routers
4. Initializes logging and configuration
5. Sets up the production-grade stock data system

Architecture:
- Multi-provider stock data with automatic fallback
- Production-grade caching with request coalescing
- Stale-while-revalidate pattern for optimal performance
- Automatic demo mode when providers fail
- Clean separation of concerns with service layers

To run this application:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    
Or simply:
    python run.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
import logging

# Import configuration and setup
from app.config import (
    APP_NAME,
    APP_VERSION,
    APP_DESCRIPTION,
    ALLOWED_ORIGINS,
    DEMO_MODE,
    IS_RAILWAY,
    setup_logging,
    validate_and_log_configuration
)

# Import routers
from app.routers import health
from app.routers import stocks
from app.routers import news
from app.routers import predictions
from app.routers import ensemble

# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# GZip Compression Middleware (High Performance)
# =============================================================================

app.add_middleware(
    GZipMiddleware,
    minimum_size=1000  # Only compress responses larger than 1KB
)

# =============================================================================
# Register Routers
# =============================================================================

app.include_router(health.router)
app.include_router(stocks.router)
app.include_router(news.router)
app.include_router(predictions.router)
app.include_router(ensemble.router)

# =============================================================================
# Application Startup
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    
    # Validate configuration and log startup information
    config_status = validate_and_log_configuration()
    
    # Initialize services (they will self-configure based on available keys)
    from app.services.stock_service import stock_service
    service_status = stock_service.get_service_status()
    
    logger.info("🏗️ Production-grade market data engine initializing...")
    logger.info(f"📊 Stock service status: {service_status['status']}")
    logger.info(f"🔧 Provider mode: {service_status['provider_status']['mode']}")
    
    if service_status['provider_status']['primary_available']:
        logger.info("✅ Primary provider (TwelveData) available")
    
    if service_status['provider_status']['fallback_available']:
        logger.info("✅ Fallback provider (Finnhub) available")
    
    if DEMO_MODE:
        logger.warning("🔄 Running in DEMO MODE - serving simulated data")
        if IS_RAILWAY:
            logger.warning("🔄 Configure API keys in Railway dashboard for live data")
        else:
            logger.warning("🔄 To enable live data, configure TWELVEDATA_API_KEY or FINNHUB_API_KEY")
    else:
        logger.info("📊 Running in LIVE MODE - serving real market data")
    
    logger.info("🎯 Application startup complete - ready to serve requests")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    logger.info("🛑 Application shutting down...")
    
    # Clear cache and cleanup background tasks
    from app.services.cache_service import cache_service
    cache_service.clear_all()
    
    logger.info("✅ Shutdown complete")

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
    from app.services.stock_service import stock_service
    service_status = stock_service.get_service_status()
    
    return {
        "message": "Welcome to QuantPulse India API",
        "description": "Production-grade AI-powered stock market analytics for NSE",
        "version": APP_VERSION,
        "architecture": "Multi-provider with intelligent fallback",
        "features": [
            "Real-time stock quotes",
            "Historical data analysis", 
            "Company profiles",
            "Production-grade caching",
            "Automatic provider fallback",
            "Demo mode support"
        ],
        "docs": "/docs",
        "health": "/health",
        "service_status": {
            "stock_service": service_status["status"],
            "provider_mode": service_status["provider_status"]["mode"],
            "demo_mode": DEMO_MODE,
            "live_providers_available": service_status["provider_status"]["primary_available"] or service_status["provider_status"]["fallback_available"]
        }
    }
