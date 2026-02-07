"""
Ensemble Prediction Router

Provides the POST /api/v1/ensemble-predict endpoint that combines:
1. Quant Agent (LSTM/GNN base forecast)
2. Topology Agent (Graph Laplacian risk analysis)
3. Sentiment Agent (News/sentiment consensus)

Into a unified weighted prediction with confidence scoring.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
import httpx

from app.services.ensemble_service import ensemble_orchestrator

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/api/v1",
    tags=["Ensemble Predictions"],
)


# Request/Response Models
class EnsemblePredictRequest(BaseModel):
    """Request body for ensemble prediction."""
    symbol: str = Field(..., description="Stock symbol (e.g., RELIANCE, TCS)")
    current_price: Optional[float] = Field(None, description="Current stock price (optional, will be fetched if not provided)")
    shock_simulation: bool = Field(False, description="Enable market shock simulation")
    
    class Config:
        json_schema_extra = {
            "example": {
                "symbol": "RELIANCE",
                "current_price": 2950.00,
                "shock_simulation": False
            }
        }


class EnsembleAgentComponent(BaseModel):
    """Individual agent component in the ensemble."""
    weight: float
    confidence: Optional[float] = None


class QuantAgentResult(EnsembleAgentComponent):
    """Quant Agent output."""
    base_forecast: float
    direction: str
    volatility: float
    trend_strength: float


class TopologyAgentResult(EnsembleAgentComponent):
    """Topology Agent output."""
    risk_adjustment: float
    adjusted_price: float
    network_risk_penalty: float
    cluster_name: str
    cluster_risk: str
    centrality_score: float
    contagion_risk: float
    neighbor_signals: list


class SentimentAgentResult(EnsembleAgentComponent):
    """Sentiment Agent output."""
    sentiment_multiplier: float
    consensus_score: float
    sentiment_label: str
    bull_bear_ratio: float


class ComparisonData(BaseModel):
    """Comparison data for visualization."""
    lstm_base: float
    agentic_adjusted: float
    topology_adjustment_pct: float
    sentiment_adjustment_pct: float
    total_adjustment_pct: float


class EnsemblePredictResponse(BaseModel):
    """Response from ensemble prediction endpoint."""
    symbol: str
    timestamp: str
    current_price: float
    weighted_prediction: float
    confidence_score: float
    direction: str
    price_change_percent: float
    components: Dict[str, Any]
    comparison: ComparisonData
    shock_simulation_active: bool
    disclaimer: str


# Internal API helper
INTERNAL_API_BASE = "http://localhost:8000"


async def fetch_current_price(symbol: str) -> Optional[float]:
    """Fetch current price from internal stock endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{INTERNAL_API_BASE}/stock/{symbol.upper()}")
            if response.status_code == 200:
                data = response.json()
                return data.get('currentPrice')
    except Exception as e:
        logger.warning(f"Could not fetch price for {symbol}: {e}")
    return None


async def fetch_sentiment_data(symbol: str) -> Optional[Dict]:
    """Fetch sentiment data from internal AI prediction endpoint."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{INTERNAL_API_BASE}/ai-prediction/{symbol.upper()}")
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.warning(f"Could not fetch sentiment for {symbol}: {e}")
    return None


@router.post(
    "/ensemble-predict",
    response_model=EnsemblePredictResponse,
    summary="Agentic Ensemble Prediction",
    description="""
    Generate a weighted ensemble prediction by fusing multiple AI agents:
    
    **Agents:**
    1. **Quant Agent (50%)**: LSTM/GNN-based price forecast from historical data
    2. **Topology Agent (30%)**: Graph Laplacian network risk analysis
    3. **Sentiment Agent (20%)**: News/sentiment consensus multiplier
    
    **Features:**
    - Automatic price fetching if not provided
    - Market shock simulation mode
    - Detailed component breakdown
    - Visual comparison data (LSTM Base vs Agentic Adjusted)
    """
)
async def ensemble_predict(request: EnsemblePredictRequest):
    """
    Generate ensemble prediction for a stock symbol.
    
    Combines Quant, Topology, and Sentiment agents into a weighted forecast.
    """
    symbol = request.symbol.upper()
    
    # Validate symbol
    if not symbol or len(symbol) < 2:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    
    # Get current price if not provided
    current_price = request.current_price
    if current_price is None or current_price <= 0:
        fetched_price = await fetch_current_price(symbol)
        if fetched_price:
            current_price = fetched_price
        else:
            # Use fallback demo price
            demo_prices = {
                "RELIANCE": 2950.0,
                "TCS": 4200.0,
                "HDFCBANK": 1750.0,
                "INFY": 1850.0,
                "ICICIBANK": 1250.0,
                "BHARTIARTL": 1650.0,
                "ITC": 485.0,
                "SBIN": 850.0,
                "LT": 3650.0,
                "HCLTECH": 1750.0
            }
            current_price = demo_prices.get(symbol, 1000.0)
    
    # Fetch sentiment data for the sentiment agent
    sentiment_data = await fetch_sentiment_data(symbol)
    
    try:
        # Generate ensemble prediction
        result = ensemble_orchestrator.predict(
            symbol=symbol,
            current_price=current_price,
            sentiment_data=sentiment_data,
            shock_simulation=request.shock_simulation
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Ensemble prediction error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating ensemble prediction: {str(e)}"
        )


@router.get(
    "/ensemble-predict/{symbol}",
    response_model=EnsemblePredictResponse,
    summary="Get Ensemble Prediction (GET)",
    description="Convenience GET endpoint for ensemble prediction"
)
async def ensemble_predict_get(
    symbol: str,
    shock_simulation: bool = Query(False, description="Enable market shock simulation")
):
    """
    GET endpoint for ensemble prediction.
    
    Automatically fetches current price and sentiment data.
    """
    request = EnsemblePredictRequest(
        symbol=symbol,
        shock_simulation=shock_simulation
    )
    return await ensemble_predict(request)
