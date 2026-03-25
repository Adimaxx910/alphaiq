'use client';
// app/page.tsx
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, BarChart2, Brain, Lock, Shield, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Sentiment Analysis',
    description: 'Real-time sentiment scoring from -1.0 to +1.0 powered by large language models processing news, technicals, and market structure.',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
  },
  {
    icon: TrendingUp,
    title: 'High-Probability Signals',
    description: 'Trade signals generated only when confidence ≥70% and R:R ≥1:2. Entry, stop-loss, and dual targets calculated using ATR.',
    color: 'text-gold',
    bg: 'bg-gold/10 border-gold/20',
  },
  {
    icon: BarChart2,
    title: '7-Layer Pipeline',
    description: 'Data ingestion → Technical analysis → Sentiment → Confidence model → Signal generation → Storage → Notifications.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
  {
    icon: Zap,
    title: 'Real-Time Data',
    description: 'Live price feeds with sub-15s latency. Interactive charts with EMA, MACD, RSI, Bollinger Bands, and ATR overlays.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: Shield,
    title: 'Risk Management',
    description: 'Position sizing, risk:reward calculation, and stop-loss levels baked into every signal. Never trade blind again.',
    color: 'text-bear',
    bg: 'bg-bear/10 border-bear/20',
  },
  {
    icon: Lock,
    title: 'Institutional Grade',
    description: 'Same analytical framework used by quant funds — confidence models, multi-factor scoring, systematic signal rules.',
    color: 'text-bull',
    bg: 'bg-bull/10 border-bull/20',
  },
];

const STATS = [
  { value: '7', label: 'Pipeline Layers' },
  { value: '70%+', label: 'Min. Confidence' },
  { value: '1:2', label: 'Min. Risk:Reward' },
  { value: '<500ms', label: 'API Response' },
];

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-primary/8 blur-[120px] rounded-full" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-gold/5 blur-[100px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Stock Intelligence Platform
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.05] mb-6">
            Trade With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Machine Intelligence
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time sentiment analysis, quantitative trade signals, and institutional-grade insights.
            Built for serious traders who demand an edge.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={session ? '/dashboard' : '/auth/signup'}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              {session ? 'Go to Dashboard' : 'Start Free'}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-8 py-4 bg-surface-2 border border-white/10 text-foreground rounded-xl font-semibold text-lg hover:bg-surface-3 transition-colors"
            >
              View Pricing
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-surface-1 border border-white/5 rounded-xl p-4">
                <p className="font-display font-bold text-2xl text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">Everything You Need to Trade Smarter</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A complete quantitative trading intelligence platform, not just another charting tool.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
              <div key={title} className={cn('rounded-2xl p-6 border', bg)}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', bg)}>
                  <Icon className={cn('w-5 h-5', color)} />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sentiment example ────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5 bg-surface-1/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">AI Sentiment Output</h2>
            <p className="text-muted-foreground">Exactly what you see for every stock, in real-time</p>
          </div>

          <div className="bg-surface-1 border border-white/8 rounded-2xl p-8 font-mono text-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-bear/80" />
              <div className="w-3 h-3 rounded-full bg-gold/80" />
              <div className="w-3 h-3 rounded-full bg-bull/80" />
              <span className="text-muted-foreground ml-2 text-xs">sentiment_output.json</span>
            </div>
            <pre className="text-sm leading-loose">
{`{
  `}<span className="text-blue-400">"ticker"</span>{`:     `}<span className="text-gold">"NVDA"</span>{`,
  `}<span className="text-blue-400">"score"</span>{`:      `}<span className="text-bull">+0.88</span>{`,
  `}<span className="text-blue-400">"bias"</span>{`:       `}<span className="text-bull">"BULLISH"</span>{`,
  `}<span className="text-blue-400">"keyRisk"</span>{`:    `}<span className="text-bear">"Export restrictions limit China revenue ceiling"</span>{`,
  `}<span className="text-blue-400">"catalyst"</span>{`:   `}<span className="text-primary">"Blackwell GPU backlog exceeds 12-month supply"</span>{`,
  `}<span className="text-blue-400">"confidence"</span>{`: `}<span className="text-gold">91</span>
{`}`}
            </pre>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-4">Start Trading with an Edge</h2>
          <p className="text-muted-foreground text-lg mb-8">Free tier available. No credit card required.</p>
          <Link
            href={session ? '/dashboard' : '/auth/signup'}
            className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors shadow-xl shadow-primary/20"
          >
            {session ? 'Open Dashboard' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center text-xs text-muted-foreground">
        <p>AlphaIQ is for informational purposes only. Not financial advice.</p>
        <p className="mt-1">© {new Date().getFullYear()} AlphaIQ. All rights reserved.</p>
      </footer>
    </div>
  );
}
