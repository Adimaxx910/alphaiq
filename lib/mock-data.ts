// lib/mock-data.ts
// Fallback data when APIs are unavailable

import type { StockQuote, CandleData, SentimentData, TradeSignal, NewsItem, TechnicalIndicators } from '@/types';

export const MOCK_WATCHLIST_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA',
  'META', 'AMZN', 'AMD', 'NFLX', 'ORCL',
];

export const MOCK_QUOTES: Record<string, StockQuote> = {
  AAPL: { ticker: 'AAPL', name: 'Apple Inc.', price: 189.84, change: 2.34, changePercent: 1.25, volume: 58_234_100, marketCap: 2_940_000_000_000, high52w: 199.62, low52w: 164.08, avgVolume: 55_000_000, pe: 29.4, eps: 6.46, sector: 'Technology' },
  MSFT: { ticker: 'MSFT', name: 'Microsoft Corp.', price: 415.32, change: -1.87, changePercent: -0.45, volume: 22_100_000, marketCap: 3_090_000_000_000, high52w: 430.82, low52w: 309.45, avgVolume: 21_000_000, pe: 36.1, eps: 11.5, sector: 'Technology' },
  GOOGL: { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 174.21, change: 3.15, changePercent: 1.84, volume: 24_500_000, marketCap: 2_150_000_000_000, high52w: 191.75, low52w: 129.40, avgVolume: 23_000_000, pe: 24.3, eps: 7.17, sector: 'Technology' },
  NVDA: { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.36, change: 22.74, changePercent: 2.67, volume: 41_800_000, marketCap: 2_160_000_000_000, high52w: 974.00, low52w: 373.48, avgVolume: 40_000_000, pe: 68.2, eps: 12.84, sector: 'Technology' },
  TSLA: { ticker: 'TSLA', name: 'Tesla Inc.', price: 248.60, change: -5.42, changePercent: -2.13, volume: 89_200_000, marketCap: 792_000_000_000, high52w: 299.29, low52w: 138.80, avgVolume: 85_000_000, pe: 52.7, eps: 4.72, sector: 'Consumer Discretionary' },
  META: { ticker: 'META', name: 'Meta Platforms', price: 503.71, change: 8.24, changePercent: 1.66, volume: 18_300_000, marketCap: 1_280_000_000_000, high52w: 531.49, low52w: 279.40, avgVolume: 17_000_000, pe: 27.6, eps: 18.25, sector: 'Technology' },
  AMZN: { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 184.72, change: 1.43, changePercent: 0.78, volume: 31_400_000, marketCap: 1_920_000_000_000, high52w: 201.20, low52w: 118.35, avgVolume: 29_000_000, pe: 54.3, eps: 3.40, sector: 'Consumer Discretionary' },
  AMD:  { ticker: 'AMD',  name: 'Advanced Micro Devices', price: 168.42, change: 4.18, changePercent: 2.54, volume: 45_600_000, marketCap: 272_000_000_000, high52w: 227.30, low52w: 93.12, avgVolume: 44_000_000, pe: 298.0, eps: 0.56, sector: 'Technology' },
  NFLX: { ticker: 'NFLX', name: 'Netflix Inc.', price: 662.15, change: -3.21, changePercent: -0.48, volume: 4_100_000, marketCap: 285_000_000_000, high52w: 700.95, low52w: 344.73, avgVolume: 4_000_000, pe: 45.8, eps: 14.46, sector: 'Communication Services' },
  ORCL: { ticker: 'ORCL', name: 'Oracle Corp.', price: 124.30, change: 0.87, changePercent: 0.71, volume: 8_700_000, marketCap: 341_000_000_000, high52w: 138.37, low52w: 95.06, avgVolume: 8_000_000, pe: 21.3, eps: 5.84, sector: 'Technology' },
};

function generateCandles(basePrice: number, count: number, intervalMs: number): CandleData[] {
  const candles: CandleData[] = [];
  let price = basePrice * 0.85;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * intervalMs).toISOString();
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.02;
    const close = Math.max(price + change, 1);
    const high = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low  = Math.min(open, close) * (1 - Math.random() * 0.008);
    const volume = Math.floor(1_000_000 + Math.random() * 5_000_000);

    candles.push({
      time,
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low:  +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });
    price = close;
  }
  return candles;
}

export function getMockCandles(ticker: string, timeframe: string): CandleData[] {
  const base = MOCK_QUOTES[ticker]?.price ?? 100;
  switch (timeframe) {
    case '1D': return generateCandles(base, 390, 60_000);         // 1 min bars
    case '1W': return generateCandles(base, 126, 30 * 60_000);    // 30 min bars
    case '1M': return generateCandles(base, 22,  24 * 3600_000);  // daily
    case '3M': return generateCandles(base, 65,  24 * 3600_000);
    case '1Y': return generateCandles(base, 252, 24 * 3600_000);
    default:   return generateCandles(base, 252, 24 * 3600_000);
  }
}

