// app/api/signals/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const plan = (session.user as any).plan ?? 'FREE';
  if (plan === 'FREE') {
    return NextResponse.json({ error: 'Pro plan required', upgrade: true }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const limit  = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

  const signals = await prisma.signal.findMany({
    where: ticker ? { ticker } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ signals });
}
