// Trading Discipline Dashboard Types

export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice: number | null;
  position: number;
  pnl: number | null;
  setupType: string;
  emotionalStateBefore: number;
  emotionalStateAfter: number | null;
  rulesFollowed: boolean;
  notes: string;
  status: 'open' | 'closed';
}

export interface DailyStats {
  date: string;
  tradesTaken: number;
  maxTrades: number;
  pnl: number;
  wins: number;
  losses: number;
  disciplineScore: number;
  avgEmotionalState: number;
  ruleViolations: number;
  streakMaintained: boolean;
}

export interface Rule {
  id: string;
  category: 'daily_limits' | 'emotional' | 'technical';
  description: string;
  enabled: boolean;
  violationsToday: number;
  violationsTotal: number;
}

export interface EmotionalCheck {
  timestamp: number;
  rating: number;
  note?: string;
}

export interface CooldownState {
  active: boolean;
  endTime: number | null;
  duration: number;
  reason: string;
}

export interface UserSettings {
  dailyTradeLimit: number;
  dailyLossLimit: number;
  maxConsecutiveLosses: number;
  minEmotionalState: number;
  defaultCooldownMinutes: number;
  enablePreTradeChecklist: boolean;
}

export interface DashboardState {
  trades: Trade[];
  dailyStats: DailyStats;
  emotionalHistory: EmotionalCheck[];
  rules: Rule[];
  cooldown: CooldownState;
  settings: UserSettings;
  streak: number;
  bestStreak: number;
}

export type EmotionalLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PreTradeChecklist {
  validSetup: boolean;
  knowsPrices: boolean;
  positionSizeOk: boolean;
  notFomoOrRevenge: boolean;
  emotionalStateOk: boolean;
}
