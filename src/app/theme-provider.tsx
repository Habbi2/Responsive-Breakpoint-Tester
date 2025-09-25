"use client";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
interface ThemeContextValue {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (m: ThemeMode) => void;
  toggle: () => void; // cycles light -> dark -> system
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'rbt:theme';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [resolved, setResolved] = useState<'light'|'dark'>('light');

  // Detect system preference
  useEffect(()=>{
    const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) : null;
    if(stored) setMode(stored);
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (currentMode: ThemeMode, mediaIsDark: boolean) => {
      const final = currentMode === 'system' ? (mediaIsDark ? 'dark':'light') : currentMode;
      setResolved(final);
      document.documentElement.classList.toggle('dark', final === 'dark');
      document.documentElement.setAttribute('data-theme', final);
    };
    apply(stored || 'system', mql.matches);
    const listener = (e: MediaQueryListEvent) => apply(mode, e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // When mode changes manually
  useEffect(()=>{
    if(typeof window === 'undefined') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = mql.matches;
    const final = mode === 'system' ? (isDark ? 'dark':'light') : mode;
    setResolved(final);
    document.documentElement.classList.toggle('dark', final === 'dark');
    document.documentElement.setAttribute('data-theme', final);
    localStorage.setItem(STORAGE_KEY, mode);
  },[mode]);

  const setModeSafe = useCallback((m: ThemeMode)=> setMode(m), []);
  const toggle = useCallback(()=> {
    setMode(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light');
  },[]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode: setModeSafe, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if(!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}