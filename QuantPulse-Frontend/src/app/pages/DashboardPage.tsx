import { useState, useEffect, useCallback } from "react";
import { StockInput } from "@/app/components/StockInput";
import { StockChart } from "@/app/components/StockChart";
import { SentimentIndicator } from "@/app/components/SentimentIndicator";
import { NewsSentiment } from "@/app/components/NewsSentiment";
import { MarketContextStrip } from "@/app/components/MarketContextStrip";
import { AIPredictionCard } from "@/app/components/AIPredictionCard";
import { StockMetrics } from "@/app/components/StockMetrics";
import { PredictionEnsembleCard } from "@/app/components/PredictionEnsembleCard";
import {
  fetchStockData,
  fetchAIPrediction,
  fetchEnsemblePrediction,
  type StockData,
  type AIPredictionData,
  type EnsemblePredictionData,
  type ApiError,
} from "@/app/services/api";
import { Loader2, AlertCircle, Zap } from "lucide-react";

// Mock data generator for chart (keeping this for now until chart backend is ready)
const generateStockData = (basePrice: number) => {
  const data = [];
  let price = basePrice;

  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.5) * (basePrice * 0.02);
    price = price + change;
    data.push({
      time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
};

export function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState("RELIANCE");

  // Data States
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [aiData, setAiData] = useState<AIPredictionData | null>(null);
  const [ensembleData, setEnsembleData] =
    useState<EnsemblePredictionData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isEnsembleLoading, setIsEnsembleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [shockActive, setShockActive] = useState(false);

  // Mock Data Generators for Offline Mode
  const getOfflineStockData = (symbol: string): StockData => ({
    symbol: symbol,
    yahooSymbol: `${symbol}.NS`,
    companyName: `${symbol} India Ltd (Demo)`,
    currentPrice: 2450.0,
    previousClose: 2400.0,
    change: 50.0,
    changePercent: 2.08,
    volume: 1500000,
    volumeFormatted: "1.5M",
    marketCap: 15000000000,
    marketCapFormatted: "1.5T",
    currency: "INR",
    exchange: "NSE",
    timestamp: new Date().toISOString(),
    marketState: "REGULAR",
  });

  const getOfflineAiData = (symbol: string): AIPredictionData => ({
    symbol: symbol,
    timestamp: new Date().toISOString(),
    prediction: {
      direction: "UP",
      trendLabel: "Bullish",
      overallConfidence: 85,
      signalsAgree: true,
      signalsConflict: false,
      agreementStatus: "agree",
    },
    technical: {
      direction: "UP",
      trendLabel: "Strong Buy",
      confidence: 88,
      weight: "High",
      currentPrice: 2450.0,
      sma5Day: 2410.0,
      deviationPercent: 1.6,
    },
    news: {
      sentimentLabel: "Positive",
      sentimentDirection: "UP",
      confidence: 70,
      weight: "Medium",
      articlesAnalyzed: 15,
    },
    explanation: [
      "Technical indicators show strong upward momentum.",
      "Positive news sentiment supports the bullish trend.",
      "Price is trading above key moving averages.",
    ],
    logic: {
      rule1: "Price > SMA20",
      rule2: "RSI < 70 (Not Overbought)",
      rule3: "MACD > Signal Line",
      rule4: "Volume > Average",
    },
    disclaimer: "This is a demo prediction generated for offline mode.",
  });

  const getOfflineEnsembleData = (
    symbol: string,
    currentPrice: number,
    shock: boolean = false,
  ): EnsemblePredictionData => ({
    symbol: symbol,
    timestamp: new Date().toISOString(),
    current_price: currentPrice,
    weighted_prediction: shock ? currentPrice * 0.95 : currentPrice * 1.035,
    confidence_score: shock ? 58 : 78,
    direction: shock ? "DOWN" : "UP",
    price_change_percent: shock ? -5.0 : 3.5,
    components: {
      quant_agent: {
        base_forecast: currentPrice * 1.02,
        confidence: 72,
        direction: "UP",
        volatility: 2.5,
        trend_strength: 0.65,
        weight: 0.5,
      },
      topology_agent: {
        risk_adjustment: shock ? 0.88 : 0.97,
        adjusted_price: shock ? currentPrice * 0.97 : currentPrice * 1.01,
        network_risk_penalty: shock ? 0.12 : 0.03,
        cluster_name: "Financial Triad",
        cluster_risk: shock ? "Critical" : "Moderate",
        centrality_score: 0.45,
        contagion_risk: shock ? 0.65 : 0.25,
        neighbor_signals: [
          {
            symbol: "HDFCBANK",
            signal: shock ? "bearish" : "bullish",
            risk_score: 0.4,
          },
          {
            symbol: "ICICIBANK",
            signal: shock ? "bearish" : "bullish",
            risk_score: 0.42,
          },
        ],
        weight: 0.3,
      },
      sentiment_agent: {
        sentiment_multiplier: shock ? 0.92 : 1.05,
        consensus_score: shock ? -0.4 : 0.5,
        sentiment_label: shock ? "Bearish" : "Bullish",
        bull_bear_ratio: shock ? 0.3 : 0.75,
        confidence: 65,
        weight: 0.2,
      },
    },
    comparison: {
      lstm_base: currentPrice * 1.02,
      agentic_adjusted: shock ? currentPrice * 0.95 : currentPrice * 1.035,
      topology_adjustment_pct: shock ? -3.5 : -1.0,
      sentiment_adjustment_pct: shock ? -1.5 : 1.5,
      total_adjustment_pct: shock ? -5.0 : 1.5,
    },
    shock_simulation_active: shock,
    disclaimer: "This is a demo ensemble prediction for offline mode.",
  });

  // Fetch ensemble prediction separately (can be triggered with shock)
  const loadEnsembleData = useCallback(
    async (symbol: string, shock: boolean = false) => {
      setIsEnsembleLoading(true);
      try {
        const ensemble = await fetchEnsemblePrediction(symbol, shock);
        setEnsembleData(ensemble);
      } catch (err) {
        console.warn("Ensemble prediction failed:", err);
        // Use offline data
        if (stockData) {
          setEnsembleData(
            getOfflineEnsembleData(symbol, stockData.currentPrice, shock),
          );
        }
      } finally {
        setIsEnsembleLoading(false);
      }
    },
    [stockData],
  );

  // Fetch all dashboard data
  const loadDashboardData = useCallback(
    async (symbol: string) => {
      setIsLoading(true);
      setError(null);
      setIsOfflineMode(false);

      try {
        // 1. Fetch live stock info
        const stock = await fetchStockData(symbol);
        setStockData(stock);

        // Update chart with new base price (simulation)
        setChartData(generateStockData(stock.currentPrice));

        // 2. Fetch AI prediction (News sentiment is fetched inside the component)
        const ai = await fetchAIPrediction(symbol);
        setAiData(ai);

        // 3. Fetch Ensemble prediction
        try {
          const ensemble = await fetchEnsemblePrediction(symbol, shockActive);
          setEnsembleData(ensemble);
        } catch {
          setEnsembleData(
            getOfflineEnsembleData(symbol, stock.currentPrice, shockActive),
          );
        }
      } catch (err) {
        console.warn(
          "Dashboard data fetch failed (Backend might be offline):",
          err,
        );
        // Fail gracefully to offline mode
        setIsOfflineMode(true);

        const offlineStock = getOfflineStockData(symbol);
        setStockData(offlineStock);
        setChartData(generateStockData(offlineStock.currentPrice));
        setAiData(getOfflineAiData(symbol));
        setEnsembleData(
          getOfflineEnsembleData(
            symbol,
            offlineStock.currentPrice,
            shockActive,
          ),
        );

        // We don't set 'error' state to avoid the red alert
      } finally {
        setIsLoading(false);
      }
    },
    [shockActive],
  );

  // Handle shock simulation toggle
  const handleShockToggle = useCallback(() => {
    const newShockState = !shockActive;
    setShockActive(newShockState);
    // Re-fetch ensemble with new shock state
    loadEnsembleData(selectedStock, newShockState);
  }, [shockActive, selectedStock, loadEnsembleData]);

  // Initial load
  useEffect(() => {
    loadDashboardData(selectedStock);
  }, [selectedStock, loadDashboardData]);

  const handleSearch = (ticker: string) => {
    setSelectedStock(ticker.toUpperCase());
  };

  return (
    <div className="min-h-screen text-zinc-100 p-6 relative">
      {/* Background Gradients (Optional enhancement for depth) */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[2rem] font-bold text-zinc-100 mb-2 tracking-tight">
            Stock Analytics Dashboard
          </h1>
          <p className="text-zinc-400 text-lg">
            Real-time NSE stock analysis with AI predictions
          </p>
        </div>

        {/* Stock Search */}
        <div className="relative z-10">
          <StockInput onSearch={handleSearch} disabled={isLoading} />
        </div>

        {/* Market Context */}
        <MarketContextStrip />

        {/* Offline Mode Indicator */}
        {isOfflineMode && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="size-5 shrink-0" />
            <div className="flex flex-col">
              <p className="text-sm font-medium text-amber-200">
                Live data temporarily unavailable
              </p>
              <p className="text-xs text-amber-500/80">
                System has switched to offline demo mode. Showing simulated
                data.
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay or Content */}
        {isLoading && !stockData ? (
          <div className="h-[400px] flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <Loader2 className="size-8 text-[#5B8DFF] animate-spin mb-4" />
            <p className="text-zinc-500">Fetching live market data...</p>
          </div>
        ) : (
          stockData && (
            <>
              {/* Current Stock Info */}
              <div className="border-l-[6px] border-l-[#3A6FF8] bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 rounded-r-xl shadow-lg shadow-blue-900/5 flex items-center justify-between border-y border-r border-y-[#3A6FF8]/10 border-r-[#3A6FF8]/10">
                <div>
                  <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider mb-1">
                    Currently Viewing
                  </p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold text-zinc-100">
                      {stockData.symbol}
                    </p>
                    <p className="text-sm text-zinc-500 hidden md:block">
                      {stockData.companyName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="p-2 rounded-lg bg-[#3A6FF8]/10 border border-[#3A6FF8]/20 inline-block mb-1">
                    <span className="text-xs font-mono text-[#5B8DFF]">
                      NSE:EQ
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {stockData.marketState}
                  </p>
                </div>
              </div>

              {/* Stock Metrics */}
              <StockMetrics
                currentPrice={stockData.currentPrice}
                change={stockData.change}
                changePercent={stockData.changePercent}
                volume={stockData.volumeFormatted}
                marketCap={stockData.marketCapFormatted}
              />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Row: AI Prediction & Chart (Chart takes more space) */}

                {/* Left: AI Prediction Card (High Priority Signal) */}
                <div className="lg:col-span-1 space-y-6">
                  <AIPredictionCard data={aiData} isLoading={isLoading} />

                  {/* Visual Disclaimer (New) */}
                  <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/30 text-center">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      <span className="text-[#3A6FF8] font-medium">
                        Demo Mode:
                      </span>{" "}
                      Charts and metrics are simulated for demonstration.
                      Prediction confidence is illustrative.
                    </p>
                  </div>
                </div>

                {/* Right: Chart (Primary Visualization) */}
                <div className="lg:col-span-2">
                  <StockChart data={chartData} stockName={stockData.symbol} />
                </div>

                {/* Bottom Row: Secondary Analysis (Technical + News) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  {/* Technical Sentiment (Secondary) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pl-1">
                      Technical Signal
                    </h3>
                    <div className="bg-[rgba(15,23,42,0.3)] p-1 rounded-2xl border border-white/5 h-full">
                      <SentimentIndicator
                        sentiment={
                          aiData?.prediction.direction === "UP"
                            ? "positive"
                            : aiData?.prediction.direction === "DOWN"
                              ? "negative"
                              : "neutral"
                        }
                      />
                      <div className="p-4 text-xs text-zinc-500">
                        Technical indicators suggest a momentum shift consistent
                        with the AI prediction model.
                      </div>
                    </div>
                  </div>

                  {/* News Sentiment (Contextual/Low Weight) */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider pl-1 flex justify-between items-center">
                      <span>Market News Context</span>
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                        Low Weight Signal
                      </span>
                    </h3>
                    <NewsSentiment symbol={selectedStock} />
                  </div>
                </div>

                {/* Deep Dive Analysis Section - Agentic Ensemble */}
                <div className="lg:col-span-3 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">
                        Deep Dive Analysis
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Multi-Agent Ensemble Prediction System
                      </p>
                    </div>
                    <button
                      onClick={handleShockToggle}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                        shockActive
                          ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                          : "bg-[#3A6FF8]/10 border-[#3A6FF8]/50 text-[#5B8DFF] hover:bg-[#3A6FF8]/20"
                      }`}
                    >
                      <Zap
                        className={`size-4 ${shockActive ? "animate-pulse" : ""}`}
                      />
                      {shockActive
                        ? "Stop Simulation"
                        : "Simulate Market Shock"}
                    </button>
                  </div>
                  <PredictionEnsembleCard
                    data={ensembleData}
                    isLoading={isEnsembleLoading}
                    shockActive={shockActive}
                    onRefresh={() =>
                      loadEnsembleData(selectedStock, shockActive)
                    }
                  />
                </div>
              </div>
            </>
          )
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[rgba(100,150,255,0.1)]">
          <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest">
            QuantPulse India • AI-Powered Analytics • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
