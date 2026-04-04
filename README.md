# AlphaIQ — AI-Powered Stock Intelligence Platform

> Production-ready quantitative trading intelligence platform built with Next.js 14, Prisma, Stripe, and an AI sentiment engine.

---

## 🚀 Live Demo

- **Demo login**: `demo@alphaiq.ai` / `demo1234`
- **Free tier**: 5 stocks, basic charts, news feed
- **Pro tier**: Full AI insights, trade signals, unlimited watchlist

---

## 🏗️ Architecture Overview

```
AlphaIQ
├── Frontend          Next.js 14 App Router + Tailwind CSS
├── Backend           Next.js API Routes (serverless)
├── Database          PostgreSQL via Prisma ORM
├── Auth              NextAuth.js (Credentials + Google OAuth)
├── Payments          Stripe Subscriptions
├── AI Engine         Anthropic API (claude-sonnet-4) with fallback
└── Data Layer        Polygon.io / Finnhub / Alpha Vantage + mock fallback
```

### 7-Layer Pipeline

```
1. Data Ingestion      → fetchQuote(), fetchCandles() (Polygon/Finnhub)
2. Technical Analysis  → calcIndicators() (RSI, MACD, EMA, ATR, BB)
3. Sentiment Scoring   → scoreSentiment() (Anthropic Claude)
4. Confidence Model    → longConfidence / shortConfidence scoring
5. Trade Generation    → generateSignals() (ATR-based SL/TP)
6. DB Storage          → Prisma → PostgreSQL (signals, sentiment snapshots)
7. Notifications       → Telegram webhook (placeholder)
```

---

## 📦 Project Structure

```
alphaiq/
├── app/
│   ├── page.tsx                    Landing page
│   ├── dashboard/page.tsx          Main trading dashboard
│   ├── stock/[ticker]/page.tsx     Stock detail page
│   ├── learn/page.tsx              Education (RSI, MACD, EMA, Risk)
│   ├── pricing/page.tsx            Pricing + Stripe checkout
│   ├── settings/page.tsx           User profile + subscription
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   └── api/
│       ├── stocks/route.ts         GET /api/stocks?tickers=AAPL,MSFT
│       ├── stocks/[ticker]/route.ts GET /api/stocks/:ticker?tf=1M
│       ├── sentiment/route.ts      GET /api/sentiment?ticker=AAPL
│       ├── signals/route.ts        GET /api/signals?ticker=AAPL (Pro)
│       ├── watchlist/route.ts      GET/POST/DELETE /api/watchlist
│       ├── user/route.ts           GET/PATCH /api/user
│       ├── auth/[...nextauth]/     NextAuth handler
│       ├── auth/signup/            User registration
│       └── stripe/
│           ├── checkout/           Create Stripe checkout session
│           ├── portal/             Stripe billing portal
│           └── webhook/            Stripe event handler
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AuthProvider.tsx
│   ├── dashboard/
│   │   ├── TickerTape.tsx          Scrolling price ticker
│   │   ├── SentimentPanel.tsx      AI insights right panel
│   │   ├── WatchlistPanel.tsx      Left sidebar watchlist
│   │   ├── StockHeader.tsx         Price + stats bar
│   │   └── NewsFeed.tsx            News with sentiment badges
│   ├── charts/
│   │   └── StockChart.tsx          Recharts area + volume + EMA
│   └── ui/
│       ├── tabs.tsx
│       ├── toaster.tsx
│       └── use-toast.ts
├── lib/
│   ├── stock-service.ts            API abstraction + technical calcs
│   ├── sentiment-engine.ts         AI scoring + signal generator
│   ├── mock-data.ts                Fallback data for all stocks
│   ├── auth.ts                     NextAuth config
│   ├── prisma.ts                   Prisma singleton
│   ├── store.ts                    Zustand global state
│   └── utils.ts                    Formatters + helpers
├── hooks/
│   └── useStockData.ts             Data fetching hooks
├── types/
│   └── index.ts                    Full TypeScript types
├── prisma/
│   ├── schema.prisma               Full DB schema
│   └── seed.ts                     Demo data seeder
├── middleware.ts                   Rate limiting + auth guard
└── .env.example                    All required env vars
```

