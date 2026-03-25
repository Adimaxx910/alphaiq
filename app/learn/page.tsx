'use client';
// app/learn/page.tsx
import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import { BookOpen, BarChart2, TrendingUp, Shield, Brain, ChevronDown } from 'lucide-react';

const LESSONS = [
  {
    id: 'rsi',
    icon: BarChart2,
    title: 'Relative Strength Index (RSI)',
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/20',
    summary: 'A momentum oscillator measuring the speed and change of price movements.',
    content: `
## What is RSI?

RSI (Relative Strength Index) is a momentum indicator developed by J. Welles Wilder in 1978. It measures the speed and magnitude of price changes on a scale of 0 to 100.

## How is it calculated?

RSI = 100 - [100 / (1 + RS)]

Where RS = Average Gain / Average Loss over the lookback period (typically 14 periods).

## Key Levels

| Level | Signal | Interpretation |
|-------|--------|----------------|
| >70 | Overbought | Price may be due for a pullback |
| 50-70 | Bullish Zone | Upward momentum |
| 30-50 | Bearish Zone | Downward momentum |
| <30 | Oversold | Price may be due for a bounce |

## AlphaIQ Usage

AlphaIQ uses RSI as part of the confidence model. An RSI above 70 reduces confidence in long signals. An RSI below 30 reduces confidence in short signals. RSI divergences are also detected for early reversal signals.

## Pro Tips

- **Divergence**: When price makes a new high but RSI doesn't — bearish divergence warning
- **Trend context**: In strong uptrends, RSI can stay above 70 for extended periods
- **Period**: 14-period RSI is standard; shorter periods are more sensitive
    `,
  },
  {
    id: 'macd',
    icon: TrendingUp,
    title: 'MACD — Moving Average Convergence Divergence',
    color: 'text-gold',
    bg: 'bg-gold/10 border-gold/20',
    summary: 'A trend-following momentum indicator showing the relationship between two EMAs.',
    content: `
## What is MACD?

MACD (Moving Average Convergence Divergence) was developed by Gerald Appel in the late 1970s. It shows the relationship between two exponential moving averages of price.

## Components

- **MACD Line** = EMA(12) - EMA(26)
- **Signal Line** = EMA(9) of the MACD Line
- **Histogram** = MACD Line - Signal Line

## Signals

| Signal | Condition | Interpretation |
|--------|-----------|----------------|
| Bullish Crossover | MACD crosses above Signal | Buy signal |
| Bearish Crossover | MACD crosses below Signal | Sell signal |
| Zero Cross Up | MACD crosses above 0 | Momentum turning bullish |
| Zero Cross Down | MACD crosses below 0 | Momentum turning bearish |

## AlphaIQ Usage

A positive MACD line is one of the conditions checked in our long signal generator. Combined with RSI and price-vs-EMA conditions, MACD crossovers contribute to the confidence score.

## Pro Tips

- MACD works best in trending markets — avoid using in sideways/ranging conditions
- Histogram bars decreasing in size (even if negative) can signal weakening momentum
- Use MACD on higher timeframes to avoid false signals
    `,
  },
  {
    id: 'ema',
    icon: TrendingUp,
    title: 'Exponential Moving Averages (EMA)',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
    summary: 'Dynamic support and resistance levels that react faster to recent price changes.',
    content: `
## What is an EMA?

An EMA (Exponential Moving Average) gives more weight to recent prices compared to a Simple Moving Average (SMA). It reacts faster to price changes.

## Key EMAs in AlphaIQ

| EMA | Use Case |
|-----|----------|
| EMA 20 | Short-term trend, dynamic support in uptrends |
| EMA 50 | Medium-term trend, key institutional level |
| EMA 200 | Long-term trend, "golden cross" / "death cross" signals |

## The Golden Cross & Death Cross

- **Golden Cross**: EMA 50 crosses above EMA 200 → Strong bullish signal
- **Death Cross**: EMA 50 crosses below EMA 200 → Strong bearish signal

These are major signals watched by institutional traders globally.

## Price vs EMA Conditions

In AlphaIQ's signal engine:
- Price > EMA20 = Bullish condition ✓
- Price > EMA50 = Bullish condition ✓
- Price above all three EMAs in order (20>50>200) = Strong uptrend

## Pro Tips

- Use multiple EMAs to confirm trend strength
- EMA crossovers work better in trending markets
- EMA 200 acts as "the last line of defense" — a decisive break is significant
    `,
  },
  {
    id: 'risk',
    icon: Shield,
    title: 'Risk Management & Position Sizing',
    color: 'text-bear',
    bg: 'bg-bear/10 border-bear/20',
    summary: 'The foundation of consistent profitability — how to size positions and define risk.',
    content: `
## The Golden Rule

**Never risk more than 1-2% of your total capital on a single trade.**

## Risk:Reward Ratio

AlphaIQ only generates signals with R:R ≥ 1:2.

This means: if you risk $1, you should aim to make at least $2.

With a 50% win rate and 1:2 R:R, you are profitable:
- 5 wins × $200 = $1000 profit
- 5 losses × $100 = -$500 loss
- **Net: +$500**

## ATR-Based Stop Loss

AlphaIQ uses ATR (Average True Range) to set stop losses:
- **Stop Loss = Entry - (1.5 × ATR)**
- **Target 1  = Entry + (2 × Risk)**
- **Target 2  = Entry + (4 × Risk)**

ATR-based stops adapt to market volatility — wider stops in volatile markets, tighter in calm ones.

## Position Sizing Formula

**Position Size = (Account Risk $) / (Entry - Stop Loss)**

Example:
- Account: $10,000
- Max risk per trade: 2% = $200
- Entry: $100, Stop: $96 → Risk per share = $4
- Position Size = $200 / $4 = 50 shares

## Common Mistakes to Avoid

1. Moving your stop loss to avoid a loss
2. Risking too much on "high conviction" trades
3. Not having a stop loss at all
4. Averaging down into losing positions
5. Ignoring position sizing entirely
    `,
  },
  {
    id: 'sentiment',
    icon: Brain,
    title: 'AI Sentiment Analysis',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    summary: 'How AlphaIQ uses large language models to score market sentiment.',
    content: `
## What is Sentiment Analysis?

Market sentiment is the overall attitude of investors toward a particular security or market. AlphaIQ quantifies this using AI to analyze news, technical data, and market structure.

## The Score: -1.0 to +1.0

| Score Range | Bias | Interpretation |
|-------------|------|----------------|
| +0.7 to +1.0 | Strong Buy | Extremely bullish conditions |
| +0.2 to +0.7 | Bullish | Positive conditions |
| -0.2 to +0.2 | Neutral | Mixed signals |
| -0.7 to -0.2 | Bearish | Negative conditions |
| -1.0 to -0.7 | Strong Sell | Extremely bearish conditions |

## What Goes Into the Score?

Our AI model analyzes:
1. **News headlines and summaries** — recent catalysts
2. **Technical indicator readings** — RSI, MACD, EMA position
3. **Price action** — trend, momentum, volatility
4. **Volume** — confirming or diverging from price
5. **Market structure** — sector trends, relative strength

## Confidence Score (0–100%)

The confidence score measures how certain the model is about its assessment. Low confidence = mixed signals. High confidence = multiple factors aligned.

**AlphaIQ only shows trade signals when confidence ≥ 70%.**

## Key Risk & Catalyst

Every analysis includes:
- **Key Risk**: The primary downside factor (1 sentence)
- **Catalyst**: The primary upside driver (1 sentence)

These are generated by the AI and updated every 30 minutes during market hours.
    `,
  },
];

