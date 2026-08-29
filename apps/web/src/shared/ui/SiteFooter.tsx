import { useLocale } from '#web/shared/i18n/locale-context';

import '#web/shared/ui/site-chrome.css';

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="site-footer" id="footer">
      <p className="stack-credits">
        <span>{t('footerFrontend')}</span>
        <span className="stack-credits-sep" aria-hidden="true">
          ·
        </span>
        <span>{t('footerBackend')}</span>
        <span className="stack-credits-sep" aria-hidden="true">
          ·
        </span>
        <span>{t('footerInfra')}</span>
      </p>
    </footer>
  );
}
