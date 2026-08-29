import type { ReactNode } from 'react';
import type { LocaleContextValue } from '#web/shared/i18n/locale-context';
import type { Locale } from '#web/shared/lib/locale-state';

import { formatMessage, messages } from '#web/shared/i18n/messages';
import { LocaleContext } from '#web/shared/i18n/locale-context';
import { readLocale, writeLocale } from '#web/shared/lib/locale-state';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  const setLocale = useCallback((next: Locale) => {
    writeLocale(next);
    setLocaleState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => {
    const dict = messages[locale];

    return {
      locale,
      setLocale,
      t: (key, vars) => formatMessage(dict[key], vars),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
