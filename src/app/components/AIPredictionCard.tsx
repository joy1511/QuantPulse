import { Card } from '@/app/components/ui/card';
import { ArrowUp, ArrowDown, ArrowRight, TrendingUp } from 'lucide-react';
import { Progress } from '@/app/components/ui/progress';

interface AIPredictionCardProps {
  prediction: 'UP' | 'DOWN' | 'SIDEWAYS';
  confidence: number;
}

export function AIPredictionCard({ prediction, confidence }: AIPredictionCardProps) {
  const getPredictionConfig = () => {
    switch (prediction) {
      case 'UP':
        return {
          icon: ArrowUp,
          label: 'UP',
          description: 'Bullish Trend',
          color: 'text-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30'
        };
      case 'DOWN':
        return {
          icon: ArrowDown,
          label: 'DOWN',
          description: 'Bearish Trend',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30'
        };
      case 'SIDEWAYS':
        return {
          icon: ArrowRight,
          label: 'SIDEWAYS',
          description: 'Consolidation',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30'
        };
    }
  };

  const config = getPredictionConfig();
  const Icon = config.icon;

  return (
    <Card className={`p-6 border-2 ${config.borderColor}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="size-5 text-[#5B8DFF]" />
        <h3 className="text-lg text-zinc-100">AI Prediction</h3>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className={`p-4 rounded-xl ${config.bgColor}`}>
          <Icon className={`size-8 ${config.color}`} />
        </div>
        <div>
          <p className={`text-3xl ${config.color}`}>{config.label}</p>
          <p className="text-sm text-zinc-400">{config.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Confidence Level</span>
          <span className="text-lg text-zinc-100">{confidence}%</span>
        </div>
        <Progress value={confidence} className="h-2" />
      </div>

      <div className="mt-4 pt-4 border-t border-[rgba(100,150,255,0.1)]">
        <p className="text-xs text-zinc-500">
          Powered by ML algorithms analyzing technical indicators and market patterns
        </p>
      </div>
    </Card>
  );
}
