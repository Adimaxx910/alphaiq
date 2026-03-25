'use client';
// app/dashboard/page.tsx
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/layout/Navbar';
import { TickerTape } from '@/components/dashboard/TickerTape';
import { StockChart } from '@/components/charts/StockChart';
import { SentimentPanel } from '@/components/dashboard/SentimentPanel';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { StockHeader } from '@/components/dashboard/StockHeader';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { useAppStore } from '@/lib/store';
import { useMarketQuotes, useStockAnalysis, useWatchlistData } from '@/hooks/useStockData';
import { MOCK_WATCHLIST_TICKERS } from '@/lib/mock-data';
import { toast } from '@/components/ui/use-toast';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const {
    selectedTicker, setSelectedTicker,
    timeframe, setTimeframe,
    quotes, quotesLoading,
    analysis, analysisLoading,
    watchlistTickers, watchlistQuotes,
    addToWatchlist, removeFromWatchlist,
  } = useAppStore();

  // Hooks trigger data fetching
  useMarketQuotes(MOCK_WATCHLIST_TICKERS);
  useStockAnalysis(selectedTicker, timeframe);
  useWatchlistData();

  // Show upgrade success toast
  useEffect(() => {
    if (searchParams?.get('upgraded') === 'true') {
      toast({ title: '🎉 Welcome to Pro!', description: 'You now have full access to all AI signals and features.' });
    }
  }, []);

  const inWatchlist = watchlistTickers.includes(selectedTicker);

  const handleToggleWatchlist = async () => {
    if (inWatchlist) {
      removeFromWatchlist(selectedTicker);
      if (session) {
        await fetch(`/api/watchlist?ticker=${selectedTicker}`, { method: 'DELETE' });
      }
      toast({ title: `Removed ${selectedTicker} from watchlist` });
    } else {
      addToWatchlist(selectedTicker);
      if (session) {
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker: selectedTicker }),
        });
        if (!res.ok) {
          const { error } = await res.json();
          toast({ title: 'Error', description: error, variant: 'destructive' });
        }
      }
      toast({ title: `Added ${selectedTicker} to watchlist` });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Ticker tape */}
      <div className="mt-14">
        <TickerTape
          quotes={quotes}
          selected={selectedTicker}
          onSelect={setSelectedTicker}
        />
      </div>

      {/* Main layout: Watchlist | Chart+Tabs | AI Panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: Watchlist ───────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 shrink-0">
          <WatchlistPanel
            watchlist={watchlistQuotes}
            selected={selectedTicker}
            onSelect={setSelectedTicker}
            onAdd={t => { addToWatchlist(t); toast({ title: `Added ${t}` }); }}
            onRemove={removeFromWatchlist}
          />
        </aside>

        {/* ── Center: Chart + Tabs ──────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Stock info bar */}
          <StockHeader
            quote={analysis.quote ?? { ticker: selectedTicker, name: selectedTicker, price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, high52w: 0, low52w: 0, avgVolume: 0 }}
            inWatchlist={inWatchlist}
            onToggleWatchlist={handleToggleWatchlist}
            loading={analysisLoading && !analysis.quote}
          />

          {/* Chart */}
          <div className="flex-1 min-h-0">
            {analysisLoading && !analysis.candles.length ? (
              <div className="h-full shimmer" />
            ) : (
              <StockChart
                data={analysis.candles}
                ticker={selectedTicker}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
              />
            )}
          </div>

          {/* Bottom Tabs */}
          <div className="h-56 border-t border-white/5 overflow-hidden">
            <Tabs defaultValue="news" className="h-full flex flex-col">
              <TabsList className="bg-transparent border-b border-white/5 rounded-none px-4 h-9 gap-4 justify-start shrink-0">
                {['news', 'signals', 'overview'].map(tab => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-xs capitalize data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent pb-0"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="news" className="m-0 h-full">
                  <NewsFeed news={analysis.news} loading={analysisLoading && !analysis.news.length} />
                </TabsContent>

                <TabsContent value="signals" className="m-0 p-4">
                  {analysis.signals.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.signals.map(s => (
                        <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border text-xs ${s.type === 'LONG' ? 'bg-bull/5 border-bull/20' : 'bg-bear/5 border-bear/20'}`}>
                          <span className={s.type === 'LONG' ? 'text-bull font-bold' : 'text-bear font-bold'}>{s.type}</span>
                          <span className="font-mono">Entry: ${s.entry}</span>
                          <span className="font-mono text-bear">SL: ${s.stopLoss}</span>
                          <span className="font-mono text-bull">T1: ${s.target1}</span>
                          <span className="font-mono text-muted-foreground">R:R 1:{s.riskReward}</span>
                          <span className="text-gold font-mono">{s.confidence}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">No active signals. Conditions: confidence ≥70%, R:R ≥1:2</p>
                  )}
                </TabsContent>

                <TabsContent value="overview" className="m-0 p-4">
                  {analysis.quote && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'Market Cap',  value: analysis.quote.marketCap  ? `$${(analysis.quote.marketCap/1e9).toFixed(1)}B` : 'N/A' },
                        { label: 'Volume',      value: analysis.quote.volume     ? `${(analysis.quote.volume/1e6).toFixed(1)}M` : 'N/A' },
                        { label: 'P/E Ratio',   value: analysis.quote.pe         ? analysis.quote.pe.toFixed(1) : 'N/A' },
                        { label: 'EPS',         value: analysis.quote.eps        ? `$${analysis.quote.eps}` : 'N/A' },
                        { label: '52W High',    value: `$${analysis.quote.high52w}` },
                        { label: '52W Low',     value: `$${analysis.quote.low52w}` },
                        { label: 'Sector',      value: analysis.quote.sector ?? 'N/A' },
                        { label: 'RSI',         value: analysis.indicators?.rsi.toFixed(1) ?? 'N/A' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-surface-2 rounded-lg p-2.5 border border-white/5">
                          <p className="text-muted-foreground">{label}</p>
                          <p className="font-mono font-semibold mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>

        {/* ── Right: AI Sentiment Panel ─────────────── */}
        <aside className="hidden xl:flex flex-col w-72 border-l border-white/5 shrink-0">
          <SentimentPanel
            sentiment={analysis.sentiment}
            signals={analysis.signals}
            indicators={analysis.indicators}
            ticker={selectedTicker}
            loading={analysisLoading && !analysis.sentiment}
          />
        </aside>
      </div>
    </div>
  );
}
