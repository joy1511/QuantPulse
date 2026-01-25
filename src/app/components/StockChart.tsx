import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/app/components/ui/card';

interface StockChartProps {
  data: Array<{ time: string; price: number }>;
  stockName: string;
}

export function StockChart({ data, stockName }: StockChartProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg mb-4 text-zinc-100">Price Chart - {stockName}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,150,255,0.1)" />
          <XAxis
            dataKey="time"
            stroke="#71717a"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#71717a"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(100, 150, 255, 0.2)',
              borderRadius: '8px',
              color: '#fafafa',
              backdropFilter: 'blur(8px)'
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#5B8DFF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
