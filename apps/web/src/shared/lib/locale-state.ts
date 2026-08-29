export type Locale = 'ru' | 'en';

export const LOCALES = ['ru', 'en'] as const satisfies readonly Locale[];

const STORAGE_KEY = 'app-locale';
export const DEFAULT_LOCALE: Locale = 'ru';

export function readLocale(): Locale {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_LOCALE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'ru' || raw === 'en') {
      return raw;
    }
  } catch {
  }

  return DEFAULT_LOCALE;
}

export function writeLocale(locale: Locale) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, locale);
}
