import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/layout/AuthProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AlphaIQ — AI-Powered Stock Intelligence',
  description: 'Real-time AI sentiment analysis, high-probability trade signals, and quantitative insights for serious traders.',
  keywords: ['stock analysis', 'AI trading', 'sentiment analysis', 'trade signals', 'technical analysis'],
  openGraph: {
    title: 'AlphaIQ — AI-Powered Stock Intelligence',
    description: 'Real-time AI sentiment analysis and trade signals.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
