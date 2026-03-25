'use client';
// components/dashboard/SentimentPanel.tsx
import { AlertTriangle, Lightbulb, TrendingDown, TrendingUp, Minus, Lock } from 'lucide-react';
import { cn, sentimentColor, sentimentToLabel } from '@/lib/utils';
import type { SentimentData, TradeSignal, TechnicalIndicators } from '@/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface SentimentPanelProps {
  sentiment: SentimentData | null;
  signals: TradeSignal[];
  indicators: TechnicalIndicators | null;
  ticker: string;
  loading?: boolean;
}

function ConfidenceRing({ value }: { value: number }) {
  const radius = 28;
  const circ   = 2 * Math.PI * radius;
  const dash   = (value / 100) * circ;
  const color  = value >= 75 ? '#00d07a' : value >= 55 ? '#f0b429' : '#ff4560';

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg width="80" height="80" className="confidence-ring">
        <circle cx="40" cy="40" r={radius} stroke="#1a2445" strokeWidth="5" fill="none" />
        <circle
          cx="40" cy="40" r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono" style={{ color }}>{value}%</span>
        <span className="text-[10px] text-muted-foreground">confidence</span>
      </div>
    </div>
  );
}

function SentimentMeter({ score }: { score: number }) {
  const pct = ((score + 1) / 2) * 100; // map -1..1 to 0..100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-bear font-mono">-1.0</span>
        <span className="font-mono font-bold text-sm" style={{ color: score > 0.2 ? '#00d07a' : score < -0.2 ? '#ff4560' : '#f0b429' }}>
          {score > 0 ? '+' : ''}{score.toFixed(2)}
        </span>
        <span className="text-bull font-mono">+1.0</span>
      </div>
      <div className="sentiment-bar">
        <div className="sentiment-needle" style={{ left: `${pct}%` }} />
      </div>
      <p className="text-center text-xs font-medium" style={{ color: score > 0.2 ? '#00d07a' : score < -0.2 ? '#ff4560' : '#f0b429' }}>
        {sentimentToLabel(score)}
      </p>
    </div>
  );
}

