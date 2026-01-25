import { Card } from '@/app/components/ui/card';
import { ArrowUp, ArrowDown, Activity, DollarSign } from 'lucide-react';

interface StockMetricsProps {
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
}

export function StockMetrics({ currentPrice, change, changePercent, volume, marketCap }: StockMetricsProps) {
  const isPositive = change >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="size-4 text-zinc-400" />
          <p className="text-sm text-zinc-400">Current Price</p>
        </div>
        <p className="text-2xl text-zinc-100">₹{currentPrice.toFixed(2)}</p>
        <div className={`flex items-center gap-1 mt-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          <span>₹{Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)</span>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="size-4 text-zinc-400" />
          <p className="text-sm text-zinc-400">Day Change</p>
        </div>
        <p className={`text-2xl ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </p>
        <p className="text-sm text-zinc-500 mt-1">
          {isPositive ? 'Gaining' : 'Losing'}
        </p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="size-4 text-zinc-400" />
          <p className="text-sm text-zinc-400">Volume</p>
        </div>
        <p className="text-2xl text-zinc-100">{volume}</p>
        <p className="text-sm text-zinc-500 mt-1">shares traded</p>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="size-4 text-zinc-400" />
          <p className="text-sm text-zinc-400">Market Cap</p>
        </div>
        <p className="text-2xl text-zinc-100">{marketCap}</p>
        <p className="text-sm text-zinc-500 mt-1">in crores</p>
      </Card>
    </div>
  );
}
