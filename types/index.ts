// types/index.ts

export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  avgVolume: number;
  pe?: number;
  eps?: number;
  sector?: string;
}

export interface CandleData {
  time: string;      // ISO date
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  ema20: number;
  ema50: number;
  ema200: number;
  atr: number;
  bbUpper: number;
  bbMiddle: number;
  bbLower: number;
  stochK: number;
  stochD: number;
  adx: number;
}

export interface SentimentData {
  score: number;          // -1.0 to +1.0
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyRisk: string;
  catalyst: string;
  confidence: number;     // 0–100
  updatedAt: string;
}

export interface TradeSignal {
  id: string;
  ticker: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  stopLoss: number;
  target1: number;
  target2: number;
  confidence: number;
  riskReward: number;
  status: 'ACTIVE' | 'HIT_TARGET1' | 'HIT_TARGET2' | 'STOPPED_OUT' | 'EXPIRED';
  createdAt: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  publishedAt: string;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
}

export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface AnalysisResult {
  quote: StockQuote;
  candles: CandleData[];
  indicators: TechnicalIndicators;
  sentiment: SentimentData;
  signals: TradeSignal[];
  news: NewsItem[];
}

export interface UserPlan {
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  stockLimit: number;
  hasAI: boolean;
  hasSignals: boolean;
  hasAlerts: boolean;
}

export const PLAN_LIMITS: Record<string, UserPlan> = {
  FREE: {
    plan: 'FREE',
    stockLimit: 5,
    hasAI: false,
    hasSignals: false,
    hasAlerts: false,
  },
  PRO: {
    plan: 'PRO',
    stockLimit: Infinity,
    hasAI: true,
    hasSignals: true,
    hasAlerts: true,
  },
  ENTERPRISE: {
    plan: 'ENTERPRISE',
    stockLimit: Infinity,
    hasAI: true,
    hasSignals: true,
    hasAlerts: true,
  },
};
