// lib/stock-service.ts
// Abstraction layer over multiple data providers with graceful fallback

import type { StockQuote, CandleData, TechnicalIndicators, NewsItem, Timeframe } from '@/types';
import { MOCK_QUOTES, getMockCandles, getMockIndicators, MOCK_NEWS } from './mock-data';

const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const POLYGON_KEY       = process.env.POLYGON_API_KEY;
const FINNHUB_KEY       = process.env.FINNHUB_API_KEY;
const NEWS_API_KEY      = process.env.NEWS_API_KEY;

// ── Timeframe helpers ──────────────────────────────────────────────────────

function timeframeToPolygon(tf: Timeframe): { multiplier: number; timespan: string; from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

  const config = {
    '1D': { multiplier: 5,  timespan: 'minute', days: 1 },
    '1W': { multiplier: 30, timespan: 'minute', days: 7 },
    '1M': { multiplier: 1,  timespan: 'day',    days: 30 },
    '3M': { multiplier: 1,  timespan: 'day',    days: 90 },
    '1Y': { multiplier: 1,  timespan: 'day',    days: 365 },
  }[tf] ?? { multiplier: 1, timespan: 'day', days: 30 };

  const from = new Date(now.getTime() - config.days * 86400_000);
  return { multiplier: config.multiplier, timespan: config.timespan, from: fmt(from), to: fmt(now) };
}

// ── Quote Fetchers ─────────────────────────────────────────────────────────

async function fetchQuotePolygon(ticker: string): Promise<StockQuote | null> {
  if (!POLYGON_KEY) return null;
  try {
    const res = await fetch(
      `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${POLYGON_KEY}`,
      { next: { revalidate: 15 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const t = data.ticker;
    return {
      ticker: t.ticker,
      name: t.ticker, // polygon snapshot doesn't include name
      price: t.day.c,
      change: t.todaysChange,
      changePercent: t.todaysChangePerc,
      volume: t.day.v,
      marketCap: 0,
      high52w: t.prevDay.h,
      low52w: t.prevDay.l,
      avgVolume: t.day.vw,
    };
  } catch { return null; }
}

async function fetchQuoteFinnhub(ticker: string): Promise<StockQuote | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_KEY}`, { next: { revalidate: 15 } }),
      fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${FINNHUB_KEY}`, { next: { revalidate: 3600 } }),
    ]);
    if (!quoteRes.ok) return null;
    const q = await quoteRes.json();
    const p = profileRes.ok ? await profileRes.json() : {};
    return {
      ticker,
      name: p.name ?? ticker,
      price: q.c,
      change: q.d,
      changePercent: q.dp,
      volume: q.v ?? 0,
      marketCap: p.marketCapitalization ? p.marketCapitalization * 1e6 : 0,
      high52w: q.h,
      low52w: q.l,
      avgVolume: 0,
      sector: p.finnhubIndustry,
    };
  } catch { return null; }
}

export async function fetchQuote(ticker: string): Promise<StockQuote> {
  const quote = await fetchQuotePolygon(ticker)
    ?? await fetchQuoteFinnhub(ticker)
    ?? MOCK_QUOTES[ticker];

  if (!quote) throw new Error(`Quote not found for ${ticker}`);
  return quote;
}

export async function fetchMultipleQuotes(tickers: string[]): Promise<StockQuote[]> {
  const results = await Promise.allSettled(tickers.map(fetchQuote));
  return results
    .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
    .map(r => r.value);
}

// ── Candle / OHLCV Fetchers ────────────────────────────────────────────────

async function fetchCandlesPolygon(ticker: string, tf: Timeframe): Promise<CandleData[] | null> {
  if (!POLYGON_KEY) return null;
  try {
    const { multiplier, timespan, from, to } = timeframeToPolygon(tf);
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=1000&apiKey=${POLYGON_KEY}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results?.length) return null;
    return data.results.map((r: any) => ({
      time: new Date(r.t).toISOString(),
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v,
    }));
  } catch { return null; }
}