---

## ⚡ Quick Start (Local)

### 1. Clone and install

```bash
git clone https://github.com/your-org/alphaiq.git
cd alphaiq
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET (min 32 chars), and any API keys
```

Minimum required to run with mock data:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="any-32-char-string-here-1234567890"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up database

```bash
npx prisma db push       # Create tables
npx prisma generate      # Generate client
npx prisma db seed       # Seed demo data
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment (Vercel + Railway)

### Database Setup (Railway)

1. Go to [railway.app](https://railway.app) → New Project → PostgreSQL
2. Copy the `DATABASE_URL` from Railway dashboard
3. Add to Vercel environment variables

### Vercel Deployment

```bash
npm i -g vercel
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL          # your-app.vercel.app
vercel env add NEXT_PUBLIC_APP_URL
```

After deploy, run migrations:
```bash
DATABASE_URL="your-prod-url" npx prisma migrate deploy
DATABASE_URL="your-prod-url" npx prisma db seed
```

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Create a product → recurring → $29/month
3. Copy Price ID → `STRIPE_PRO_PRICE_ID`
4. Add webhook endpoint: `https://your-app.vercel.app/api/stripe/webhook`
5. Events to listen: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`
6. Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### Stock Data APIs (optional, falls back to mock)

| Provider | Free Tier | Best For |
|----------|-----------|----------|
| [Finnhub](https://finnhub.io) | 60 req/min | Real-time quotes + candles |
| [Polygon.io](https://polygon.io) | Delayed data | Aggregates + snapshots |
| [Alpha Vantage](https://alphavantage.co) | 25 req/day | Fundamentals |
| [NewsAPI](https://newsapi.org) | 100 req/day | News headlines |

### Google OAuth (optional)

1. Google Cloud Console → New Project → OAuth 2.0 credentials
2. Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

## 🧬 Future Roadmap

These placeholders are ready for implementation:

| Feature | Location | Notes |
|---------|----------|-------|
| Broker API / Auto-trading | `lib/broker-service.ts` | Alpaca, Zerodha Kite |
| Backtesting Engine | `app/api/backtest/` | Historical signal replay |
| AI Self-learning Weights | `lib/sentiment-engine.ts` | Feedback loop from outcomes |
| Portfolio Tracker | `app/portfolio/` | P&L, positions, risk metrics |
| Telegram Notifications | `lib/notification-service.ts` | Signal alerts via bot |
| Mobile App | React Native | Shared API layer |
| WebSocket Live Prices | `app/api/ws/` | Upgrade polling to streaming |
| Redis Caching | `lib/cache.ts` | Replace Next.js revalidate |

---

## 🔐 Security

- Passwords hashed with bcrypt (cost factor 12)
- JWT sessions with `NEXTAUTH_SECRET`
- API rate limiting (60 req/min per IP) in middleware
- Input validation with Zod on all mutations
- Stripe webhook signature verification
- Environment variables never exposed to client (only `NEXT_PUBLIC_*`)

---

## 📊 Signal Rules

```
LONG signal conditions:
  ✓ Sentiment bias = BULLISH
  ✓ RSI < 65 (not overbought)
  ✓ Price > EMA20
  ✓ Price > EMA50
  ✓ MACD > 0

Combined confidence = (sentiment.confidence × 0.6) + (conditions_met/5 × 40)
Signal fires only if: confidence ≥ 70% AND R:R ≥ 1:2

Stop Loss = Entry - (1.5 × ATR)
Target 1  = Entry + (2 × Risk)
Target 2  = Entry + (4 × Risk)
```

---

## ⚠️ Disclaimer

AlphaIQ is for informational and educational purposes only. It does not constitute financial advice. Past performance does not guarantee future results. Always do your own research.

---

MIT License © 2024 AlphaIQ
