// lib/sentiment-engine.ts
// AI-powered sentiment scoring. Uses Anthropic API with fallback to mock data.

import type { SentimentData, TechnicalIndicators, StockQuote, NewsItem } from '@/types';
import { getMockSentiment } from './mock-data';

interface SentimentInput {
  ticker: string;
  quote: StockQuote;
  indicators: TechnicalIndicators;
  news: NewsItem[];
}

export async function scoreSentiment(input: SentimentInput): Promise<SentimentData> {
  const { ticker, quote, indicators, news } = input;

  // If no API key, return mock data
  if (!process.env.ANTHROPIC_API_KEY) {
    return getMockSentiment(ticker);
  }

  const prompt = buildSentimentPrompt(ticker, quote, indicators, news);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: `You are a quantitative equity analyst. Analyze the provided data and return ONLY a JSON object with these exact fields:
{
  "score": number between -1.0 and 1.0,
  "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
  "keyRisk": "one sentence describing primary risk",
  "catalyst": "one sentence describing primary catalyst",
  "confidence": number between 0 and 100
}
Return only valid JSON, no other text.`,
        messages: [{ role: 'user', content: prompt }],
      }),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return getMockSentiment(ticker);

    const data = await res.json();
    const text = data.content?.[0]?.text ?? '';
    const parsed = JSON.parse(text.trim());

    return {
      score: Math.max(-1, Math.min(1, parsed.score)),
      bias: ['BULLISH', 'BEARISH', 'NEUTRAL'].includes(parsed.bias) ? parsed.bias : 'NEUTRAL',
      keyRisk: parsed.keyRisk ?? 'Insufficient data',
      catalyst: parsed.catalyst ?? 'Monitor for developments',
      confidence: Math.max(0, Math.min(100, parsed.confidence)),
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return getMockSentiment(ticker);
  }
}

function buildSentimentPrompt(
  ticker: string,
  quote: StockQuote,
  indicators: TechnicalIndicators,
  news: NewsItem[]
): string {
  const headlines = news.slice(0, 5).map(n => `- ${n.headline}`).join('\n');

  return `Analyze ${ticker} (${quote.name}) based on:

PRICE: $${quote.price} | Change: ${quote.changePercent.toFixed(2)}% | Vol: ${(quote.volume/1e6).toFixed(1)}M

TECHNICALS:
- RSI: ${indicators.rsi.toFixed(1)} | MACD: ${indicators.macd > 0 ? '+' : ''}${indicators.macd.toFixed(3)}
- Price vs EMA20: ${((quote.price/indicators.ema20 - 1)*100).toFixed(2)}% | vs EMA50: ${((quote.price/indicators.ema50 - 1)*100).toFixed(2)}%
- ATR: ${indicators.atr} | BBands: ${indicators.bbLower}–${indicators.bbUpper}
- ADX: ${indicators.adx.toFixed(1)} (trend strength)

RECENT NEWS:
${headlines || '- No recent news available'}

SECTOR: ${quote.sector ?? 'Unknown'} | P/E: ${quote.pe ?? 'N/A'} | Mkt Cap: $${(quote.marketCap/1e9).toFixed(0)}B

Provide your analysis as the required JSON format.`;
}

// ── Trade Signal Engine ────────────────────────────────────────────────────

import type { TradeSignal } from '@/types';
import { getMockSignals } from './mock-data';

interface SignalInput {
  ticker: string;
  quote: StockQuote;
  indicators: TechnicalIndicators;
  sentiment: SentimentData;
}

export function generateSignals(input: SignalInput): TradeSignal[] {
  const { ticker, quote, indicators, sentiment } = input;
  const { price } = quote;
  const { rsi, macd, ema20, ema50, atr } = indicators;

  const signals: TradeSignal[] = [];

  // Long signal conditions
  const longConditions = {
    bullishSentiment: sentiment.bias === 'BULLISH',
    rsiNotOverbought: rsi < 65,
    priceAboveEma20:  price > ema20,
    priceAboveEma50:  price > ema50,
    macdBullish:      macd > 0,
  };

  const longScore = Object.values(longConditions).filter(Boolean).length;
  const longConfidence = sentiment.confidence * 0.6 + (longScore / 5) * 40;

  if (longConfidence >= 70 && sentiment.bias !== 'BEARISH') {
    const stopLoss = +(price - 1.5 * atr).toFixed(2);
    const target1  = +(price + 2 * (price - stopLoss)).toFixed(2);
    const target2  = +(price + 4 * (price - stopLoss)).toFixed(2);
    const riskReward = (target1 - price) / (price - stopLoss);

    if (riskReward >= 2) {
      signals.push({
        id: `sig_${ticker}_${Date.now()}`,
        ticker,
        type: 'LONG',
        entry: +price.toFixed(2),
        stopLoss,
        target1,
        target2,
        confidence: +longConfidence.toFixed(0),
        riskReward: +riskReward.toFixed(2),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Short signal conditions
  const shortConditions = {
    bearishSentiment: sentiment.bias === 'BEARISH',
    rsiNotOversold:   rsi > 40,
    priceBelowEma20:  price < ema20,
    priceBelowEma50:  price < ema50,
    macdBearish:      macd < 0,
  };

  const shortScore = Object.values(shortConditions).filter(Boolean).length;
  const shortConfidence = (100 - sentiment.confidence) * 0.6 + (shortScore / 5) * 40;

  if (shortConfidence >= 70 && sentiment.bias === 'BEARISH') {
    const stopLoss = +(price + 1.5 * atr).toFixed(2);
    const target1  = +(price - 2 * (stopLoss - price)).toFixed(2);
    const target2  = +(price - 4 * (stopLoss - price)).toFixed(2);
    const riskReward = (price - target1) / (stopLoss - price);

    if (riskReward >= 2) {
      signals.push({
        id: `sig_${ticker}_short_${Date.now()}`,
        ticker,
        type: 'SHORT',
        entry: +price.toFixed(2),
        stopLoss,
        target1,
        target2,
        confidence: +shortConfidence.toFixed(0),
        riskReward: +riskReward.toFixed(2),
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return signals.length > 0 ? signals : getMockSignals(ticker);
}
