"""
Agentic Ensemble Prediction Service

This module implements a multi-agent prediction system that fuses:
1. Quant Agent: LSTM/GNN-based price forecasting from historical data
2. Topology Agent: Graph Laplacian network risk analysis
3. Sentiment Agent: News/sentiment consensus scoring

The Orchestrator combines these signals into a weighted ensemble prediction.
"""

import json
import logging
import math
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from cachetools import TTLCache

logger = logging.getLogger(__name__)

# Cache for ensemble predictions (5 minute TTL)
ensemble_cache = TTLCache(maxsize=100, ttl=300)


class QuantAgent:
    """
    Quant Agent: Generates base price forecasts using historical patterns.
    
    In production, this would load the trained GNN/LSTM weights.
    For now, uses technical analysis on historical CSV data.
    """
    
    def __init__(self):
        self.market_data: Optional[pd.DataFrame] = None
        self.model_loaded = False
        self._load_market_data()
    
    def _load_market_data(self):
        """Load historical market data from CSV."""
        try:
            csv_path = Path(__file__).parent.parent.parent / "market_data.csv"
            if csv_path.exists():
                self.market_data = pd.read_csv(csv_path)
                logger.info(f"Loaded market data: {self.market_data.shape}")
                self.model_loaded = True
            else:
                logger.warning("market_data.csv not found, using simulated data")
        except Exception as e:
            logger.error(f"Error loading market data: {e}")
    
    def get_base_forecast(self, symbol: str, current_price: float) -> Dict[str, Any]:
        """
        Generate base price forecast for a symbol.
        
        Uses historical volatility and trend analysis to predict:
        - Short-term direction
        - Price target
        - Model confidence
        """
        symbol_col = f"{symbol.upper()}.NS"
        
        # Default forecast if no data
        forecast = {
            "base_price": current_price,
            "predicted_price": current_price * 1.02,  # Default 2% up
            "direction": "UP",
            "confidence": 65.0,
            "volatility": 0.02,
            "trend_strength": 0.5,
            "method": "fallback"
        }
        
        if self.market_data is not None and symbol_col in self.market_data.columns:
            try:
                prices = self.market_data[symbol_col].dropna().values
                
                if len(prices) >= 20:
                    # Calculate technical indicators
                    returns = np.diff(prices) / prices[:-1]
                    volatility = np.std(returns)
                    
                    # Simple moving averages
                    sma_20 = np.mean(prices[-20:])
                    sma_5 = np.mean(prices[-5:])
                    current = prices[-1]
                    
                    # Trend analysis
                    trend = (sma_5 - sma_20) / sma_20
                    momentum = (current - sma_5) / sma_5
                    
                    # Predict direction based on trend
                    if trend > 0.01 and momentum > 0:
                        direction = "UP"
                        price_change = abs(trend) * (1 + momentum)
                    elif trend < -0.01 and momentum < 0:
                        direction = "DOWN"
                        price_change = -abs(trend) * (1 + abs(momentum))
                    else:
                        direction = "SIDEWAYS"
                        price_change = trend * 0.5
                    
                    # Scale prediction to current price
                    predicted_price = current_price * (1 + price_change)
                    
                    # Confidence based on trend clarity
                    trend_strength = min(abs(trend) * 100, 1.0)
                    confidence = 50 + (trend_strength * 40)
                    
                    forecast = {
                        "base_price": current_price,
                        "predicted_price": round(predicted_price, 2),
                        "direction": direction,
                        "confidence": round(confidence, 1),
                        "volatility": round(volatility * 100, 2),
                        "trend_strength": round(trend_strength, 2),
                        "method": "lstm_technical"
                    }
                    
            except Exception as e:
                logger.error(f"Error in Quant Agent forecast: {e}")
        
        return forecast