function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown-to-HTML renderer
  const lines = content.trim().split('\n');
  const elements: JSX.Element[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;
  let i = 0;

  const flushTable = () => {
    if (!tableBuffer.length) return;
    const rows = tableBuffer.map(row => row.split('|').filter(Boolean).map(c => c.trim()));
    elements.push(
      <div key={`table-${i}`} className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {rows[0].map((cell, j) => (
                <th key={j} className="text-left py-2 px-3 bg-surface-2 border border-white/8 text-xs font-semibold">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(2).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 border border-white/5 text-xs text-muted-foreground">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  for (const line of lines) {
    i++;
    if (line.startsWith('|')) { tableBuffer.push(line); inTable = true; continue; }
    if (inTable) flushTable();
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="font-display text-lg font-bold mt-6 mb-3 text-foreground">{line.slice(3)}</h2>);
    } else if (line.startsWith('- **')) {
      const parts = line.slice(2).split('**');
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-disc">
          <strong className="text-foreground">{parts[1]}</strong>{parts[2]}
        </li>
      );
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-disc">{line.slice(2)}</li>);
    } else if (line.match(/^\d+\./)) {
      elements.push(<li key={i} className="text-sm text-muted-foreground ml-4 mb-1 list-decimal">{line.replace(/^\d+\. /, '')}</li>);
    } else if (line.trim()) {
      elements.push(<p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">{line}</p>);
    }
  }
  if (inTable) flushTable();
  return <div className="space-y-0.5">{elements}</div>;
}

export default function LearnPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            AlphaIQ Academy
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Trading Education</h1>
          <p className="text-muted-foreground">Master the indicators and concepts behind our AI analysis engine.</p>
        </div>

        <div className="space-y-3">
          {LESSONS.map(lesson => {
            const Icon = lesson.icon;
            const isOpen = open === lesson.id;
            return (
              <div key={lesson.id} className={cn('rounded-2xl border transition-all', isOpen ? `bg-surface-1 ${lesson.bg}` : 'bg-surface-1 border-white/5 hover:border-white/10')}>
                <button
                  onClick={() => setOpen(isOpen ? null : lesson.id)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', lesson.bg)}>
                      <Icon className={cn('w-5 h-5', lesson.color)} />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-base">{lesson.title}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{lesson.summary}</p>
                    </div>
                  </div>
                  <ChevronDown className={cn('w-5 h-5 text-muted-foreground shrink-0 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 border-t border-white/5 pt-5">
                    <MarkdownRenderer content={lesson.content} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
