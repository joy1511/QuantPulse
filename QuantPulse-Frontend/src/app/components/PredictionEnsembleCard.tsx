/**
 * PredictionEnsembleCard Component
 *
 * Displays the Agentic Ensemble prediction that fuses:
 * 1. Quant Agent (LSTM/GNN base forecast)
 * 2. Topology Agent (Graph Laplacian risk analysis)
 * 3. Sentiment Agent (News/sentiment consensus)
 *
 * Features:
 * - Gauge Chart for Confidence Score
 * - Comparison Chart: LSTM Base vs Agentic Adjusted
 * - Real-time updates based on selected ticker
 * - Market shock simulation integration
 */

import { useState, useEffect, useMemo } from "react";
import { Card } from "./ui/card";
import {
  Brain,
  Network,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// Types
export interface EnsemblePredictionData {
  symbol: string;
  timestamp: string;
  current_price: number;
  weighted_prediction: number;
  confidence_score: number;
  direction: "UP" | "DOWN" | "SIDEWAYS";
  price_change_percent: number;
  components: {
    quant_agent: {
      base_forecast: number;
      confidence: number;
      direction: string;
      volatility: number;
      trend_strength: number;
      weight: number;
    };
    topology_agent: {
      risk_adjustment: number;
      adjusted_price: number;
      network_risk_penalty: number;
      cluster_name: string;
      cluster_risk: string;
      centrality_score: number;
      contagion_risk: number;
      neighbor_signals: Array<{
        symbol: string;
        signal: string;
        risk_score: number;
      }>;
      weight: number;
    };
    sentiment_agent: {
      sentiment_multiplier: number;
      consensus_score: number;
      sentiment_label: string;
      bull_bear_ratio: number;
      confidence: number;
      weight: number;
    };
  };
  comparison: {
    lstm_base: number;
    agentic_adjusted: number;
    topology_adjustment_pct: number;
    sentiment_adjustment_pct: number;
    total_adjustment_pct: number;
  };
  shock_simulation_active: boolean;
  disclaimer: string;
}

interface PredictionEnsembleCardProps {
  data: EnsemblePredictionData | null;
  isLoading?: boolean;
  error?: string | null;
  shockActive?: boolean;
  onRefresh?: () => void;
}

// Gauge Chart Component
function ConfidenceGauge({
  value,
  size = 180,
}: {
  value: number;
  size?: number;
}) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const angle = (percentage / 100) * 180;

  // Calculate gauge color based on confidence
  const getGaugeColor = (pct: number) => {
    if (pct >= 70) return "#10B981"; // Emerald
    if (pct >= 50) return "#3B82F6"; // Blue
    if (pct >= 30) return "#F59E0B"; // Amber
    return "#EF4444"; // Red
  };

  const color = getGaugeColor(percentage);

  // Create arc path for gauge
  const radius = size / 2 - 15;
  const centerX = size / 2;
  const centerY = size / 2;

  const startAngle = 180;
  const endAngle = 180 - angle;

  const startRadians = (startAngle * Math.PI) / 180;
  const endRadians = (endAngle * Math.PI) / 180;

  const startX = centerX + radius * Math.cos(startRadians);
  const startY = centerY - radius * Math.sin(startRadians);
  const endX = centerX + radius * Math.cos(endRadians);
  const endY = centerY - radius * Math.sin(endRadians);

  const largeArcFlag = angle > 180 ? 1 : 0;

  const pathBg = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY}`;
  const pathValue = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
      >
        {/* Background Arc */}
        <path
          d={pathBg}
          fill="none"
          stroke="rgba(100, 150, 255, 0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <path
          d={pathValue}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${color}40)`,
            transition: "all 0.5s ease-out",
          }}
        />
        {/* Center Text */}
        <text
          x={centerX}
          y={centerY - 5}
          textAnchor="middle"
          className="fill-zinc-100 text-3xl font-bold"
          style={{ fontSize: "28px" }}
        >
          {percentage.toFixed(0)}%
        </text>
        <text
          x={centerX}
          y={centerY + 18}
          textAnchor="middle"
          className="fill-zinc-500 text-xs"
          style={{ fontSize: "11px" }}
        >
          Confidence
        </text>
      </svg>
      {/* Min/Max Labels */}
      <div className="absolute bottom-0 left-2 text-[10px] text-zinc-600">
        0
      </div>
      <div className="absolute bottom-0 right-2 text-[10px] text-zinc-600">
        100
      </div>
    </div>
  );
}

// Agent Contribution Card
function AgentCard({
  icon: Icon,
  title,
  value,
  subValue,
  color,
  weight,
}: {
  icon: any;
  title: string;
  value: string;
  subValue?: string;
  color: string;
  weight: number;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${color} bg-opacity-10 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 opacity-70" />
        <span className="text-xs font-medium text-zinc-300">{title}</span>
        <span className="ml-auto text-[10px] text-zinc-500">
          {(weight * 100).toFixed(0)}%
        </span>
      </div>
      <div className="text-lg font-semibold text-zinc-100">{value}</div>
      {subValue && <div className="text-xs text-zinc-500 mt-1">{subValue}</div>}
    </div>
  );
}

