// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Demo user
  const pw = await bcrypt.hash('demo1234', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@alphaiq.ai' },
    update: {},
    create: {
      email: 'demo@alphaiq.ai',
      name: 'Demo Trader',
      password: pw,
      plan: 'PRO',
    },
  });
  console.log('✅ Demo user:', user.email);

  // Sample watchlist
  const tickers = ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'META'];
  for (const ticker of tickers) {
    await prisma.watchlistItem.upsert({
      where: { userId_ticker: { userId: user.id, ticker } },
      update: {},
      create: { userId: user.id, ticker },
    });
  }
  console.log('✅ Watchlist seeded');

  // Sample signals
  const signals = [
    { ticker: 'NVDA', type: 'LONG' as const, entry: 862.50, stopLoss: 835.20, target1: 916.60, target2: 970.70, confidence: 88, status: 'ACTIVE' as const },
    { ticker: 'AAPL', type: 'LONG' as const, entry: 187.50, stopLoss: 182.10, target1: 198.30, target2: 209.10, confidence: 76, status: 'HIT_TARGET1' as const },
    { ticker: 'TSLA', type: 'SHORT' as const, entry: 252.30, stopLoss: 263.80, target1: 229.60, target2: 206.90, confidence: 71, status: 'ACTIVE' as const },
  ];

  for (const s of signals) {
    const riskReward = (s.target1 - s.entry) / (s.entry - s.stopLoss);
    await prisma.signal.create({
      data: { ...s, riskReward: +riskReward.toFixed(2) } as any,
    });
  }
  console.log('✅ Sample signals seeded');

  // Sample sentiment snapshots
  const sentiments = [
    { ticker: 'NVDA', score: 0.88, bias: 'BULLISH' as const, keyRisk: 'Export restrictions limit revenue ceiling', catalyst: 'Blackwell GPU backlog exceeds 12-month supply', confidence: 91 },
    { ticker: 'AAPL', score: 0.62, bias: 'BULLISH' as const, keyRisk: 'China demand slowdown weighing on hardware', catalyst: 'Services revenue and Vision Pro ecosystem expansion', confidence: 78 },
    { ticker: 'TSLA', score: -0.34, bias: 'BEARISH' as const, keyRisk: 'EV price war eroding gross margins', catalyst: 'FSD commercialization timeline uncertain', confidence: 65 },
  ];

  for (const s of sentiments) {
    await prisma.sentimentSnapshot.create({ data: s });
  }
  console.log('✅ Sentiment snapshots seeded');

  console.log('\n🎉 Seed complete!\n');
  console.log('Demo login: demo@alphaiq.ai / demo1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
