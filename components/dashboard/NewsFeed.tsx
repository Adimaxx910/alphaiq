'use client';
// components/dashboard/NewsFeed.tsx
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { NewsItem } from '@/types';
import { cn } from '@/lib/utils';

interface NewsFeedProps {
  news: NewsItem[];
  loading?: boolean;
}

const SentimentIcon = ({ s }: { s: NewsItem['sentiment'] }) => {
  if (s === 'positive') return <TrendingUp  className="w-3 h-3 text-bull shrink-0" />;
  if (s === 'negative') return <TrendingDown className="w-3 h-3 text-bear shrink-0" />;
  return <Minus className="w-3 h-3 text-gold shrink-0" />;
};

export function NewsFeed({ news, loading }: NewsFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 shimmer rounded w-4/5" />
            <div className="h-3 shimmer rounded w-3/5" />
          </div>
        ))}
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        No news available
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {news.map(item => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 p-4 hover:bg-white/3 transition-colors group"
        >
          <div className="mt-0.5">
            <SentimentIcon s={item.sentiment} />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {item.headline}
            </p>
            {item.summary && (
              <p className="text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
            )}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="font-medium">{item.source}</span>
              <span>·</span>
              <span>{formatTime(item.publishedAt)}</span>
            </div>
          </div>

          <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
        </a>
      ))}
    </div>
  );
}
