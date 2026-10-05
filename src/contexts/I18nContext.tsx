'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import en from '@/locales/en';
import hi from '@/locales/hi';
import type { Translations } from '@/locales/en';

type LocaleCode = 'en' | 'hi';

const LOCALE_MAP: Record<LocaleCode, Translations> = { en, hi: hi as unknown as Translations };

interface I18nContextValue {
  locale: LocaleCode;
  t: Translations;
  setLocale: (code: LocaleCode) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: en,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>('en');

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
  }, []);

  const value = useMemo(
    () => ({ locale, t: LOCALE_MAP[locale], setLocale }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
