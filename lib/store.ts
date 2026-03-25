// lib/store.ts
import { create } from 'zustand';
import type { StockQuote, CandleData, SentimentData, TradeSignal, NewsItem, TechnicalIndicators, Timeframe } from '@/types';
import { MOCK_WATCHLIST_TICKERS } from './mock-data';

interface AnalysisState {
  quote: StockQuote | null;
  candles: CandleData[];
  indicators: TechnicalIndicators | null;
  sentiment: SentimentData | null;
  signals: TradeSignal[];
  news: NewsItem[];
}

interface AppStore {
  // Selected stock
  selectedTicker: string;
  setSelectedTicker: (t: string) => void;

  // Timeframe
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;

  // Market quotes (ticker tape)
  quotes: StockQuote[];
  quotesLoading: boolean;
  setQuotes: (q: StockQuote[]) => void;
  setQuotesLoading: (v: boolean) => void;

  // Analysis for selected stock
  analysis: AnalysisState;
  analysisLoading: boolean;
  setAnalysis: (a: Partial<AnalysisState>) => void;
  setAnalysisLoading: (v: boolean) => void;

  // Watchlist
  watchlistTickers: string[];
  watchlistQuotes: StockQuote[];
  setWatchlistTickers: (t: string[]) => void;
  setWatchlistQuotes: (q: StockQuote[]) => void;
  addToWatchlist: (ticker: string) => void;
  removeFromWatchlist: (ticker: string) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  selectedTicker: 'AAPL',
  setSelectedTicker: ticker => set({ selectedTicker: ticker }),

  timeframe: '1M',
  setTimeframe: tf => set({ timeframe: tf }),

  quotes: [],
  quotesLoading: false,
  setQuotes: quotes => set({ quotes }),
  setQuotesLoading: v => set({ quotesLoading: v }),

  analysis: { quote: null, candles: [], indicators: null, sentiment: null, signals: [], news: [] },
  analysisLoading: false,
  setAnalysis: a => set(s => ({ analysis: { ...s.analysis, ...a } })),
  setAnalysisLoading: v => set({ analysisLoading: v }),

  watchlistTickers: MOCK_WATCHLIST_TICKERS.slice(0, 5),
  watchlistQuotes: [],
  setWatchlistTickers: t => set({ watchlistTickers: t }),
  setWatchlistQuotes: q => set({ watchlistQuotes: q }),
  addToWatchlist: ticker => {
    const { watchlistTickers } = get();
    if (!watchlistTickers.includes(ticker)) {
      set({ watchlistTickers: [...watchlistTickers, ticker] });
    }
  },
  removeFromWatchlist: ticker => set(s => ({
    watchlistTickers: s.watchlistTickers.filter(t => t !== ticker),
    watchlistQuotes:  s.watchlistQuotes.filter(q => q.ticker !== ticker),
  })),
}));
