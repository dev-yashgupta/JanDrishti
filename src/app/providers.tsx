'use client';
import { I18nProvider } from '@/contexts/I18nContext';
import { ToastContainer } from '@/components/shared/ToastContainer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      {children}
      <ToastContainer />
    </I18nProvider>
  );
}
