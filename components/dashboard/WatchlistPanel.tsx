'use client';
// components/dashboard/WatchlistPanel.tsx
import { useState } from 'react';
import { Plus, Star, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { cn, formatPrice, formatPercent } from '@/lib/utils';
import type { StockQuote } from '@/types';
import { useSession } from 'next-auth/react';

interface WatchlistPanelProps {
  watchlist: StockQuote[];
  selected: string;
  onSelect: (ticker: string) => void;
  onAdd: (ticker: string) => void;
  onRemove: (ticker: string) => void;
  loading?: boolean;
}

export function WatchlistPanel({ watchlist, selected, onSelect, onAdd, onRemove, loading }: WatchlistPanelProps) {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const { data: session } = useSession();

  const handleAdd = () => {
    const t = input.trim().toUpperCase();
    if (t.length < 1 || t.length > 10) return;
    onAdd(t);
    setInput('');
    setAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-gold" />
          <span className="text-sm font-semibold">Watchlist</span>
        </div>
        <button
          onClick={() => setAdding(v => !v)}
          className="p-1 rounded-md hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
        >
          {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      {adding && (
        <div className="px-3 py-2 border-b border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="AAPL"
              maxLength={10}
              className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          {!session && (
            <p className="text-[10px] text-muted-foreground mt-1.5">Sign in to save your watchlist</p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 shimmer rounded-lg" />
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-xs">
            <p>No stocks in watchlist</p>
            <p className="mt-1">Click + to add stocks</p>
          </div>
        ) : (
          <div className="py-1">
            {watchlist.map(q => (
              <button
                key={q.ticker}
                onClick={() => onSelect(q.ticker)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 group hover:bg-white/5 transition-colors',
                  selected === q.ticker && 'bg-primary/10 border-l-2 border-primary'
                )}
              >
                <div className="text-left">
                  <p className={cn('text-sm font-mono font-bold', selected === q.ticker ? 'text-primary' : 'text-foreground')}>
                    {q.ticker}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">{q.name ?? q.ticker}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-xs font-mono">{formatPrice(q.price)}</p>
                    <div className="flex items-center justify-end gap-0.5">
                      {q.changePercent >= 0
                        ? <ChevronUp className="w-3 h-3 text-bull" />
                        : <ChevronDown className="w-3 h-3 text-bear" />
                      }
                      <p className={cn('text-[10px] font-mono', q.changePercent >= 0 ? 'text-bull' : 'text-bear')}>
                        {Math.abs(q.changePercent).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onRemove(q.ticker); }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-bear/20 text-muted-foreground hover:text-bear transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
