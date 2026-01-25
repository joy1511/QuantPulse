import { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, TrendingUp } from 'lucide-react';

interface StockInputProps {
  onSearch: (ticker: string) => void;
}

export function StockInput({ onSearch }: StockInputProps) {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.toUpperCase());
    }
  };

  const popularStocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
          <Input
            type="text"
            placeholder="Enter NSE stock ticker (e.g., RELIANCE, TCS)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          <TrendingUp className="size-4 mr-2" />
          Analyze
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Popular:</span>
        {popularStocks.map((stock) => (
          <button
            key={stock}
            onClick={() => {
              setTicker(stock);
              onSearch(stock);
            }}
            className="px-3 py-1 text-sm rounded-md bg-[rgba(15,23,42,0.6)] hover:bg-[rgba(58,111,248,0.15)] border border-[rgba(100,150,255,0.12)] text-zinc-300 transition-colors backdrop-blur-sm"
          >
            {stock}
          </button>
        ))}
      </div>
    </div>
  );
}
