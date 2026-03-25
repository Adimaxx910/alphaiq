// app/api/stocks/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { fetchMultipleQuotes } from '@/lib/stock-service';
import { MOCK_WATCHLIST_TICKERS } from '@/lib/mock-data';

export const revalidate = 15;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tickersParam = searchParams.get('tickers');
    const tickers = tickersParam
      ? tickersParam.split(',').map(t => t.trim().toUpperCase()).slice(0, 30)
      : MOCK_WATCHLIST_TICKERS;

    const quotes = await fetchMultipleQuotes(tickers);
    return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
