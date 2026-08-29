import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { NotFoundPage } from '#web/pages/gateway/NotFoundPage';
import { HomeGate } from '#web/pages/profile/HomeGate';
import { navigateApp, useAppPath } from '#web/shared/lib/app-path';

function resolvePage(pathname: string, goHome: () => void) {
  if (pathname === '/502') {
    return (
      <GatewayPage
        onRetry={goHome}
        onHome={goHome}
      />
    );
  }

  if (pathname === '/404') {
    return <NotFoundPage onHome={goHome} />;
  }

  if (pathname !== '/' && pathname !== '') {
    return <NotFoundPage onHome={goHome} />;
  }

  return <HomeGate />;
}

export function App() {
  const pathname = useAppPath();
  const goHome = () => {
    navigateApp('/');
  };

  return resolvePage(pathname, goHome);
}