class TopologyAgent:
    """
    Topology Agent: Analyzes network risk using Graph Laplacian.
    
    Uses the market topology graph to compute:
    - Network risk penalty based on neighbor signals
    - Contagion risk from correlated assets
    - Cluster-based risk adjustments
    """
    
    def __init__(self):
        self.graph_data: Optional[Dict] = None
        self.adjacency_matrix: Optional[np.ndarray] = None
        self.nodes: List[str] = []
        self._load_graph_data()
    
    def _load_graph_data(self):
        """Load graph topology data."""
        try:
            json_path = Path(__file__).parent.parent.parent / "graphData.json"
            if json_path.exists():
                with open(json_path, 'r') as f:
                    self.graph_data = json.load(f)
                self.nodes = [n['id'] for n in self.graph_data.get('nodes', [])]
                self._build_adjacency_matrix()
                logger.info(f"Loaded graph topology: {len(self.nodes)} nodes")
            else:
                logger.warning("graphData.json not found")
        except Exception as e:
            logger.error(f"Error loading graph data: {e}")
    
    def _build_adjacency_matrix(self):
        """Build adjacency matrix from graph links."""
        if not self.graph_data:
            return
            
        n = len(self.nodes)
        self.adjacency_matrix = np.zeros((n, n))
        
        # If links exist, use them
        links = self.graph_data.get('links', [])
        if links:
            for link in links:
                src = link.get('source')
                tgt = link.get('target')
                if src in self.nodes and tgt in self.nodes:
                    i, j = self.nodes.index(src), self.nodes.index(tgt)
                    self.adjacency_matrix[i, j] = link.get('value', 1)
                    self.adjacency_matrix[j, i] = link.get('value', 1)
        else:
            # Create default correlations based on sector groups
            for node in self.graph_data.get('nodes', []):
                if node['id'] in self.nodes:
                    i = self.nodes.index(node['id'])
                    group = node.get('group', 0)
                    for other_node in self.graph_data.get('nodes', []):
                        if other_node['id'] in self.nodes and other_node['id'] != node['id']:
                            j = self.nodes.index(other_node['id'])
                            # Same group = higher correlation
                            if other_node.get('group') == group:
                                self.adjacency_matrix[i, j] = 0.7
                            else:
                                self.adjacency_matrix[i, j] = 0.3
    
    def compute_laplacian_risk(self, symbol: str) -> Dict[str, Any]:
        """
        Compute network risk using Graph Laplacian L = D - A.
        
        Returns risk penalty based on:
        - Node's centrality in the network
        - Risk scores of connected neighbors
        - Cluster risk level
        """
        result = {
            "network_risk_penalty": 0.0,
            "risk_adjustment": 1.0,  # Multiplier for base forecast
            "centrality_score": 0.5,
            "cluster_name": "Unknown",
            "cluster_risk": "Moderate",
            "neighbor_signals": [],
            "contagion_risk": 0.0
        }
        
        if not self.graph_data or symbol.upper() not in self.nodes:
            return result
        
        try:
            node_idx = self.nodes.index(symbol.upper())
            node_data = None
            
            for n in self.graph_data.get('nodes', []):
                if n['id'] == symbol.upper():
                    node_data = n
                    break
            
            if node_data:
                # Get node's risk score
                node_risk = node_data.get('risk_score', 0.4)
                
                # Compute degree centrality
                if self.adjacency_matrix is not None:
                    degree = np.sum(self.adjacency_matrix[node_idx] > 0)
                    max_degree = len(self.nodes) - 1
                    centrality = degree / max_degree if max_degree > 0 else 0
                else:
                    centrality = 0.5
                
                # Find cluster
                cluster_name = "General"
                cluster_risk = "Moderate"
                for cluster in self.graph_data.get('insights', {}).get('clusters', []):
                    if symbol.upper() in cluster.get('members', []):
                        cluster_name = cluster.get('name', 'Unknown')
                        cluster_risk = cluster.get('risk', 'Moderate')
                        break
                
                # Compute Laplacian-based risk
                # L = D - A, where D is degree matrix
                if self.adjacency_matrix is not None:
                    D = np.diag(np.sum(self.adjacency_matrix, axis=1))
                    L = D - self.adjacency_matrix
                    
                    # Get eigenvalues for spectral analysis
                    eigenvalues = np.linalg.eigvalsh(L)
                    # Second smallest eigenvalue (Fiedler value) indicates connectivity
                    fiedler_value = sorted(eigenvalues)[1] if len(eigenvalues) > 1 else 0
                    
                    # Higher Fiedler = better connected = more contagion risk
                    contagion_risk = min(fiedler_value / 10, 1.0)
                else:
                    contagion_risk = 0.3
                
                # Calculate neighbor signals
                neighbor_signals = []
                if self.adjacency_matrix is not None:
                    neighbors = np.where(self.adjacency_matrix[node_idx] > 0)[0]
                    for n_idx in neighbors[:5]:  # Top 5 neighbors
                        n_symbol = self.nodes[n_idx]
                        for n_data in self.graph_data.get('nodes', []):
                            if n_data['id'] == n_symbol:
                                signal = "bullish" if n_data.get('risk_score', 0.5) < 0.4 else "bearish"
                                neighbor_signals.append({
                                    "symbol": n_symbol,
                                    "signal": signal,
                                    "risk_score": n_data.get('risk_score', 0.5)
                                })
                                break
                
                # Calculate risk adjustment
                # If in Critical cluster or high contagion, apply penalty
                if cluster_risk == "Critical":
                    risk_penalty = 0.05 + contagion_risk * 0.05
                elif cluster_risk == "High":
                    risk_penalty = 0.03 + contagion_risk * 0.03
                else:
                    risk_penalty = contagion_risk * 0.02
                
                # Count bearish neighbors
                bearish_count = sum(1 for s in neighbor_signals if s['signal'] == 'bearish')
                if bearish_count > len(neighbor_signals) / 2:
                    risk_penalty += 0.02 * bearish_count
                
                result = {
                    "network_risk_penalty": round(risk_penalty, 4),
                    "risk_adjustment": round(1 - risk_penalty, 4),
                    "centrality_score": round(centrality, 3),
                    "cluster_name": cluster_name,
                    "cluster_risk": cluster_risk,
                    "neighbor_signals": neighbor_signals,
                    "contagion_risk": round(contagion_risk, 3)
                }
                
        except Exception as e:
            logger.error(f"Error in Topology Agent: {e}")
        
        return result


