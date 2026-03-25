'use client';
// components/ui/toaster.tsx
import { useToast } from './use-toast';
import { cn } from '@/lib/utils';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

export function Toaster() {
  const { toasts, toast: _t } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'glass rounded-xl border px-4 py-3 flex items-start gap-3 shadow-2xl animate-in slide-in-from-right-5',
            t.variant === 'destructive' ? 'border-bear/30' : 'border-white/10'
          )}
        >
          {t.variant === 'destructive'
            ? <AlertCircle  className="w-4 h-4 text-bear shrink-0 mt-0.5" />
            : <CheckCircle2 className="w-4 h-4 text-bull shrink-0 mt-0.5" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
