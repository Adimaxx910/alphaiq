'use client';
// components/dashboard/TickerTape.tsx
import { useEffect, useState } from 'react';
import { cn, formatPrice, formatPercent } from '@/lib/utils';
import type { StockQuote } from '@/types';

interface TickerTapeProps {
  quotes: StockQuote[];
  onSelect: (ticker: string) => void;
  selected: string;
}

export function TickerTape({ quotes, onSelect, selected }: TickerTapeProps) {
  const doubled = [...quotes, ...quotes]; // seamless loop

  return (
    <div className="h-10 bg-surface-1 border-b border-white/5 overflow-hidden relative">
      <div className="ticker-wrap h-full">
        <div className="ticker-content h-full items-center">
          {doubled.map((q, i) => (
            <button
              key={`${q.ticker}-${i}`}
              onClick={() => onSelect(q.ticker)}
              className={cn(
                'inline-flex items-center gap-3 px-4 h-full border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer shrink-0 group',
                selected === q.ticker && 'bg-primary/10'
              )}
            >
              <span className={cn(
                'text-xs font-mono font-bold tracking-wider',
                selected === q.ticker ? 'text-primary' : 'text-foreground'
              )}>
                {q.ticker}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {formatPrice(q.price)}
              </span>
              <span className={cn(
                'text-xs font-mono font-medium',
                q.changePercent >= 0 ? 'text-bull' : 'text-bear'
              )}>
                {formatPercent(q.changePercent)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Live price flash hook ─────────────────────────────────────────────────
export function usePriceFlash(price: number) {
  const [flashClass, setFlashClass] = useState('');
  const [prev, setPrev] = useState(price);

  useEffect(() => {
    if (price === prev) return;
    setFlashClass(price > prev ? 'flash-green' : 'flash-red');
    setPrev(price);
    const t = setTimeout(() => setFlashClass(''), 600);
    return () => clearTimeout(t);
  }, [price]);

  return flashClass;
}