export function getMockSentiment(ticker: string): SentimentData {
  const sentiments: Record<string, SentimentData> = {
    AAPL: { score: 0.72, bias: 'BULLISH', keyRisk: 'Slower China iPhone demand and macro headwinds could weigh on margins.', catalyst: 'Vision Pro ecosystem adoption and services revenue acceleration driving multiple re-rating.', confidence: 81, updatedAt: new Date().toISOString() },
    MSFT: { score: 0.65, bias: 'BULLISH', keyRisk: 'Azure growth deceleration and heavy AI capex pressure on free cash flow.', catalyst: 'Copilot enterprise upsell cycle and OpenAI integration expanding total addressable market.', confidence: 78, updatedAt: new Date().toISOString() },
    NVDA: { score: 0.88, bias: 'BULLISH', keyRisk: 'Export restrictions and potential H20 ban to China limits revenue ceiling.', catalyst: 'Blackwell GPU backlog exceeds 12-month supply, sovereign AI buildout accelerating demand.', confidence: 91, updatedAt: new Date().toISOString() },
    TSLA: { score: -0.31, bias: 'BEARISH', keyRisk: 'Brand erosion and EV price war compressing gross margins toward breakeven.', catalyst: 'FSD commercialization and Robotaxi launch could unlock new high-margin revenue streams.', confidence: 62, updatedAt: new Date().toISOString() },
    META: { score: 0.54, bias: 'BULLISH', keyRisk: 'Ad spend cyclicality and Reality Labs losses diluting core profitability.', catalyst: 'Llama AI integration driving engagement uplift and advertising efficiency gains.', confidence: 74, updatedAt: new Date().toISOString() },
    GOOGL: { score: 0.41, bias: 'BULLISH', keyRisk: 'DOJ antitrust ruling could force changes to search distribution agreements.', catalyst: 'Gemini integration across Workspace and search is showing positive monetization early signals.', confidence: 69, updatedAt: new Date().toISOString() },
    AMZN: { score: 0.67, bias: 'BULLISH', keyRisk: 'AWS competitive pressure from Azure and Google Cloud may slow market share gains.', catalyst: 'Operating leverage from logistics optimization driving significant EBIT margin expansion.', confidence: 76, updatedAt: new Date().toISOString() },
    AMD:  { score: 0.58, bias: 'BULLISH', keyRisk: 'MI300X ramp execution and customer yield issues could delay data center revenue.', catalyst: 'Hyperscaler AI GPU diversification away from NVDA creating significant pipeline for MI300 series.', confidence: 72, updatedAt: new Date().toISOString() },
    NFLX: { score: 0.22, bias: 'NEUTRAL', keyRisk: 'Ad-supported tier ARPU dilution and content cost inflation limiting margin upside.', catalyst: 'Password sharing crackdown fully annualized, live events strategy expanding monetization.', confidence: 58, updatedAt: new Date().toISOString() },
    ORCL: { score: 0.35, bias: 'BULLISH', keyRisk: 'Database migration to cloud is slower than peers, reducing competitive position.', catalyst: 'OCI infrastructure wins with AI companies creating sticky, high-growth revenue base.', confidence: 64, updatedAt: new Date().toISOString() },
  };
  return sentiments[ticker] ?? {
    score: 0.1, bias: 'NEUTRAL',
    keyRisk: 'Insufficient data for comprehensive risk assessment.',
    catalyst: 'Monitor for upcoming earnings and macro data releases.',
    confidence: 45,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockSignals(ticker: string): TradeSignal[] {
  const quote = MOCK_QUOTES[ticker];
  if (!quote) return [];
  const p = quote.price;
  return [
    {
      id: `sig_${ticker}_1`,
      ticker,
      type: 'LONG',
      entry: +(p * 0.995).toFixed(2),
      stopLoss: +(p * 0.967).toFixed(2),
      target1: +(p * 1.042).toFixed(2),
      target2: +(p * 1.085).toFixed(2),
      confidence: 76,
      riskReward: 2.4,
      status: 'ACTIVE',
      createdAt: new Date(Date.now() - 3600_000).toISOString(),
    },
  ];
}

export function getMockIndicators(ticker: string): TechnicalIndicators {
  const p = MOCK_QUOTES[ticker]?.price ?? 100;
  return {
    rsi: 52 + Math.random() * 20 - 10,
    macd: (Math.random() - 0.5) * 5,
    macdSignal: (Math.random() - 0.5) * 4,
    macdHistogram: (Math.random() - 0.5) * 2,
    ema20:  +(p * 0.992).toFixed(2),
    ema50:  +(p * 0.975).toFixed(2),
    ema200: +(p * 0.931).toFixed(2),
    atr:    +(p * 0.018).toFixed(2),
    bbUpper: +(p * 1.03).toFixed(2),
    bbMiddle: +p.toFixed(2),
    bbLower: +(p * 0.97).toFixed(2),
    stochK: 60 + Math.random() * 30,
    stochD: 55 + Math.random() * 30,
    adx: 22 + Math.random() * 25,
  };
}

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', headline: 'Federal Reserve signals potential rate cuts amid cooling inflation data', summary: 'Fed officials indicated openness to rate reductions as CPI trends toward the 2% target.', source: 'Reuters', url: '#', sentiment: 'positive', publishedAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: '2', headline: 'AI chip demand outpaces supply through 2025, analysts say', summary: 'Supply chain constraints for advanced AI semiconductors expected to persist into Q3 2025.', source: 'Bloomberg', url: '#', sentiment: 'positive', publishedAt: new Date(Date.now() - 7200_000).toISOString() },
  { id: '3', headline: 'Tech earnings beat expectations as enterprise AI spending surges', summary: 'Major technology companies reported stronger-than-expected Q1 results driven by AI-related revenue.', source: 'WSJ', url: '#', sentiment: 'positive', publishedAt: new Date(Date.now() - 10800_000).toISOString() },
  { id: '4', headline: 'Geopolitical tensions weigh on global risk appetite', summary: 'Escalating conflicts in multiple regions driving flight to safety in bond markets.', source: 'FT', url: '#', sentiment: 'negative', publishedAt: new Date(Date.now() - 14400_000).toISOString() },
  { id: '5', headline: 'S&P 500 hits new all-time high on strong economic data', summary: 'Equity markets rallied as jobs report showed resilient labor market without inflation pressure.', source: 'CNBC', url: '#', sentiment: 'positive', publishedAt: new Date(Date.now() - 18000_000).toISOString() },
];
