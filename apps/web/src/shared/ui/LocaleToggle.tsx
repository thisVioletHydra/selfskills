import { useLocale } from '#web/shared/i18n/locale-context';

import '#web/shared/ui/locale-toggle.css';

export function LocaleToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="locale-toggle" role="group" aria-label={t('localeToggle')}>
      <button
        type="button"
        className={locale === 'ru' ? 'is-active' : ''}
        aria-pressed={locale === 'ru'}
        onClick={() => setLocale('ru')}
      >
        RU
      </button>
      <button
        type="button"
        className={locale === 'en' ? 'is-active' : ''}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
    </div>
  );
}