export function PredictionEnsembleCard({
  data,
  isLoading = false,
  error = null,
  shockActive = false,
  onRefresh,
}: PredictionEnsembleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "LSTM Base",
        price: data.comparison.lstm_base,
        fill: "#3B82F6",
      },
      {
        name: "Agentic Adjusted",
        price: data.comparison.agentic_adjusted,
        fill:
          data.direction === "UP"
            ? "#10B981"
            : data.direction === "DOWN"
              ? "#EF4444"
              : "#F59E0B",
      },
    ];
  }, [data]);

  // Direction config type
  type DirectionConfig = {
    icon: typeof TrendingUp | typeof TrendingDown | typeof Activity;
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
  };

  const getDirectionConfig = (direction: string): DirectionConfig => {
    switch (direction) {
      case "UP":
        return {
          icon: TrendingUp,
          label: "Bullish",
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
        };
      case "DOWN":
        return {
          icon: TrendingDown,
          label: "Bearish",
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
        };
      default:
        return {
          icon: Activity,
          label: "Neutral",
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
        };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Brain className="size-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Agentic Ensemble
            </h3>
            <p className="text-xs text-zinc-500">
              Multi-Agent Prediction System
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-10 text-blue-500 animate-spin mb-4" />
          <p className="text-sm text-zinc-400">Orchestrating AI agents...</p>
          <p className="text-xs text-zinc-600 mt-1">
            Quant • Topology • Sentiment
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card variant="elevated" className="p-6 border-l-4 border-red-500/40">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="size-5 text-red-400" />
          <h3 className="text-lg font-semibold text-zinc-100">
            Ensemble Error
          </h3>
        </div>
        <p className="text-sm text-red-400/80">{error}</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 text-sm bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Retry
          </button>
        )}
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card variant="elevated" className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="size-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-zinc-100">
            Agentic Ensemble
          </h3>
        </div>
        <p className="text-sm text-zinc-400">
          Select a stock to see ensemble prediction
        </p>
      </Card>
    );
  }

  const directionConfig = getDirectionConfig(data.direction);
  const DirectionIcon = directionConfig.icon;

  return (
    <Card
      variant="elevated"
      className={`p-6 relative overflow-hidden ${shockActive || data.shock_simulation_active ? "border-red-500/30" : ""}`}
    >
      {/* Shock Indicator */}
      {(shockActive || data.shock_simulation_active) && (
        <div className="absolute top-0 right-0 p-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-md animate-pulse">
            <Zap className="size-3 text-red-400" />
            <span className="text-[10px] text-red-400 font-medium">
              SHOCK MODE
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 border border-white/5">
          <Brain className="size-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">
            Agentic Ensemble
          </h3>
          <p className="text-xs text-zinc-500">
            Multi-Agent Weighted Prediction
          </p>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left: Direction & Price */}
        <div className="space-y-4">
          <div
            className={`flex items-center gap-3 p-4 rounded-xl ${directionConfig.bgColor} ${directionConfig.borderColor} border`}
          >
            <div className={`p-3 rounded-lg ${directionConfig.bgColor}`}>
              <DirectionIcon className={`size-8 ${directionConfig.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${directionConfig.color}`}>
                {data.direction}
              </p>
              <p className="text-sm text-zinc-400">{directionConfig.label}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
            <p className="text-xs text-zinc-500 mb-1">Weighted Prediction</p>
            <p className="text-2xl font-bold text-zinc-100">
              ₹
              {data.weighted_prediction.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
            <p
              className={`text-sm mt-1 ${data.price_change_percent >= 0 ? "text-emerald-400" : "text-red-400"}`}
            >
              {data.price_change_percent >= 0 ? "+" : ""}
              {data.price_change_percent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Right: Confidence Gauge */}
        <div className="flex flex-col items-center justify-center">
          <ConfidenceGauge value={data.confidence_score} size={160} />
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-zinc-400">
            LSTM Base vs Agentic Adjusted
          </h4>
          <span className="text-xs text-zinc-600">
            {data.comparison.total_adjustment_pct >= 0 ? "+" : ""}
            {data.comparison.total_adjustment_pct.toFixed(2)}% adjustment
          </span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} layout="vertical" barGap={8}>
              <XAxis
                type="number"
                domain={["dataMin - 50", "dataMax + 50"]}
                tickFormatter={(v) => `₹${v}`}
                stroke="#52525b"
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#52525b"
                fontSize={11}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(100, 150, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#fafafa",
                  backdropFilter: "blur(8px)",
                }}
                formatter={(value: number) => [
                  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
                  "Price",
                ]}
              />
              <Bar dataKey="price" radius={[4, 4, 4, 4]} barSize={20}>
                {comparisonData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Contributions */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <AgentCard
          icon={Brain}
          title="Quant Agent"
          value={`₹${data.components.quant_agent.base_forecast.toFixed(0)}`}
          subValue={`${data.components.quant_agent.confidence.toFixed(0)}% conf.`}
          color="border-blue-500/30 bg-blue-500"
          weight={data.components.quant_agent.weight}
        />
        <AgentCard
          icon={Network}
          title="Topology"
          value={`${((1 - data.components.topology_agent.risk_adjustment) * 100).toFixed(1)}%`}
          subValue={data.components.topology_agent.cluster_name}
          color={
            data.components.topology_agent.cluster_risk === "Critical"
              ? "border-red-500/30 bg-red-500"
              : "border-purple-500/30 bg-purple-500"
          }
          weight={data.components.topology_agent.weight}
        />
        <AgentCard
          icon={MessageSquare}
          title="Sentiment"
          value={`${(data.components.sentiment_agent.sentiment_multiplier * 100 - 100).toFixed(1)}%`}
          subValue={data.components.sentiment_agent.sentiment_label}
          color={
            data.components.sentiment_agent.consensus_score > 0
              ? "border-emerald-500/30 bg-emerald-500"
              : data.components.sentiment_agent.consensus_score < 0
                ? "border-red-500/30 bg-red-500"
                : "border-amber-500/30 bg-amber-500"
          }
          weight={data.components.sentiment_agent.weight}
        />
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-xs text-zinc-500 hover:text-blue-400 transition-colors py-2"
      >
        <span className="flex items-center gap-1.5">
          <Info className="size-3.5" />
          Agent Details & Topology Analysis
        </span>
        {isExpanded ? (
          <ChevronUp className="size-3.5" />
        ) : (
          <ChevronDown className="size-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/40 space-y-4">
          {/* Topology Details */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 mb-2">
              Network Topology
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-zinc-800/30 rounded">
                <span className="text-zinc-500">Cluster:</span>
                <span
                  className={`ml-2 ${data.components.topology_agent.cluster_risk === "Critical" ? "text-red-400" : "text-zinc-300"}`}
                >
                  {data.components.topology_agent.cluster_name}
                </span>
              </div>
              <div className="p-2 bg-zinc-800/30 rounded">
                <span className="text-zinc-500">Risk Level:</span>
                <span
                  className={`ml-2 ${data.components.topology_agent.cluster_risk === "Critical" ? "text-red-400" : data.components.topology_agent.cluster_risk === "High" ? "text-amber-400" : "text-emerald-400"}`}
                >
                  {data.components.topology_agent.cluster_risk}
                </span>
              </div>
              <div className="p-2 bg-zinc-800/30 rounded">
                <span className="text-zinc-500">Centrality:</span>
                <span className="ml-2 text-zinc-300">
                  {(
                    data.components.topology_agent.centrality_score * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="p-2 bg-zinc-800/30 rounded">
                <span className="text-zinc-500">Contagion Risk:</span>
                <span
                  className={`ml-2 ${data.components.topology_agent.contagion_risk > 0.5 ? "text-red-400" : "text-zinc-300"}`}
                >
                  {(
                    data.components.topology_agent.contagion_risk * 100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Neighbor Signals */}
          {data.components.topology_agent.neighbor_signals.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-zinc-400 mb-2">
                Connected Nodes
              </h5>
              <div className="flex flex-wrap gap-2">
                {data.components.topology_agent.neighbor_signals.map(
                  (neighbor, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded text-xs ${
                        neighbor.signal === "bullish"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {neighbor.symbol}: {neighbor.signal}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Adjustment Breakdown */}
          <div>
            <h5 className="text-xs font-medium text-zinc-400 mb-2">
              Price Adjustment Breakdown
            </h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Topology Adjustment:</span>
                <span
                  className={
                    data.comparison.topology_adjustment_pct < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                >
                  {data.comparison.topology_adjustment_pct >= 0 ? "+" : ""}
                  {data.comparison.topology_adjustment_pct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Sentiment Adjustment:</span>
                <span
                  className={
                    data.comparison.sentiment_adjustment_pct < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                >
                  {data.comparison.sentiment_adjustment_pct >= 0 ? "+" : ""}
                  {data.comparison.sentiment_adjustment_pct.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-zinc-300 font-medium pt-1 border-t border-zinc-700/50">
                <span>Total Adjustment:</span>
                <span
                  className={
                    data.comparison.total_adjustment_pct < 0
                      ? "text-red-400"
                      : "text-emerald-400"
                  }
                >
                  {data.comparison.total_adjustment_pct >= 0 ? "+" : ""}
                  {data.comparison.total_adjustment_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <p className="text-[10px] text-zinc-600 leading-relaxed">
          {data.disclaimer}
        </p>
      </div>
    </Card>
  );
}

export default PredictionEnsembleCard;
