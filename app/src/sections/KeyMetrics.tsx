import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Flame, Activity, AlertCircle } from 'lucide-react';

interface KeyMetricsProps {
  disciplineScore: number;
  tradesTaken: number;
  maxTrades: number;
  streak: number;
  bestStreak: number;
  emotionalState: number;
  pnl: number;
  canTrade: boolean;
  cantTradeReason: string;
}

function CircularProgress({ value, size = 80, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const getColor = () => {
    if (value >= 80) return '#22c55e';
    if (value >= 50) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-semibold text-white font-mono">{value}</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 500;
    const startTime = Date.now();
    const startValue = displayValue;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-mono">
      {prefix}{displayValue.toFixed(0)}{suffix}
    </span>
  );
}

export function KeyMetrics({
  disciplineScore,
  tradesTaken,
  maxTrades,
  streak,
  bestStreak,
  emotionalState,
  pnl,
  canTrade,
  cantTradeReason,
}: KeyMetricsProps) {
  const tradeProgress = (tradesTaken / maxTrades) * 100;
  const approachingLimit = tradeProgress >= 80;
  
  const getEmotionalColor = () => {
    if (emotionalState >= 7) return 'text-green-500';
    if (emotionalState >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getEmotionalLabel = () => {
    if (emotionalState >= 8) return 'Calm & Focused';
    if (emotionalState >= 6) return 'Good';
    if (emotionalState >= 4) return 'Elevated';
    return 'Stressed';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Discipline Score */}
      <div className="dashboard-card dashboard-card-hover">
        <div className="flex items-center justify-between">
          <div>
            <p className="label-small mb-1">Discipline Score</p>
            <p className="text-sm text-[#b0b0b0]">Based on rules followed</p>
          </div>
          <CircularProgress value={disciplineScore} size={70} strokeWidth={6} />
        </div>
      </div>

      {/* Daily Trade Limit */}
      <div className="dashboard-card dashboard-card-hover">
        <div className="flex items-center justify-between mb-3">
          <p className="label-small">Daily Trade Limit</p>
          {approachingLimit && (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-semibold text-white font-mono">{tradesTaken}</span>
          <span className="text-[#b0b0b0]">of {maxTrades} trades</span>
        </div>
        <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              approachingLimit ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(tradeProgress, 100)}%` }}
          />
        </div>
        {approachingLimit && (
          <p className="text-xs text-yellow-500 mt-2">Approaching limit - trade carefully</p>
        )}
      </div>

      {/* Current Streak */}
      <div className="dashboard-card dashboard-card-hover">
        <div className="flex items-center justify-between mb-2">
          <p className="label-small">Current Streak</p>
          <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-[#555]'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <AnimatedNumber value={streak} />
          <span className="text-[#b0b0b0]">days</span>
        </div>
        <p className="text-xs text-[#666] mt-2">Best: {bestStreak} days</p>
      </div>

      {/* Emotional State */}
      <div className="dashboard-card dashboard-card-hover">
        <div className="flex items-center justify-between mb-2">
          <p className="label-small">Emotional State</p>
          <Activity className={`w-5 h-5 ${getEmotionalColor()}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-semibold font-mono ${getEmotionalColor()}`}>
            {emotionalState}
          </span>
          <span className="text-[#b0b0b0]">/ 10</span>
        </div>
        <p className={`text-sm mt-1 ${getEmotionalColor()}`}>{getEmotionalLabel()}</p>
      </div>

      {/* P&L Summary */}
      <div className="dashboard-card dashboard-card-hover sm:col-span-2 lg:col-span-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {pnl >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <p className="label-small mb-1">Today&apos;s P&L</p>
              <p className={`text-3xl font-semibold font-mono ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
              </p>
            </div>
          </div>
          
          {!canTrade && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{cantTradeReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
