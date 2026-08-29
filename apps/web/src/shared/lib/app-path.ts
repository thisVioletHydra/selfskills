import { useEffect, useState } from 'react';

export function navigateApp(path: string) {
  if (path === globalThis.location.pathname) {
    return;
  }

  globalThis.history.pushState(null, '', path);
  globalThis.dispatchEvent(new PopStateEvent('popstate'));
}

export function useAppPath() {
  const [pathname, setPathname] = useState(() => globalThis.location.pathname);

  useEffect(() => {
    const sync = () => {
      setPathname(globalThis.location.pathname);
    };

    globalThis.addEventListener('popstate', sync);
    return () => {
      globalThis.removeEventListener('popstate', sync);
    };
  }, []);

  return pathname;
}
