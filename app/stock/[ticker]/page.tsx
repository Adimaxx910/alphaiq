'use client';
// app/stock/[ticker]/page.tsx
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { StockChart } from '@/components/charts/StockChart';
import { SentimentPanel } from '@/components/dashboard/SentimentPanel';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { StockHeader } from '@/components/dashboard/StockHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import type { Timeframe } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const router = useRouter();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tf, setTf]         = useState<Timeframe>('1M');
  const [inWatchlist, setInWatchlist] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker.toUpperCase()}?tf=${tf}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [ticker, tf]);

  const handleToggleWatchlist = async () => {
    if (inWatchlist) {
      await fetch(`/api/watchlist?ticker=${ticker}`, { method: 'DELETE' });
      setInWatchlist(false);
    } else {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker }),
      });
      setInWatchlist(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14">
        {/* Back button */}
        <div className="border-b border-white/5 px-4 py-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Stock header */}
        {data?.quote && (
          <StockHeader
            quote={data.quote}
            inWatchlist={inWatchlist}
            onToggleWatchlist={handleToggleWatchlist}
            loading={false}
          />
        )}

        <div className="flex flex-col xl:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Chart */}
            <div className="h-[420px] border-b border-white/5">
              {loading && !data ? (
                <div className="h-full shimmer" />
              ) : (
                <StockChart
                  data={data?.candles ?? []}
                  ticker={ticker.toUpperCase()}
                  timeframe={tf}
                  onTimeframeChange={setTf}
                />
              )}
            </div>

            {/* Detail tabs */}
            <Tabs defaultValue="overview" className="p-4">
              <TabsList className="bg-surface-2 border border-white/5 h-9 gap-1">
                {['overview', 'technicals', 'news', 'signals'].map(tab => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-xs capitalize data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-md px-4"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                {data?.quote && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Market Cap',   value: data.quote.marketCap ? `$${(data.quote.marketCap/1e9).toFixed(1)}B` : '—' },
                      { label: 'Volume',       value: data.quote.volume ? `${(data.quote.volume/1e6).toFixed(1)}M` : '—' },
                      { label: 'Avg Volume',   value: data.quote.avgVolume ? `${(data.quote.avgVolume/1e6).toFixed(1)}M` : '—' },
                      { label: 'P/E Ratio',    value: data.quote.pe ? data.quote.pe.toFixed(1) : '—' },
                      { label: 'EPS',          value: data.quote.eps ? `$${data.quote.eps}` : '—' },
                      { label: '52W High',     value: formatPrice(data.quote.high52w) },
                      { label: '52W Low',      value: formatPrice(data.quote.low52w) },
                      { label: 'Sector',       value: data.quote.sector ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-2 border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-mono font-semibold mt-1">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="technicals" className="mt-4">
                {data?.indicators && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { label: 'RSI (14)',       value: data.indicators.rsi.toFixed(1),   note: data.indicators.rsi > 70 ? 'Overbought' : data.indicators.rsi < 30 ? 'Oversold' : 'Normal' },
                      { label: 'MACD',           value: data.indicators.macd.toFixed(4),  note: data.indicators.macd > 0 ? 'Bullish' : 'Bearish' },
                      { label: 'MACD Signal',    value: data.indicators.macdSignal.toFixed(4) },
                      { label: 'EMA 20',         value: formatPrice(data.indicators.ema20) },
                      { label: 'EMA 50',         value: formatPrice(data.indicators.ema50) },
                      { label: 'EMA 200',        value: formatPrice(data.indicators.ema200) },
                      { label: 'ATR',            value: formatPrice(data.indicators.atr),  note: 'volatility' },
                      { label: 'BB Upper',       value: formatPrice(data.indicators.bbUpper) },
                      { label: 'BB Lower',       value: formatPrice(data.indicators.bbLower) },
                      { label: 'ADX',            value: data.indicators.adx.toFixed(1),   note: data.indicators.adx > 25 ? 'Trending' : 'Ranging' },
                      { label: 'Stoch %K',       value: data.indicators.stochK.toFixed(1) },
                      { label: 'Stoch %D',       value: data.indicators.stochD.toFixed(1) },
                    ].map(({ label, value, note }) => (
                      <div key={label} className="bg-surface-2 border border-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className="text-sm font-mono font-semibold">{value}</p>
                          {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="news" className="mt-4">
                <div className="bg-surface-1 border border-white/5 rounded-xl overflow-hidden">
                  <NewsFeed news={data?.news ?? []} loading={loading && !data} />
                </div>
              </TabsContent>

              <TabsContent value="signals" className="mt-4">
                {data?.signals?.length > 0 ? (
                  <div className="space-y-3">
                    {data.signals.map((s: any) => (
                      <div key={s.id} className={cn(
                        'rounded-xl border p-4 grid grid-cols-2 md:grid-cols-5 gap-4',
                        s.type === 'LONG' ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20'
                      )}>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Type</p>
                          <div className="flex items-center gap-1 mt-1">
                            {s.type === 'LONG' ? <TrendingUp className="w-3.5 h-3.5 text-bull" /> : <TrendingDown className="w-3.5 h-3.5 text-bear" />}
                            <span className={cn('text-sm font-bold', s.type === 'LONG' ? 'text-bull' : 'text-bear')}>{s.type}</span>
                          </div>
                        </div>
                        {[
                          { label: 'Entry',       value: formatPrice(s.entry),    color: '' },
                          { label: 'Stop Loss',   value: formatPrice(s.stopLoss), color: 'text-bear' },
                          { label: 'Target 1',    value: formatPrice(s.target1),  color: 'text-bull' },
                          { label: 'Confidence',  value: `${s.confidence}%`,      color: 'text-gold' },
                        ].map(({ label, value, color }) => (
                          <div key={label}>
                            <p className="text-[10px] text-muted-foreground">{label}</p>
                            <p className={cn('text-sm font-mono font-semibold mt-1', color)}>{value}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No active signals. Conditions: confidence ≥70%, R:R ≥1:2
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right panel: AI insights */}
          <aside className="xl:w-72 xl:border-l border-t xl:border-t-0 border-white/5 shrink-0">
            <SentimentPanel
              sentiment={data?.sentiment ?? null}
              signals={data?.signals ?? []}
              indicators={data?.indicators ?? null}
              ticker={ticker.toUpperCase()}
              loading={loading && !data}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
