'use client';
// components/charts/StockChart.tsx
import {
  ComposedChart, AreaChart, Area, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { useMemo, useState } from 'react';
import type { CandleData, Timeframe } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface StockChartProps {
  data: CandleData[];
  ticker: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  showEMA?: boolean;
  showVolume?: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const isUp = d.close >= d.open;
  return (
    <div className="glass rounded-lg p-3 border border-white/10 text-xs space-y-1 min-w-[160px]">
      <p className="text-muted-foreground font-mono">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-muted-foreground">O</span><span className="font-mono">{formatPrice(d.open)}</span>
        <span className="text-muted-foreground">H</span><span className="font-mono text-bull">{formatPrice(d.high)}</span>
        <span className="text-muted-foreground">L</span><span className="font-mono text-bear">{formatPrice(d.low)}</span>
        <span className="text-muted-foreground">C</span>
        <span className={cn('font-mono font-semibold', isUp ? 'text-bull' : 'text-bear')}>
          {formatPrice(d.close)}
        </span>
      </div>
    </div>
  );
};

function formatXAxis(isoStr: string, tf: Timeframe): string {
  try {
    const d = parseISO(isoStr);
    if (tf === '1D') return format(d, 'HH:mm');
    if (tf === '1W') return format(d, 'EEE HH:mm');
    return format(d, 'MMM d');
  } catch { return isoStr; }
}

export function StockChart({ data, ticker, timeframe, onTimeframeChange, showEMA = true, showVolume = true }: StockChartProps) {
  const [indicators, setIndicators] = useState({ ema: showEMA, volume: showVolume });

  // Compute price color (up/down gradient)
  const firstClose = data[0]?.close ?? 0;
  const lastClose  = data[data.length - 1]?.close ?? 0;
  const isUp       = lastClose >= firstClose;
  const lineColor  = isUp ? '#00d07a' : '#ff4560';

  const chartData = useMemo(() =>
    data.map(d => ({
      ...d,
      time: formatXAxis(d.time, timeframe),
      // For area chart, use close price
      value: d.close,
    })), [data, timeframe]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Controls bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        {/* Timeframe switcher */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={cn(
                'px-3 py-1 text-xs font-mono rounded-md transition-colors',
                tf === timeframe
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Indicator toggles */}
        <div className="flex items-center gap-2">
          {[
            { key: 'ema', label: 'EMA', color: '#f0b429' },
            { key: 'volume', label: 'VOL', color: '#6366f1' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setIndicators(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              className={cn(
                'px-2 py-0.5 text-xs rounded border transition-colors',
                indicators[key as keyof typeof indicators]
                  ? 'border-primary/50 text-primary bg-primary/10'
                  : 'border-white/10 text-muted-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price chart */}
      <div className="flex-1 min-h-0 px-1 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />

            <XAxis
              dataKey="time"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="price"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'DM Mono' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v.toFixed(0)}`}
              domain={['auto', 'auto']}
            />

            {indicators.volume && (
              <YAxis
                yAxisId="vol"
                orientation="left"
                tick={false}
                axisLine={false}
                tickLine={false}
                domain={[0, (dataMax: number) => dataMax * 5]}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {/* Volume bars */}
            {indicators.volume && (
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill="url(#volGrad)"
                stroke="none"
                radius={[2, 2, 0, 0]}
              />
            )}

            {/* Price area */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill="url(#priceGrad)"
              dot={false}
              activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
            />

            {/* EMA overlays */}
            {indicators.ema && data[0]?.ema20 && (
              <Line yAxisId="price" type="monotone" dataKey="ema20"  stroke="#f0b429" strokeWidth={1} dot={false} strokeDasharray="3 3" name="EMA20" />
            )}
            {indicators.ema && data[0]?.ema50 && (
              <Line yAxisId="price" type="monotone" dataKey="ema50"  stroke="#8b5cf6" strokeWidth={1} dot={false} strokeDasharray="3 3" name="EMA50" />
            )}
            {indicators.ema && data[0]?.ema200 && (
              <Line yAxisId="price" type="monotone" dataKey="ema200" stroke="#06b6d4" strokeWidth={1} dot={false} strokeDasharray="3 3" name="EMA200" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
