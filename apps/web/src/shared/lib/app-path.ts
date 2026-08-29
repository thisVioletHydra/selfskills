import { useEffect, useState } from 'react';

/** '' в dev (base '/'), '/selfskills' на GitHub Pages (base '/selfskills/'). */
const BASE_PREFIX = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Путь внутри приложения: срезает base-префикс ('/selfskills/x' → '/x'). */
export function appPath(pathname: string = globalThis.location.pathname): string {
  if (BASE_PREFIX !== '' && pathname.startsWith(BASE_PREFIX)) {
    const inner = pathname.slice(BASE_PREFIX.length);

    return inner === '' ? '/' : inner;
  }

  return pathname;
}

export function navigateApp(path: string) {
  const target = `${BASE_PREFIX}${path}`;

  if (target === globalThis.location.pathname) {
    return;
  }

  globalThis.history.pushState(null, '', target);
  globalThis.dispatchEvent(new PopStateEvent('popstate'));
}

export function useAppPath() {
  const [pathname, setPathname] = useState(() => appPath());

  useEffect(() => {
    const sync = () => {
      setPathname(appPath());
    };

    globalThis.addEventListener('popstate', sync);
    return () => {
      globalThis.removeEventListener('popstate', sync);
    };
  }, []);

  return pathname;
}
