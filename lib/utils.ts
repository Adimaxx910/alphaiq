// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function formatVolume(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

export function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600_000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function sentimentToLabel(score: number): string {
  if (score >= 0.5) return 'Strong Buy';
  if (score >= 0.2) return 'Buy';
  if (score >= -0.2) return 'Neutral';
  if (score >= -0.5) return 'Sell';
  return 'Strong Sell';
}

export function sentimentColor(score: number): string {
  if (score > 0.2) return 'text-bull';
  if (score < -0.2) return 'text-bear';
  return 'text-gold';
}

export function rsiLabel(rsi: number): { label: string; color: string } {
  if (rsi >= 70) return { label: 'Overbought', color: 'text-bear' };
  if (rsi >= 55) return { label: 'Bullish', color: 'text-bull' };
  if (rsi >= 45) return { label: 'Neutral', color: 'text-gold' };
  if (rsi >= 30) return { label: 'Bearish', color: 'text-bear' };
  return { label: 'Oversold', color: 'text-bull' };
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
