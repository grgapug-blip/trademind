import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import type { Trade } from '@/types';

interface AnalyticsProps {
  trades: Trade[];
  disciplineScore: number;
}

// Generate mock historical data for demonstration
const generateMockData = () => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      trades: Math.floor(Math.random() * 6),
      pnl: (Math.random() - 0.4) * 500,
    });
  }
  return data;
};

const mockHistoryData = generateMockData();

export function Analytics({ trades }: AnalyticsProps) {
  // Prepare P&L vs Emotional State data
  const emotionalPnlData = useMemo(() => {
    return trades
      .filter((t) => t.status === 'closed' && t.pnl !== null)
      .map((t) => ({
        emotionalState: t.emotionalStateBefore,
        pnl: t.pnl!,
        symbol: t.symbol,
      }));
  }, [trades]);

  // Prepare trading frequency by hour
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 9 }, (_, i) => i + 9); // 9 AM to 5 PM
    return hours.map((hour) => {
      const count = trades.filter((t) => {
        const tradeHour = new Date(t.timestamp).getHours();
        return tradeHour === hour;
      }).length;
      return {
        hour: `${hour}:00`,
        trades: count,
      };
    });
  }, [trades]);

  // Win/Loss stats
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === 'closed');
    const winners = closed.filter((t) => t.pnl !== null && t.pnl > 0);
    const losers = closed.filter((t) => t.pnl !== null && t.pnl < 0);
    const totalPnl = closed.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgWin = winners.length > 0 ? winners.reduce((sum, t) => sum + (t.pnl || 0), 0) / winners.length : 0;
    const avgLoss = losers.length > 0 ? losers.reduce((sum, t) => sum + (t.pnl || 0), 0) / losers.length : 0;

    return {
      total: closed.length,
      winners: winners.length,
      losers: losers.length,
      winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
      totalPnl,
      avgWin,
      avgLoss,
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <p className="label-small">Win Rate</p>
          </div>
          <p className="text-2xl font-semibold font-mono text-white">{stats.winRate.toFixed(1)}%</p>
          <p className="text-xs text-[#666] mt-1">{stats.winners}W / {stats.losers}L</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="label-small">Total P&L</p>
          </div>
          <p className={`text-2xl font-semibold font-mono ${stats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)}
          </p>
          <p className="text-xs text-[#666] mt-1">From {stats.total} trades</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="label-small">Avg Win</p>
          </div>
          <p className="text-2xl font-semibold font-mono text-green-500">+${stats.avgWin.toFixed(2)}</p>
          <p className="text-xs text-[#666] mt-1">Per winning trade</p>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="label-small">Avg Loss</p>
          </div>
          <p className="text-2xl font-semibold font-mono text-red-500">${stats.avgLoss.toFixed(2)}</p>
          <p className="text-xs text-[#666] mt-1">Per losing trade</p>
        </div>
      </div>

      {/* Discipline Score Over Time */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title mb-1">Discipline Score Trend</h3>
            <p className="text-sm text-[#b0b0b0]">Your discipline score over the last 30 days</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111] rounded-lg">
            <Calendar className="w-4 h-4 text-[#b0b0b0]" />
            <span className="text-sm text-[#b0b0b0]">30 Days</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHistoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#666" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1d1d1d',
                  border: '1px solid #aeaeae33',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#b0b0b0' }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P&L vs Emotional State */}
      <div className="dashboard-card">
        <div className="mb-4">
          <h3 className="section-title mb-1">P&L vs Emotional State</h3>
          <p className="text-sm text-[#b0b0b0]">See how your emotions affect your trading results</p>
        </div>
        <div className="h-64">
          {emotionalPnlData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  type="number"
                  dataKey="emotionalState"
                  name="Emotional State"
                  domain={[1, 10]}
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  label={{ value: 'Emotional State (1-10)', position: 'bottom', fill: '#666' }}
                />
                <YAxis
                  type="number"
                  dataKey="pnl"
                  name="P&L"
                  stroke="#666"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1d1d1d] border border-[#aeaeae33] rounded p-3 text-sm">
                          <p className="text-[#b0b0b0]">{data.symbol}</p>
                          <p className="text-white">Emotional State: {data.emotionalState}</p>
                          <p className={data.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                            P&L: {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={emotionalPnlData}>
                  {emotionalPnlData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#666]">
              <p>Not enough data. Close some trades to see the correlation.</p>
            </div>
          )}
        </div>
        <div className="mt-4 p-3 bg-[#111] rounded-lg">
          <p className="text-sm text-[#b0b0b0]">
            <span className="text-white font-medium">Insight:</span> Traders typically perform better when their emotional state is 7 or higher. 
            Consider taking breaks when your rating drops below 6.
          </p>
        </div>
      </div>

      {/* Trading Frequency by Hour */}
      <div className="dashboard-card">
        <div className="mb-4">
          <h3 className="section-title mb-1">Trading Frequency by Hour</h3>
          <p className="text-sm text-[#b0b0b0]">When you trade most during the day</p>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="hour" stroke="#666" fontSize={12} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1d1d1d',
                  border: '1px solid #aeaeae33',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#b0b0b0' }}
              />
              <Bar dataKey="trades" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {hourlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.trades > 2 ? '#ef4444' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-3 bg-[#111] rounded-lg">
          <p className="text-sm text-[#b0b0b0]">
            <span className="text-white font-medium">Tip:</span> Red bars indicate hours with more than 2 trades. 
            This may indicate overtrading during those periods.
          </p>
        </div>
      </div>
    </div>
  );
}
