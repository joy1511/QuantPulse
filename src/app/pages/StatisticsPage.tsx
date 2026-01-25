import { Card } from '@/app/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Activity, Users, DollarSign, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export function StatisticsPage() {
  // Mock data for charts
  const sectorPerformance = [
    { name: 'IT', value: 24 },
    { name: 'Banking', value: 18 },
    { name: 'Auto', value: 15 },
    { name: 'Pharma', value: 13 },
    { name: 'Energy', value: 12 },
    { name: 'FMCG', value: 10 },
    { name: 'Others', value: 8 },
  ];

  const predictionAccuracy = [
    { month: 'Jan', accuracy: 78 },
    { month: 'Feb', accuracy: 82 },
    { month: 'Mar', accuracy: 80 },
    { month: 'Apr', accuracy: 85 },
    { month: 'May', accuracy: 83 },
    { month: 'Jun', accuracy: 87 },
  ];

  const topGainers = [
    { name: 'TCS', gain: 5.2, color: '#10b981' },
    { name: 'INFY', gain: 4.8, color: '#10b981' },
    { name: 'RELIANCE', gain: 3.5, color: '#10b981' },
    { name: 'HDFC', gain: 2.9, color: '#10b981' },
  ];

  const topLosers = [
    { name: 'BANKEX', loss: -3.2, color: '#ef4444' },
    { name: 'ENERGY', loss: -2.8, color: '#ef4444' },
    { name: 'METAL', loss: -2.1, color: '#ef4444' },
    { name: 'REALTY', loss: -1.5, color: '#ef4444' },
  ];

  const marketOverview = [
    { icon: TrendingUp, label: 'Total Predictions', value: '15,234', change: '+12.5%', positive: true },
    { icon: Target, label: 'Accurate Predictions', value: '12,945', change: '+8.3%', positive: true },
    { icon: Users, label: 'Active Users', value: '8,456', change: '+24.1%', positive: true },
    { icon: Activity, label: 'Daily Transactions', value: '45.2K', change: '-3.2%', positive: false },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'];

  return (
    <div className="min-h-screen text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-zinc-100 mb-2">Statistics & Insights</h1>
          <p className="text-zinc-400">Comprehensive market analytics and performance metrics</p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketOverview.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[rgba(58,111,248,0.1)]">
                    <Icon className="size-5 text-[#5B8DFF]" />
                  </div>
                  <p className="text-sm text-zinc-400">{item.label}</p>
                </div>
                <p className="text-3xl text-zinc-100 mb-2">{item.value}</p>
                <div className={`flex items-center gap-1 text-sm ${item.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.positive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  <span>{item.change}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Accuracy Trend */}
          <Card className="p-6">
            <h3 className="text-lg mb-4 text-zinc-100">Prediction Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={predictionAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" domain={[70, 90]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Sector Performance */}
          <Card className="p-6">
            <h3 className="text-lg mb-4 text-zinc-100">Sector Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sectorPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #3f3f46',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Gainers */}
          <Card className="p-6">
            <h3 className="text-lg mb-4 text-zinc-100 flex items-center gap-2">
              <TrendingUp className="size-5 text-emerald-500" />
              Top Gainers
            </h3>
            <div className="space-y-4">
              {topGainers.map((stock, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-zinc-300">{stock.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(stock.gain / 5.2) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-emerald-500 text-sm w-12 text-right">+{stock.gain}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Losers */}
          <Card className="p-6">
            <h3 className="text-lg mb-4 text-zinc-100 flex items-center gap-2">
              <TrendingDown className="size-5 text-red-500" />
              Top Losers
            </h3>
            <div className="space-y-4">
              {topLosers.map((stock, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-zinc-300">{stock.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(Math.abs(stock.loss) / 3.2) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-red-500 text-sm w-12 text-right">{stock.loss}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card className="p-6">
          <h3 className="text-lg mb-4 text-zinc-100">Platform Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-[#3A6FF8] pl-4">
              <p className="text-sm text-zinc-400 mb-1">Overall Accuracy</p>
              <p className="text-2xl text-zinc-100">85.2%</p>
              <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <p className="text-sm text-zinc-400 mb-1">Successful Predictions</p>
              <p className="text-2xl text-zinc-100">12,945</p>
              <p className="text-xs text-zinc-500 mt-1">Out of 15,234 total</p>
            </div>
            <div className="border-l-4 border-amber-600 pl-4">
              <p className="text-sm text-zinc-400 mb-1">Average Confidence</p>
              <p className="text-2xl text-zinc-100">76.8%</p>
              <p className="text-xs text-zinc-500 mt-1">Across all predictions</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="pt-6 border-t border-[rgba(100,150,255,0.1)]">
          <p className="text-center text-sm text-zinc-500">
            Statistics updated in real-time. Data shown is simulated for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}
