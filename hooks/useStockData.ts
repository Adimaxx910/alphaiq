'use client';
// hooks/useStockData.ts
import { useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import type { Timeframe } from '@/types';

// ── Fetch all market quotes ───────────────────────────────────────────────
export function useMarketQuotes(tickers: string[], refreshInterval = 15000) {
  const { setQuotes, setQuotesLoading } = useAppStore();

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`/api/stocks?tickers=${tickers.join(',')}`);
      if (!res.ok) return;
      const { quotes } = await res.json();
      setQuotes(quotes);
    } catch (e) {
      console.error('[quotes]', e);
    }
  }, [tickers.join(',')]);

  useEffect(() => {
    setQuotesLoading(true);
    fetch_().finally(() => setQuotesLoading(false));
    const id = setInterval(fetch_, refreshInterval);
    return () => clearInterval(id);
  }, [fetch_, refreshInterval]);
}

// ── Fetch full analysis for one ticker ───────────────────────────────────
export function useStockAnalysis(ticker: string, timeframe: Timeframe) {
  const { setAnalysis, setAnalysisLoading } = useAppStore();
  const abortRef = useRef<AbortController>();

  const fetch_ = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setAnalysisLoading(true);
    try {
      const res = await fetch(`/api/stocks/${ticker}?tf=${timeframe}`, {
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setAnalysis({
        quote:      data.quote,
        candles:    data.candles,
        indicators: data.indicators,
        sentiment:  data.sentiment,
        signals:    data.signals,
        news:       data.news,
      });
    } catch (e: any) {
      if (e.name !== 'AbortError') console.error('[analysis]', e);
    } finally {
      setAnalysisLoading(false);
    }
  }, [ticker, timeframe]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return { refetch: fetch_ };
}

// ── Watchlist data fetching ───────────────────────────────────────────────
export function useWatchlistData() {
  const { watchlistTickers, setWatchlistQuotes } = useAppStore();

  const fetch_ = useCallback(async () => {
    if (!watchlistTickers.length) return;
    try {
      const res = await fetch(`/api/stocks?tickers=${watchlistTickers.join(',')}`);
      if (!res.ok) return;
      const { quotes } = await res.json();
      setWatchlistQuotes(quotes);
    } catch (e) {
      console.error('[watchlist]', e);
    }
  }, [watchlistTickers.join(',')]);

  useEffect(() => { fetch_(); }, [fetch_]);
}