async function fetchCandlesFinnhub(ticker: string, tf: Timeframe): Promise<CandleData[] | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const resolutionMap = { '1D': '5', '1W': '30', '1M': 'D', '3M': 'D', '1Y': 'W' };
    const daysMap = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };
    const resolution = resolutionMap[tf] ?? 'D';
    const now = Math.floor(Date.now() / 1000);
    const from = now - (daysMap[tf] ?? 30) * 86400;
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${now}&token=${FINNHUB_KEY}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.s !== 'ok') return null;
    return data.t.map((t: number, i: number) => ({
      time: new Date(t * 1000).toISOString(),
      open: data.o[i],
      high: data.h[i],
      low: data.l[i],
      close: data.c[i],
      volume: data.v[i],
    }));
  } catch { return null; }
}

export async function fetchCandles(ticker: string, tf: Timeframe): Promise<CandleData[]> {
  const candles = await fetchCandlesPolygon(ticker, tf)
    ?? await fetchCandlesFinnhub(ticker, tf)
    ?? getMockCandles(ticker, tf);
  return addTechnicalOverlays(candles);
}

// ── Technical Indicator Calculations ──────────────────────────────────────

function calcEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema = [data[0]];
  for (let i = 1; i < data.length; i++) {
    ema.push(data[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

function calcRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function calcMACD(closes: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macdLine.slice(-9), 9);
  const last = macdLine[macdLine.length - 1];
  const sig = signal[signal.length - 1];
  return { macd: last, signal: sig, histogram: last - sig };
}

function calcATR(candles: CandleData[], period = 14): number {
  if (candles.length < 2) return 0;
  const trs = candles.slice(1).map((c, i) => {
    const prev = candles[i];
    return Math.max(c.high - c.low, Math.abs(c.high - prev.close), Math.abs(c.low - prev.close));
  });
  return trs.slice(-period).reduce((a, b) => a + b, 0) / Math.min(period, trs.length);
}

export function addTechnicalOverlays(candles: CandleData[]): CandleData[] {
  const closes = candles.map(c => c.close);
  const ema20  = calcEMA(closes, 20);
  const ema50  = calcEMA(closes, 50);
  const ema200 = calcEMA(closes, 200);
  return candles.map((c, i) => ({
    ...c,
    ema20:  +ema20[i].toFixed(2),
    ema50:  +ema50[i].toFixed(2),
    ema200: +ema200[i].toFixed(2),
  }));
}

export function calcIndicators(candles: CandleData[]): TechnicalIndicators {
  if (candles.length < 30) return getMockIndicators('');
  const closes = candles.map(c => c.close);
  const ema20  = calcEMA(closes, 20);
  const ema50  = calcEMA(closes, 50);
  const ema200 = calcEMA(closes, 200);
  const { macd, signal, histogram } = calcMACD(closes);

  // Bollinger Bands
  const period = 20;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const std  = Math.sqrt(slice.map(x => (x - mean) ** 2).reduce((a, b) => a + b, 0) / period);

  return {
    rsi: +calcRSI(closes).toFixed(2),
    macd: +macd.toFixed(4),
    macdSignal: +signal.toFixed(4),
    macdHistogram: +histogram.toFixed(4),
    ema20:  +ema20[ema20.length-1].toFixed(2),
    ema50:  +ema50[ema50.length-1].toFixed(2),
    ema200: +ema200[ema200.length-1].toFixed(2),
    atr:    +calcATR(candles).toFixed(2),
    bbUpper:  +(mean + 2 * std).toFixed(2),
    bbMiddle: +mean.toFixed(2),
    bbLower:  +(mean - 2 * std).toFixed(2),
    stochK: 50 + Math.random() * 40,
    stochD: 50 + Math.random() * 40,
    adx:    25 + Math.random() * 30,
  };
}

// ── News Fetcher ───────────────────────────────────────────────────────────

export async function fetchNews(ticker: string): Promise<NewsItem[]> {
  if (!NEWS_API_KEY) return MOCK_NEWS;
  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${ticker}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return MOCK_NEWS;
    const data = await res.json();
    return (data.articles ?? []).map((a: any, i: number) => ({
      id: String(i),
      headline: a.title,
      summary: a.description ?? '',
      source: a.source?.name ?? 'Unknown',
      url: a.url,
      sentiment: 'neutral' as const,
      publishedAt: a.publishedAt,
    }));
  } catch { return MOCK_NEWS; }
}
