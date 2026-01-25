import { Card } from '@/app/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SentimentIndicatorProps {
  sentiment: 'positive' | 'neutral' | 'negative';
}

export function SentimentIndicator({ sentiment }: SentimentIndicatorProps) {
  const getSentimentConfig = () => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: TrendingUp,
          label: 'Positive',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20'
        };
      case 'negative':
        return {
          icon: TrendingDown,
          label: 'Negative',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20'
        };
      case 'neutral':
        return {
          icon: Minus,
          label: 'Neutral',
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20'
        };
    }
  };

  const config = getSentimentConfig();
  const Icon = config.icon;

  return (
    <Card className={`p-6 ${config.borderColor}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${config.bgColor}`}>
          <Icon className={`size-6 ${config.color}`} />
        </div>
        <div>
          <p className="text-sm text-zinc-400">Market Sentiment</p>
          <p className={`text-xl ${config.color}`}>{config.label}</p>
        </div>
      </div>
    </Card>
  );
}
