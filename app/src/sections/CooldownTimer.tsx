import { useState, useEffect } from 'react';
import { Timer, X, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CooldownTimerProps {
  isActive: boolean;
  endTime: number | null;
  duration: number;
  reason: string;
  onCancel: () => void;
}

export function CooldownTimer({ isActive, endTime, duration, reason, onCancel }: CooldownTimerProps) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (!isActive || !endTime) return;

    const updateRemaining = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setRemainingMs(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [isActive, endTime]);

  if (!isActive) return null;

  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  
  // Calculate progress based on initial duration (default 15 min = 900000ms if not set)
  const initialDuration = duration > 0 ? duration : 15 * 60 * 1000;
  const progress = initialDuration > 0 ? remainingMs / initialDuration : 0;

  const formatTime = (m: number, s: number) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-card border-yellow-500/30 bg-yellow-500/5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg width="80" height="80" className="transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#333"
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#eab308"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={226}
                strokeDashoffset={226 * (1 - progress)}
                className="progress-ring-circle"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          
          <div>
            <p className="text-lg font-semibold text-white mb-1">Cooldown Active</p>
            <p className="text-sm text-[#b0b0b0]">{reason}</p>
            <p className="text-xs text-yellow-500 mt-2">
              Step away from the screen. Breathe. Trading will resume when the timer completes.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl font-mono font-semibold text-yellow-500">
            {formatTime(minutes, seconds)}
          </div>
          <button
            onClick={() => setShowCancelDialog(true)}
            className="flex items-center gap-2 text-sm text-[#666] hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel Cooldown
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="bg-[#1d1d1d] border-[#aeaeae33] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Cancel Cooldown?
            </DialogTitle>
            <DialogDescription className="text-[#b0b0b0]">
              Cooldowns are designed to protect you from emotional trading. Are you sure you want to cancel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <button
              onClick={() => setShowCancelDialog(false)}
              className="btn-secondary flex-1"
            >
              Keep Cooldown
            </button>
            <button
              onClick={() => {
                onCancel();
                setShowCancelDialog(false);
              }}
              className="btn-danger flex-1"
            >
              Cancel Anyway
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
