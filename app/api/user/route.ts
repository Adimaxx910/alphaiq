// app/api/user/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, image: true, plan: true,
      stripeCurrentPeriodEnd: true, createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const schema = z.object({
    name: z.string().min(2).max(60).optional(),
  });
  const body = schema.parse(await req.json());
  const userId = (session.user as any).id;

  const user = await prisma.user.update({
    where: { id: userId },
    data: body,
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user });
}
