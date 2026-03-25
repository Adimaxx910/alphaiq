// app/api/sentiment/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchQuote, fetchNews, calcIndicators, fetchCandles } from '@/lib/stock-service';
import { scoreSentiment } from '@/lib/sentiment-engine';

export const revalidate = 1800; // 30 min cache

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });

  // Check recent snapshot first (< 30 min old)
  const recent = await prisma.sentimentSnapshot.findFirst({
    where: {
      ticker,
      createdAt: { gte: new Date(Date.now() - 30 * 60_000) },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) {
    return NextResponse.json({
      score: recent.score,
      bias: recent.bias,
      keyRisk: recent.keyRisk,
      catalyst: recent.catalyst,
      confidence: recent.confidence,
      updatedAt: recent.createdAt.toISOString(),
      cached: true,
    });
  }

  // Generate fresh sentiment
  try {
    const [quote, candles, news] = await Promise.all([
      fetchQuote(ticker),
      fetchCandles(ticker, '1M'),
      fetchNews(ticker),
    ]);
    const indicators = calcIndicators(candles);
    const sentiment  = await scoreSentiment({ ticker, quote, indicators, news });

    // Persist to DB
    await prisma.sentimentSnapshot.create({
      data: {
        ticker,
        score: sentiment.score,
        bias: sentiment.bias as any,
        keyRisk: sentiment.keyRisk,
        catalyst: sentiment.catalyst,
        confidence: sentiment.confidence,
      },
    });

    return NextResponse.json({ ...sentiment, cached: false });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
