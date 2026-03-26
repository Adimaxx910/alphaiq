'use client';

import { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
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
import { useToast } from '@/components/ui/use-toast';

// 🔥 INNER COMPONENT (uses searchParams)
function DashboardContent() {
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

  useMarketQuotes(MOCK_WATCHLIST_TICKERS);
  useStockAnalysis(selectedTicker, timeframe);
  useWatchlistData();

  useEffect(() => {
    if (searchParams?.get('upgraded') === 'true') {
      toast({ title: '🎉 Welcome to Pro!', description: 'You now have full access to all AI signals and features.' });
    }
  }, [searchParams, toast]);

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

      <div className="mt-14">
        <TickerTape
          quotes={quotes}
          selected={selectedTicker}
          onSelect={setSelectedTicker}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        <aside className="hidden lg:flex flex-col w-56 border-r border-white/5 shrink-0">
          <WatchlistPanel
            watchlist={watchlistQuotes}
            selected={selectedTicker}
            onSelect={setSelectedTicker}
            onAdd={t => { addToWatchlist(t); toast({ title: `Added ${t}` }); }}
            onRemove={removeFromWatchlist}
          />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <StockHeader
            quote={analysis.quote ?? { ticker: selectedTicker, name: selectedTicker, price: 0, change: 0, changePercent: 0, volume: 0, marketCap: 0, high52w: 0, low52w: 0, avgVolume: 0 }}
            inWatchlist={inWatchlist}
            onToggleWatchlist={handleToggleWatchlist}
            loading={analysisLoading && !analysis.quote}
          />

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

          <div className="h-56 border-t border-white/5 overflow-hidden">
            <Tabs defaultValue="news" className="h-full flex flex-col">
              <TabsList className="bg-transparent border-b border-white/5 rounded-none px-4 h-9 gap-4 justify-start shrink-0">
                {['news', 'signals', 'overview'].map(tab => (
                  <TabsTrigger key={tab} value={tab} className="text-xs capitalize data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent pb-0">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="news" className="m-0 h-full">
                  <NewsFeed news={analysis.news} loading={analysisLoading && !analysis.news.length} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>

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

// 🔥 OUTER WRAPPER (FIX)
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}