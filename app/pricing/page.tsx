'use client';
// app/pricing/page.tsx
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Loader2, Zap, Lock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  '5 stocks in watchlist',
  'Basic price charts',
  'Timeframe: 1M, 1Y',
  'News feed',
  'Community access',
];

const PRO_FEATURES = [
  'Unlimited stocks',
  'AI sentiment scoring (score, bias, risk, catalyst)',
  'Trade signals with Entry / SL / Targets',
  'All timeframes (1D, 1W, 1M, 3M, 1Y)',
  'Technical indicators (RSI, MACD, EMA, ATR)',
  'Confidence model (0–100%)',
  'Unlimited watchlist',
  'Price alerts',
  'Historical signals',
  'Priority support',
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const plan = (session?.user as any)?.plan ?? 'FREE';

  const handleUpgrade = async () => {
    if (!session) { router.push('/auth/signup'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else alert(error ?? 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl font-bold mb-4">Simple Pricing</h1>
            <p className="text-muted-foreground text-lg">Start free. Upgrade when you need the edge.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Free plan */}
            <div className="bg-surface-1 border border-white/8 rounded-2xl p-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Always free. No credit card.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan === 'FREE' ? (
                <div className="w-full py-3 rounded-xl border border-white/10 text-center text-sm font-medium text-muted-foreground">
                  Current Plan
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="block w-full py-3 rounded-xl border border-white/10 text-center text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>

            {/* Pro plan */}
            <div className="relative bg-surface-1 border-2 border-primary/40 rounded-2xl p-8 shadow-2xl shadow-primary/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                MOST POPULAR
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground">Pro</p>
                  <Zap className="w-3.5 h-3.5 text-gold" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Full AI-powered analysis.</p>
              </div>

              <ul className="space-y-3 mb-8">
                {PRO_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {plan === 'PRO' || plan === 'ENTERPRISE' ? (
                <div className="w-full py-3 rounded-xl bg-primary/10 border border-primary/30 text-center text-sm font-medium text-primary">
                  ✓ Active Plan
                </div>
              ) : (
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Zap className="w-4 h-4" /> Upgrade to Pro</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'How are signals generated?', a: 'Signals are generated by our 7-layer pipeline: data ingestion → technical analysis → sentiment scoring → confidence model → trade generation. Signals only appear when confidence ≥70% and risk:reward ≥1:2.' },
                { q: 'What is the sentiment score?', a: 'Sentiment scores range from -1.0 (extreme bearish) to +1.0 (extreme bullish). It is calculated by combining technical indicators, news sentiment, and market structure using our AI model.' },
                { q: 'Can I cancel anytime?', a: 'Yes. Your Pro plan is a monthly subscription. Cancel anytime and you retain Pro access until the end of your billing period.' },
                { q: 'Is this financial advice?', a: 'No. AlphaIQ provides analytical tools and information only. Always do your own research and consult a financial advisor before making investment decisions.' },
              ].map(({ q, a }) => (
                <div key={q} className="bg-surface-1 border border-white/5 rounded-xl p-5">
                  <h3 className="font-semibold text-sm mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
