'use client';
// components/ui/use-toast.ts
import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function dispatch(toast: Toast) {
  toasts = [...toasts, toast];
  listeners.forEach(l => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== toast.id);
    listeners.forEach(l => l(toasts));
  }, 4000);
}

export function toast(opts: Omit<Toast, 'id'>) {
  dispatch({ id: Math.random().toString(36).slice(2), ...opts });
}

export function useToast() {
  const [_toasts, setToasts] = useState<Toast[]>(toasts);
  const subscribe = useCallback((listener: (t: Toast[]) => void) => {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }, []);

  useState(() => {
    const unsub = subscribe(setToasts);
    return unsub;
  });

  return { toast, toasts: _toasts };
}
