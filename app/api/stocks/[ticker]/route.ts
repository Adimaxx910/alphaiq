// app/api/stocks/[ticker]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { fetchQuote, fetchCandles, fetchNews, calcIndicators } from '@/lib/stock-service';
import { scoreSentiment, generateSignals } from '@/lib/sentiment-engine';
import type { Timeframe } from '@/types';

export const revalidate = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: { ticker: string } }
) {
  const ticker = params.ticker.toUpperCase();
  const { searchParams } = new URL(req.url);
  const tf = (searchParams.get('tf') ?? '1M') as Timeframe;

  try {
    // Parallel fetch
    const [quote, candles, news] = await Promise.all([
      fetchQuote(ticker),
      fetchCandles(ticker, tf),
      fetchNews(ticker),
    ]);

    const indicators = calcIndicators(candles);
    const sentiment  = await scoreSentiment({ ticker, quote, indicators, news });
    const signals    = generateSignals({ ticker, quote, indicators, sentiment });

    return NextResponse.json({
      ticker,
      quote,
      candles,
      indicators,
      sentiment,
      signals,
      news,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[${ticker}] Analysis error:`, error);
    return NextResponse.json(
      { error: error.message ?? 'Analysis failed' },
      { status: 500 }
    );
  }
}