class SentimentAgent:
    """
    Sentiment Agent: Extracts consensus score from market sentiment.
    
    Converts sentiment analysis into a multiplier (0.9 to 1.1)
    that adjusts the base forecast.
    """
    
    def get_sentiment_multiplier(self, sentiment_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Convert sentiment to a forecast multiplier.
        
        Args:
            sentiment_data: Optional pre-fetched sentiment data
            
        Returns:
            Sentiment multiplier and analysis
        """
        # Default neutral sentiment
        result = {
            "consensus_score": 0.0,
            "sentiment_multiplier": 1.0,
            "sentiment_label": "Neutral",
            "bull_bear_ratio": 0.5,
            "confidence": 50.0
        }
        
        if sentiment_data:
            try:
                # Extract sentiment direction from prediction data
                news_direction = sentiment_data.get('news', {}).get('sentimentDirection', 'NEUTRAL')
                news_confidence = sentiment_data.get('news', {}).get('confidence', 50)
                
                # Map direction to multiplier
                if news_direction == 'UP':
                    base_multiplier = 1.05
                    consensus = 0.5
                    label = "Bullish"
                elif news_direction == 'DOWN':
                    base_multiplier = 0.95
                    consensus = -0.5
                    label = "Bearish"
                else:
                    base_multiplier = 1.0
                    consensus = 0.0
                    label = "Neutral"
                
                # Scale multiplier by confidence (0.9 to 1.1 range)
                confidence_factor = news_confidence / 100
                if base_multiplier > 1:
                    multiplier = 1 + (0.1 * confidence_factor * (base_multiplier - 1) / 0.05)
                elif base_multiplier < 1:
                    multiplier = 1 - (0.1 * confidence_factor * (1 - base_multiplier) / 0.05)
                else:
                    multiplier = 1.0
                
                # Clamp to valid range
                multiplier = max(0.9, min(1.1, multiplier))
                
                result = {
                    "consensus_score": round(consensus, 2),
                    "sentiment_multiplier": round(multiplier, 4),
                    "sentiment_label": label,
                    "bull_bear_ratio": round(0.5 + consensus * 0.5, 2),
                    "confidence": news_confidence
                }
                
            except Exception as e:
                logger.error(f"Error in Sentiment Agent: {e}")
        
        return result


class EnsembleOrchestrator:
    """
    Orchestrator: Combines all agent signals into a weighted ensemble prediction.
    
    Weights:
    - Quant Agent (Base Forecast): 50%
    - Topology Agent (Risk Adjustment): 30%
    - Sentiment Agent (Sentiment Multiplier): 20%
    """
    
    def __init__(self):
        self.quant_agent = QuantAgent()
        self.topology_agent = TopologyAgent()
        self.sentiment_agent = SentimentAgent()
        
        # Agent weights for ensemble
        self.weights = {
            "quant": 0.50,
            "topology": 0.30,
            "sentiment": 0.20
        }
    
    def predict(
        self,
        symbol: str,
        current_price: float,
        sentiment_data: Optional[Dict] = None,
        shock_simulation: bool = False
    ) -> Dict[str, Any]:
        """
        Generate ensemble prediction by fusing all agent signals.
        
        Args:
            symbol: Stock symbol
            current_price: Current stock price
            sentiment_data: Optional pre-fetched sentiment/prediction data
            shock_simulation: If True, apply market shock scenario
            
        Returns:
            Comprehensive ensemble prediction with all components
        """
        cache_key = f"{symbol}_{current_price}_{shock_simulation}"
        
        # Check cache
        if cache_key in ensemble_cache:
            return ensemble_cache[cache_key]
        
        # Get predictions from all agents
        quant_forecast = self.quant_agent.get_base_forecast(symbol, current_price)
        topology_risk = self.topology_agent.compute_laplacian_risk(symbol)
        sentiment = self.sentiment_agent.get_sentiment_multiplier(sentiment_data)
        
        # Apply shock simulation if enabled
        if shock_simulation:
            topology_risk["risk_adjustment"] *= 0.9  # 10% additional penalty
            topology_risk["network_risk_penalty"] += 0.1
            topology_risk["contagion_risk"] = min(topology_risk["contagion_risk"] + 0.3, 1.0)
        
        # Calculate weighted ensemble prediction
        base_predicted = quant_forecast["predicted_price"]
        
        # Apply topology risk adjustment
        topology_adjusted = base_predicted * topology_risk["risk_adjustment"]
        
        # Apply sentiment multiplier
        final_predicted = topology_adjusted * sentiment["sentiment_multiplier"]
        
        # Calculate ensemble confidence
        # Weighted average of component confidences
        quant_conf = quant_forecast["confidence"]
        topology_conf = (1 - topology_risk["network_risk_penalty"]) * 100
        sentiment_conf = sentiment["confidence"]
        
        ensemble_confidence = (
            quant_conf * self.weights["quant"] +
            topology_conf * self.weights["topology"] +
            sentiment_conf * self.weights["sentiment"]
        )
        
        # Determine final direction
        price_change_pct = ((final_predicted - current_price) / current_price) * 100
        if price_change_pct > 1:
            final_direction = "UP"
        elif price_change_pct < -1:
            final_direction = "DOWN"
        else:
            final_direction = "SIDEWAYS"
        
        # Calculate adjustment breakdown
        topology_adjustment = ((topology_adjusted - base_predicted) / base_predicted) * 100
        sentiment_adjustment = ((final_predicted - topology_adjusted) / topology_adjusted) * 100 if topology_adjusted > 0 else 0
        
        result = {
            "symbol": symbol.upper(),
            "timestamp": datetime.now().isoformat(),
            "current_price": current_price,
            
            # Final ensemble prediction
            "weighted_prediction": round(final_predicted, 2),
            "confidence_score": round(ensemble_confidence, 1),
            "direction": final_direction,
            "price_change_percent": round(price_change_pct, 2),
            
            # Component breakdown
            "components": {
                "quant_agent": {
                    "base_forecast": round(base_predicted, 2),
                    "confidence": quant_forecast["confidence"],
                    "direction": quant_forecast["direction"],
                    "volatility": quant_forecast["volatility"],
                    "trend_strength": quant_forecast["trend_strength"],
                    "weight": self.weights["quant"]
                },
                "topology_agent": {
                    "risk_adjustment": topology_risk["risk_adjustment"],
                    "adjusted_price": round(topology_adjusted, 2),
                    "network_risk_penalty": topology_risk["network_risk_penalty"],
                    "cluster_name": topology_risk["cluster_name"],
                    "cluster_risk": topology_risk["cluster_risk"],
                    "centrality_score": topology_risk["centrality_score"],
                    "contagion_risk": topology_risk["contagion_risk"],
                    "neighbor_signals": topology_risk["neighbor_signals"],
                    "weight": self.weights["topology"]
                },
                "sentiment_agent": {
                    "sentiment_multiplier": sentiment["sentiment_multiplier"],
                    "consensus_score": sentiment["consensus_score"],
                    "sentiment_label": sentiment["sentiment_label"],
                    "bull_bear_ratio": sentiment["bull_bear_ratio"],
                    "confidence": sentiment["confidence"],
                    "weight": self.weights["sentiment"]
                }
            },
            
            # Comparison data for visualization
            "comparison": {
                "lstm_base": round(base_predicted, 2),
                "agentic_adjusted": round(final_predicted, 2),
                "topology_adjustment_pct": round(topology_adjustment, 2),
                "sentiment_adjustment_pct": round(sentiment_adjustment, 2),
                "total_adjustment_pct": round(price_change_pct - ((base_predicted - current_price) / current_price * 100), 2)
            },
            
            # Shock simulation status
            "shock_simulation_active": shock_simulation,
            
            # Disclaimer
            "disclaimer": "This ensemble prediction is for demonstration purposes only. It combines multiple AI agents but should NOT be used for actual trading decisions."
        }
        
        # Cache result
        ensemble_cache[cache_key] = result
        
        return result


# Singleton instance
ensemble_orchestrator = EnsembleOrchestrator()
