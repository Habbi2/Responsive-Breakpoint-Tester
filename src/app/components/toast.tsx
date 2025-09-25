"use client";
import { createContext, useContext, useState, ReactNode, useCallback, useRef, useMemo } from 'react';

export interface Toast {
  id: string;
  message: string;
  tone?: 'info' | 'success' | 'error';
  ttl?: number; // ms
}

interface ToastContextValue {
  push: (message: string, tone?: Toast['tone'], ttl?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Queue to avoid React warning (updates during another component's render)
  const queueRef = useRef<Toast[]>([]);
  const flushingRef = useRef(false);

  const flush = useCallback(()=>{
    if(flushingRef.current) return;
    flushingRef.current = true;
    queueMicrotask(()=>{
      if(queueRef.current.length) {
        setToasts(t => [...t, ...queueRef.current]);
        queueRef.current.forEach(item => {
          setTimeout(()=>{
            setToasts(cur => cur.filter(x=>x.id!==item.id));
          }, item.ttl || 2600);
        });
        queueRef.current = [];
      }
      flushingRef.current = false;
    });
  },[]);

  const push = useCallback((message: string, tone: Toast['tone']='info', ttl: number=2600) => {
    const id = Math.random().toString(36).slice(2);
    queueRef.current.push({ id, message, tone, ttl });
    flush();
  },[flush]);

  const ctxValue = useMemo(()=>({ push }),[push]);

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      <div className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md px-3 py-2 text-sm shadow border flex items-center gap-2 animate-fade-in-up backdrop-blur-md bg-base-bg/80 border-base-border ${t.tone==='success'?'text-green-500':t.tone==='error'?'text-red-500':'text-base-fg'}`}
            role="status"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.push;
}

// Basic fade in animation (Tailwind utility extension optional; inline using global CSS eventually)