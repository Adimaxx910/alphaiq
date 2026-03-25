// app/api/watchlist/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fetchMultipleQuotes } from '@/lib/stock-service';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { addedAt: 'desc' },
  });

  const tickers = items.map(i => i.ticker);
  if (!tickers.length) return NextResponse.json({ items: [] });

  const quotes = await fetchMultipleQuotes(tickers);
  const enriched = tickers.map(t => quotes.find(q => q.ticker === t) ?? { ticker: t, price: 0, changePercent: 0 });

  return NextResponse.json({ items: enriched });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ticker } = z.object({ ticker: z.string().min(1).max(10).toUpperCase() }).parse(await req.json());
  const userId = (session.user as any).id;

  // Free plan: max 10 watchlist items
  const plan = (session.user as any).plan ?? 'FREE';
  if (plan === 'FREE') {
    const count = await prisma.watchlistItem.count({ where: { userId } });
    if (count >= 10) {
      return NextResponse.json({ error: 'Watchlist limit reached. Upgrade to Pro.' }, { status: 403 });
    }
  }

  const item = await prisma.watchlistItem.upsert({
    where: { userId_ticker: { userId, ticker } },
    create: { userId, ticker },
    update: {},
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  if (!ticker) return NextResponse.json({ error: 'Missing ticker' }, { status: 400 });

  const userId = (session.user as any).id;
  await prisma.watchlistItem.deleteMany({ where: { userId, ticker } });

  return NextResponse.json({ success: true });
}
