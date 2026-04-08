import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { 
  Trade, 
  DailyStats, 
  Rule, 
  EmotionalCheck, 
  CooldownState, 
  UserSettings,
  PreTradeChecklist 
} from '@/types';

const defaultSettings: UserSettings = {
  dailyTradeLimit: 5,
  dailyLossLimit: 500,
  maxConsecutiveLosses: 2,
  minEmotionalState: 6,
  defaultCooldownMinutes: 15,
  enablePreTradeChecklist: true,
};

const defaultRules: Rule[] = [
  { id: '1', category: 'daily_limits', description: 'Max 5 trades per day', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '2', category: 'daily_limits', description: 'Max 2 consecutive losses', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '3', category: 'daily_limits', description: 'Daily loss limit: $500', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '4', category: 'emotional', description: 'No trading when emotional state < 6', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '5', category: 'emotional', description: 'Mandatory 15-min break after loss', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '6', category: 'emotional', description: 'No revenge trading', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '7', category: 'technical', description: 'Only A and B grade setups', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '8', category: 'technical', description: 'Pre-trade checklist completed', enabled: true, violationsToday: 0, violationsTotal: 0 },
  { id: '9', category: 'technical', description: 'Position size within risk parameters', enabled: true, violationsToday: 0, violationsTotal: 0 },
];

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getDefaultDailyStats = (): DailyStats => ({
  date: getTodayKey(),
  tradesTaken: 0,
  maxTrades: 5,
  pnl: 0,
  wins: 0,
  losses: 0,
  disciplineScore: 100,
  avgEmotionalState: 7,
  ruleViolations: 0,
  streakMaintained: true,
});

