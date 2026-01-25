import { useState } from 'react';
import { StockInput } from '@/app/components/StockInput';
import { StockChart } from '@/app/components/StockChart';
import { SentimentIndicator } from '@/app/components/SentimentIndicator';
import { AIPredictionCard } from '@/app/components/AIPredictionCard';
import { StockMetrics } from '@/app/components/StockMetrics';

// Mock data generator for different stocks
const generateStockData = (ticker: string) => {
  const basePrice = {
    'RELIANCE': 2450,
    'TCS': 3850,
    'INFY': 1620,
    'HDFCBANK': 1680,
    'ICICIBANK': 1150,
  }[ticker as keyof typeof basePrice] || 1000;

  const data = [];
  let price = basePrice;

  for (let i = 0; i < 24; i++) {
    const change = (Math.random() - 0.5) * 40;
    price = price + change;
    data.push({
      time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      price: Math.round(price * 100) / 100
    });
  }

  return data;
};

const getStockInfo = (ticker: string) => {
  const stocks = {
    'RELIANCE': {
      sentiment: 'positive' as const,
      prediction: 'UP' as const,
      confidence: 78,
      currentPrice: 2485.30,
      change: 32.50,
      changePercent: 1.33,
      volume: '12.5M',
      marketCap: '₹16.8L Cr'
    },
    'TCS': {
      sentiment: 'positive' as const,
      prediction: 'UP' as const,
      confidence: 82,
      currentPrice: 3892.15,
      change: 45.20,
      changePercent: 1.17,
      volume: '8.2M',
      marketCap: '₹14.2L Cr'
    },
    'INFY': {
      sentiment: 'neutral' as const,
      prediction: 'SIDEWAYS' as const,
      confidence: 65,
      currentPrice: 1628.80,
      change: -8.50,
      changePercent: -0.52,
      volume: '15.8M',
      marketCap: '₹6.8L Cr'
    },
    'HDFCBANK': {
      sentiment: 'negative' as const,
      prediction: 'DOWN' as const,
      confidence: 72,
      currentPrice: 1675.45,
      change: -22.30,
      changePercent: -1.31,
      volume: '20.5M',
      marketCap: '₹12.7L Cr'
    },
    'ICICIBANK': {
      sentiment: 'positive' as const,
      prediction: 'UP' as const,
      confidence: 75,
      currentPrice: 1158.60,
      change: 18.75,
      changePercent: 1.64,
      volume: '18.3M',
      marketCap: '₹8.2L Cr'
    }
  };

  return stocks[ticker as keyof typeof stocks] || {
    sentiment: 'neutral' as const,
    prediction: 'SIDEWAYS' as const,
    confidence: 60,
    currentPrice: 1000.00,
    change: 0,
    changePercent: 0,
    volume: '10.0M',
    marketCap: '₹5.0L Cr'
  };
};

export function DashboardPage() {
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [chartData, setChartData] = useState(generateStockData('RELIANCE'));
  const [stockInfo, setStockInfo] = useState(getStockInfo('RELIANCE'));

  const handleSearch = (ticker: string) => {
    setSelectedStock(ticker);
    setChartData(generateStockData(ticker));
    setStockInfo(getStockInfo(ticker));
  };

  return (
    <div className="min-h-screen text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-zinc-100 mb-2">Stock Analytics Dashboard</h1>
          <p className="text-zinc-400">Real-time NSE stock analysis with AI predictions</p>
        </div>

        {/* Stock Search */}
        <StockInput onSearch={handleSearch} />

        {/* Current Stock Info */}
        <div className="border-l-4 border-[#3A6FF8] bg-[rgba(15,23,42,0.5)] backdrop-blur-sm p-4 rounded-r-lg">
          <p className="text-sm text-zinc-400">Currently Viewing</p>
          <p className="text-2xl text-zinc-100">{selectedStock}</p>
        </div>

        {/* Stock Metrics */}
        <StockMetrics
          currentPrice={stockInfo.currentPrice}
          change={stockInfo.change}
          changePercent={stockInfo.changePercent}
          volume={stockInfo.volume}
          marketCap={stockInfo.marketCap}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <StockChart data={chartData} stockName={selectedStock} />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <SentimentIndicator sentiment={stockInfo.sentiment} />
            <AIPredictionCard
              prediction={stockInfo.prediction}
              confidence={stockInfo.confidence}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[rgba(100,150,255,0.1)]">
          <p className="text-center text-sm text-zinc-500">
            Market data is simulated for demonstration purposes. Last updated: {new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
