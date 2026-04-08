import { useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp, Minus, AlertCircle } from 'lucide-react';

interface EmotionalTrackerProps {
  currentRating: number;
  onRatingChange: (rating: number) => void;
  history: { timestamp: number; rating: number }[];
}

const emotionalLabels: Record<number, { label: string; color: string; icon: typeof TrendingDown }> = {
  1: { label: 'Panicked', color: 'text-red-500', icon: TrendingDown },
  2: { label: 'Very Anxious', color: 'text-red-500', icon: TrendingDown },
  3: { label: 'Anxious', color: 'text-red-400', icon: TrendingDown },
  4: { label: 'Stressed', color: 'text-yellow-500', icon: TrendingDown },
  5: { label: 'Uneasy', color: 'text-yellow-500', icon: Minus },
  6: { label: 'Neutral', color: 'text-yellow-400', icon: Minus },
  7: { label: 'Calm', color: 'text-green-400', icon: TrendingUp },
  8: { label: 'Focused', color: 'text-green-500', icon: TrendingUp },
  9: { label: 'Very Focused', color: 'text-green-500', icon: TrendingUp },
  10: { label: 'Flow State', color: 'text-green-500', icon: TrendingUp },
};

const getRecommendation = (rating: number): { text: string; severity: 'low' | 'medium' | 'high' } => {
  if (rating <= 3) {
    return {
      text: 'Your emotional state may significantly impair judgment. Consider stopping trading for the day.',
      severity: 'high',
    };
  }
  if (rating <= 5) {
    return {
      text: 'Take a 10-15 minute break before your next trade. Practice deep breathing.',
      severity: 'medium',
    };
  }
  if (rating <= 7) {
    return {
      text: 'You\'re in an acceptable state for trading. Stay mindful of your emotions.',
      severity: 'low',
    };
  }
  return {
    text: 'Excellent mental state for trading. Maintain this focus and discipline.',
    severity: 'low',
  };
};

export function EmotionalTracker({ currentRating, onRatingChange, history }: EmotionalTrackerProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const displayRating = hoveredRating ?? currentRating;
  const emotionalInfo = emotionalLabels[displayRating];
  const Icon = emotionalInfo.icon;
  const recommendation = getRecommendation(currentRating);

  // Prepare chart data - last 20 readings
  const chartData = history
    .slice(-20)
    .map((h, i) => ({
      index: i,
      rating: h.rating,
      time: new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }));

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-title mb-1">Emotional State Tracker</h3>
          <p className="text-sm text-[#b0b0b0]">Check in with yourself throughout the trading day</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111] ${emotionalInfo.color}`}>
          <Icon className="w-4 h-4" />
          <span className="font-medium">{emotionalInfo.label}</span>
        </div>
      </div>

      {/* Rating Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[#666] mb-2">
          <span>Panicked (1)</span>
          <span>Flow State (10)</span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={currentRating}
          onChange={(e) => onRatingChange(Number(e.target.value))}
          onMouseEnter={() => setHoveredRating(currentRating)}
          onMouseLeave={() => setHoveredRating(null)}
          className="w-full h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              #ef4444 0%, #ef4444 30%, 
              #eab308 30%, #eab308 60%, 
              #22c55e 60%, #22c55e 100%)`,
          }}
        />
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              onClick={() => onRatingChange(num)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                currentRating === num
                  ? 'bg-white text-[#111] scale-110'
                  : 'bg-[#333] text-[#b0b0b0] hover:bg-[#444]'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className={`p-4 rounded-lg mb-6 ${
        recommendation.severity === 'high' ? 'bg-red-500/10 border border-red-500/30' :
        recommendation.severity === 'medium' ? 'bg-yellow-500/10 border border-yellow-500/30' :
        'bg-green-500/10 border border-green-500/30'
      }`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            recommendation.severity === 'high' ? 'text-red-500' :
            recommendation.severity === 'medium' ? 'text-yellow-500' :
            'text-green-500'
          }`} />
          <div>
            <p className={`font-medium ${
              recommendation.severity === 'high' ? 'text-red-400' :
              recommendation.severity === 'medium' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              Recommendation
            </p>
            <p className="text-sm text-[#b0b0b0] mt-1">{recommendation.text}</p>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      {chartData.length > 1 && (
        <div>
          <p className="label-small mb-3">Recent History</p>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <YAxis domain={[1, 10]} hide />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1d1d1d] border border-[#aeaeae33] rounded p-2 text-xs">
                          <p className="text-[#b0b0b0]">{data.time}</p>
                          <p className="text-white font-medium">Rating: {data.rating}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