export function useDashboard() {
  // Persisted state
  const [trades, setTrades] = useLocalStorage<Trade[]>('trademind-trades', []);
  const [dailyStats, setDailyStats] = useLocalStorage<DailyStats>('trademind-daily', getDefaultDailyStats());
  const [emotionalHistory, setEmotionalHistory] = useLocalStorage<EmotionalCheck[]>('trademind-emotional', []);
  const [rules, setRules] = useLocalStorage<Rule[]>('trademind-rules', defaultRules);
  const [cooldown, setCooldown] = useLocalStorage<CooldownState>('trademind-cooldown', { active: false, endTime: null, duration: 0, reason: '' });
  const [settings, setSettings] = useLocalStorage<UserSettings>('trademind-settings', defaultSettings);
  const [streak, setStreak] = useLocalStorage<number>('trademind-streak', 0);
  const [bestStreak, setBestStreak] = useLocalStorage<number>('trademind-best-streak', 0);

  // Non-persisted UI state
  const [currentEmotionalState, setCurrentEmotionalState] = useState<number>(7);
  const [showPreTradeModal, setShowPreTradeModal] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<Partial<Trade> | null>(null);

  // Check for new day and reset daily stats
  useEffect(() => {
    const today = getTodayKey();
    if (dailyStats.date !== today) {
      // Save yesterday's streak status before resetting
      if (dailyStats.streakMaintained && dailyStats.tradesTaken > 0) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
      } else if (dailyStats.tradesTaken > 0) {
        setStreak(0);
      }
      
      // Reset daily stats
      setDailyStats(getDefaultDailyStats());
      
      // Reset daily rule violations
      setRules(prev => prev.map(rule => ({ ...rule, violationsToday: 0 })));
    }
  }, [dailyStats.date, dailyStats.streakMaintained, dailyStats.tradesTaken, streak, bestStreak, setStreak, setBestStreak, setDailyStats, setRules]);

  // Cooldown timer effect
  useEffect(() => {
    if (!cooldown.active || !cooldown.endTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= cooldown.endTime!) {
        setCooldown({ active: false, endTime: null, duration: 0, reason: '' });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown.active, cooldown.endTime, setCooldown]);

  // Derived state
  const todayTrades = useMemo(() => {
    const today = new Date().toDateString();
    return trades.filter(t => new Date(t.timestamp).toDateString() === today);
  }, [trades]);

  const openTrades = useMemo(() => todayTrades.filter(t => t.status === 'open'), [todayTrades]);
  const closedTrades = useMemo(() => todayTrades.filter(t => t.status === 'closed'), [todayTrades]);

  const consecutiveLosses = useMemo(() => {
    let count = 0;
    for (let i = closedTrades.length - 1; i >= 0; i--) {
      if (closedTrades[i].pnl !== null && closedTrades[i].pnl! < 0) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }, [closedTrades]);

  const canTrade = useMemo(() => {
    if (cooldown.active) return false;
    if (dailyStats.tradesTaken >= settings.dailyTradeLimit) return false;
    if (consecutiveLosses >= settings.maxConsecutiveLosses) return false;
    if (dailyStats.pnl <= -settings.dailyLossLimit) return false;
    if (currentEmotionalState < settings.minEmotionalState) return false;
    return true;
  }, [cooldown.active, dailyStats.tradesTaken, dailyStats.pnl, settings, consecutiveLosses, currentEmotionalState]);

  const cantTradeReason = useMemo(() => {
    if (cooldown.active) return 'Cooldown active - take a break';
    if (dailyStats.tradesTaken >= settings.dailyTradeLimit) return 'Daily trade limit reached';
    if (consecutiveLosses >= settings.maxConsecutiveLosses) return 'Max consecutive losses reached';
    if (dailyStats.pnl <= -settings.dailyLossLimit) return 'Daily loss limit reached';
    if (currentEmotionalState < settings.minEmotionalState) return 'Emotional state too low';
    return '';
  }, [cooldown.active, dailyStats.tradesTaken, dailyStats.pnl, settings, consecutiveLosses, currentEmotionalState]);

  // Actions
  const startCooldown = useCallback((minutes: number, reason: string) => {
    setCooldown({
      active: true,
      endTime: Date.now() + minutes * 60 * 1000,
      duration: minutes * 60 * 1000,
      reason,
    });
  }, [setCooldown]);

  const cancelCooldown = useCallback(() => {
    setCooldown({ active: false, endTime: null, duration: 0, reason: '' });
  }, [setCooldown]);

  const updateEmotionalState = useCallback((rating: number) => {
    setCurrentEmotionalState(rating);
    setEmotionalHistory(prev => [...prev, { timestamp: Date.now(), rating }]);
  }, [setEmotionalHistory]);

  const initiateTrade = useCallback((trade: Partial<Trade>) => {
    if (!canTrade) return false;
    
    if (settings.enablePreTradeChecklist) {
      setPendingTrade(trade);
      setShowPreTradeModal(true);
      return true;
    }
    
    return true;
  }, [canTrade, settings.enablePreTradeChecklist]);

  const confirmTrade = useCallback((checklist: PreTradeChecklist) => {
    if (!pendingTrade) return;

    const allChecked = Object.values(checklist).every(v => v);
    if (!allChecked) {
      // Log rule violation for incomplete checklist
      setRules(prev => prev.map(rule => 
        rule.id === '8' 
          ? { ...rule, violationsToday: rule.violationsToday + 1, violationsTotal: rule.violationsTotal + 1 }
          : rule
      ));
      setDailyStats(prev => ({ ...prev, ruleViolations: prev.ruleViolations + 1 }));
    }

    const newTrade: Trade = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      symbol: pendingTrade.symbol || 'UNKNOWN',
      direction: pendingTrade.direction || 'long',
      entryPrice: pendingTrade.entryPrice || 0,
      exitPrice: null,
      position: pendingTrade.position || 0,
      pnl: null,
      setupType: pendingTrade.setupType || '',
      emotionalStateBefore: currentEmotionalState,
      emotionalStateAfter: null,
      rulesFollowed: allChecked,
      notes: pendingTrade.notes || '',
      status: 'open',
    };

    setTrades(prev => [...prev, newTrade]);
    setDailyStats(prev => ({ ...prev, tradesTaken: prev.tradesTaken + 1 }));
    setPendingTrade(null);
    setShowPreTradeModal(false);
  }, [pendingTrade, currentEmotionalState, setTrades, setDailyStats, setRules]);

  const closeTrade = useCallback((tradeId: string, exitPrice: number, notes?: string) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id !== tradeId) return trade;
      
      const pnl = trade.direction === 'long' 
        ? (exitPrice - trade.entryPrice) * trade.position
        : (trade.entryPrice - exitPrice) * trade.position;
      
      return {
        ...trade,
        exitPrice,
        pnl,
        status: 'closed',
        emotionalStateAfter: currentEmotionalState,
        notes: notes ? `${trade.notes} ${notes}` : trade.notes,
      };
    }));

    // Update daily stats
    const trade = trades.find(t => t.id === tradeId);
    if (trade) {
      const pnl = trade.direction === 'long' 
        ? (exitPrice - trade.entryPrice) * trade.position
        : (trade.entryPrice - exitPrice) * trade.position;
      
      setDailyStats(prev => ({
        ...prev,
        pnl: prev.pnl + pnl,
        wins: pnl > 0 ? prev.wins + 1 : prev.wins,
        losses: pnl < 0 ? prev.losses + 1 : prev.losses,
      }));

      // Start cooldown after loss
      if (pnl < 0) {
        startCooldown(settings.defaultCooldownMinutes, 'Post-loss cooldown');
      }
    }
  }, [trades, currentEmotionalState, setTrades, setDailyStats, startCooldown, settings.defaultCooldownMinutes]);

  const deleteTrade = useCallback((tradeId: string) => {
    setTrades(prev => prev.filter(t => t.id !== tradeId));
  }, [setTrades]);

  const addRuleViolation = useCallback((ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, violationsToday: rule.violationsToday + 1, violationsTotal: rule.violationsTotal + 1 }
        : rule
    ));
    setDailyStats(prev => ({ 
      ...prev, 
      ruleViolations: prev.ruleViolations + 1,
      streakMaintained: false,
    }));
  }, [setRules, setDailyStats]);

  const resetDay = useCallback(() => {
    setDailyStats(getDefaultDailyStats());
    setRules(prev => prev.map(rule => ({ ...rule, violationsToday: 0 })));
    setCooldown({ active: false, endTime: null, duration: 0, reason: '' });
  }, [setDailyStats, setRules, setCooldown]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, [setSettings]);

  const disciplineScore = useMemo(() => {
    let score = 100;
    // Deduct for rule violations
    score -= dailyStats.ruleViolations * 10;
    // Deduct for emotional state below threshold
    if (currentEmotionalState < settings.minEmotionalState) score -= 15;
    // Deduct for approaching trade limit
    if (dailyStats.tradesTaken >= settings.dailyTradeLimit * 0.8) score -= 5;
    return Math.max(0, Math.min(100, score));
  }, [dailyStats.ruleViolations, dailyStats.tradesTaken, currentEmotionalState, settings]);

  const getRemainingCooldown = useCallback(() => {
    if (!cooldown.active || !cooldown.endTime) return 0;
    return Math.max(0, cooldown.endTime - Date.now());
  }, [cooldown]);

  return {
    // State
    trades: todayTrades,
    allTrades: trades,
    dailyStats,
    emotionalHistory,
    rules,
    cooldown,
    settings,
    streak,
    bestStreak,
    currentEmotionalState,
    showPreTradeModal,
    pendingTrade,
    canTrade,
    cantTradeReason,
    disciplineScore,
    openTrades,
    closedTrades,
    consecutiveLosses,

    // Actions
    startCooldown,
    cancelCooldown,
    updateEmotionalState,
    initiateTrade,
    confirmTrade,
    closeTrade,
    deleteTrade,
    addRuleViolation,
    resetDay,
    updateSettings,
    setShowPreTradeModal,
    getRemainingCooldown,
  };
}