function TradeCard({ signal }: { signal: TradeSignal }) {
  return (
    <div className={cn(
      'rounded-xl p-3 border space-y-2',
      signal.type === 'LONG' ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {signal.type === 'LONG'
            ? <TrendingUp className="w-4 h-4 text-bull" />
            : <TrendingDown className="w-4 h-4 text-bear" />
          }
          <span className={cn('text-xs font-bold font-mono', signal.type === 'LONG' ? 'text-bull' : 'text-bear')}>
            {signal.type}
          </span>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-mono font-medium',
          signal.confidence >= 80 ? 'bg-bull/15 text-bull' : 'bg-gold/15 text-gold'
        )}>
          {signal.confidence}% conf
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1 text-center">
        {[
          { label: 'Entry',  value: signal.entry,   color: 'text-foreground' },
          { label: 'Stop',   value: signal.stopLoss, color: 'text-bear'      },
          { label: 'T1',     value: signal.target1,  color: 'text-bull'      },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-black/20 rounded-lg p-1.5">
            <p className="text-[10px] text-muted-foreground">{label}</p>
            <p className={cn('text-xs font-mono font-semibold', color)}>${value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>R:R <span className="text-foreground font-mono">1:{signal.riskReward.toFixed(1)}</span></span>
        <span>T2 <span className="text-bull font-mono">${signal.target2}</span></span>
      </div>
    </div>
  );
}

function TechRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/4 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <span className="text-xs font-mono text-foreground">{value}</span>
        {sub && <span className="text-[10px] text-muted-foreground ml-1.5">{sub}</span>}
      </div>
    </div>
  );
}

export function SentimentPanel({ sentiment, signals, indicators, ticker, loading }: SentimentPanelProps) {
  const { data: session } = useSession();
  const plan = (session?.user as any)?.plan ?? 'FREE';
  const isPro = plan !== 'FREE';

  if (loading) {
    return (
      <div className="h-full p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!sentiment) return null;

  return (
    <div className="h-full overflow-y-auto px-4 py-4 space-y-4 text-sm">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">AI Analysis</h3>
        <span className="text-[10px] text-muted-foreground">
          {new Date(sentiment.updatedAt).toLocaleTimeString()}
        </span>
      </div>

      {/* Sentiment Score + Confidence */}
      <div className="bg-surface-2 rounded-xl p-4 space-y-3 border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sentiment Bias</p>
            <div className="flex items-center gap-2">
              {sentiment.bias === 'BULLISH' && <TrendingUp className="w-4 h-4 text-bull" />}
              {sentiment.bias === 'BEARISH' && <TrendingDown className="w-4 h-4 text-bear" />}
              {sentiment.bias === 'NEUTRAL' && <Minus className="w-4 h-4 text-gold" />}
              <span className={cn(
                'font-display font-bold text-base',
                sentiment.bias === 'BULLISH' ? 'text-bull' : sentiment.bias === 'BEARISH' ? 'text-bear' : 'text-gold'
              )}>
                {sentiment.bias}
              </span>
            </div>
          </div>
          <ConfidenceRing value={sentiment.confidence} />
        </div>

        <SentimentMeter score={sentiment.score} />
      </div>

      {/* Key Risk + Catalyst */}
      <div className="space-y-2">
        <div className="bg-bear/5 border border-bear/15 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-bear shrink-0" />
            <span className="text-xs font-semibold text-bear">Key Risk</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{sentiment.keyRisk}</p>
        </div>

        <div className="bg-bull/5 border border-bull/15 rounded-xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-bull shrink-0" />
            <span className="text-xs font-semibold text-bull">Catalyst</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{sentiment.catalyst}</p>
        </div>
      </div>

      {/* Trade Signals */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trade Signals</h4>
          {!isPro && <span className="text-[10px] text-gold">PRO</span>}
        </div>

        {!isPro ? (
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center space-y-2">
            <Lock className="w-5 h-5 text-gold mx-auto" />
            <p className="text-xs text-muted-foreground">Trade signals require Pro plan</p>
            <Link href="/pricing" className="block text-xs bg-gold text-black font-semibold rounded-lg px-4 py-2 hover:bg-gold/90 transition-colors">
              Upgrade to Pro
            </Link>
          </div>
        ) : signals.length > 0 ? (
          signals.map(s => <TradeCard key={s.id} signal={s} />)
        ) : (
          <div className="rounded-xl border border-white/5 bg-surface-2 p-4 text-center">
            <p className="text-xs text-muted-foreground">No active signals for {ticker}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Conditions: confidence ≥70%, R:R ≥1:2</p>
          </div>
        )}
      </div>

      {/* Technicals Summary */}
      {indicators && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Technicals</h4>
          <div className="bg-surface-2 rounded-xl p-3 border border-white/5">
            <TechRow
              label="RSI (14)"
              value={indicators.rsi.toFixed(1)}
              sub={indicators.rsi >= 70 ? 'Overbought' : indicators.rsi <= 30 ? 'Oversold' : 'Normal'}
            />
            <TechRow
              label="MACD"
              value={indicators.macd > 0 ? `+${indicators.macd.toFixed(3)}` : indicators.macd.toFixed(3)}
              sub={indicators.macd > 0 ? 'Bullish' : 'Bearish'}
            />
            <TechRow label="EMA 20" value={`$${indicators.ema20}`} />
            <TechRow label="EMA 50" value={`$${indicators.ema50}`} />
            <TechRow label="ATR"    value={`$${indicators.atr}`}   sub="volatility" />
            <TechRow label="ADX"    value={indicators.adx.toFixed(1)} sub={indicators.adx > 25 ? 'Trending' : 'Ranging'} />
          </div>
        </div>
      )}
    </div>
  );
}
