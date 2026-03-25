'use client';
// components/dashboard/StockHeader.tsx
import { TrendingUp, TrendingDown, Star, StarOff, Activity } from 'lucide-react';
import { cn, formatPrice, formatPercent, formatMarketCap, formatVolume } from '@/lib/utils';
import type { StockQuote } from '@/types';

interface StockHeaderProps {
  quote: StockQuote;
  inWatchlist: boolean;
  onToggleWatchlist: () => void;
  loading?: boolean;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-xs font-mono text-foreground">{value}</span>
    </div>
  );
}

export function StockHeader({ quote, inWatchlist, onToggleWatchlist, loading }: StockHeaderProps) {
  if (loading) {
    return <div className="h-16 shimmer rounded-lg" />;
  }

  const isUp = quote.changePercent >= 0;

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/5 bg-surface-1">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl text-foreground">{quote.ticker}</h1>
            {quote.sector && (
              <span className="text-[10px] px-2 py-0.5 bg-surface-3 rounded-full text-muted-foreground border border-white/5">
                {quote.sector}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{quote.name}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono font-bold text-2xl text-foreground">{formatPrice(quote.price)}</span>
          <div className={cn('flex items-center gap-1', isUp ? 'text-bull' : 'text-bear')}>
            {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-mono text-sm font-semibold">{formatPercent(quote.changePercent)}</span>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-6">
        <StatPill label="Vol"      value={formatVolume(quote.volume)} />
        <StatPill label="Mkt Cap"  value={formatMarketCap(quote.marketCap)} />
        <StatPill label="52W Hi"   value={formatPrice(quote.high52w)} />
        <StatPill label="52W Lo"   value={formatPrice(quote.low52w)} />
        {quote.pe && <StatPill label="P/E" value={quote.pe.toFixed(1)} />}
      </div>

      <button
        onClick={onToggleWatchlist}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
          inWatchlist
            ? 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20'
            : 'bg-surface-2 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20'
        )}
      >
        {inWatchlist ? <Star className="w-3.5 h-3.5 fill-gold" /> : <StarOff className="w-3.5 h-3.5" />}
        {inWatchlist ? 'Watching' : 'Watch'}
      </button>
    </div>
  );
}
