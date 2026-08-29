import type { Locale } from '#web/shared/lib/locale-state';
import type { MessageKey } from '#web/shared/i18n/messages';

import { createContext, useContext } from 'react';

export type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string>) => string;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error('useLocale must be used within LocaleProvider');
  }

  return context;
}
