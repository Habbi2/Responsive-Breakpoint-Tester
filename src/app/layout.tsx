import './globals.css';
import type { ReactNode } from 'react';
import { ToastProvider } from './components/toast';
import ThemeProvider from './theme-provider';

export const metadata = {
  title: 'Responsive Breakpoint Tester',
  description: 'Preview any URL across multiple responsive widths'
};

export const viewport = {
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
