import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { NotFoundPage } from '#web/pages/gateway/NotFoundPage';
import { HomeGate } from '#web/pages/profile/HomeGate';

function resolvePage(pathname: string) {
  if (pathname === '/502') {
    return (
      <GatewayPage
        onRetry={() => {
          globalThis.location.href = '/';
        }}
      />
    );
  }

  if (pathname === '/404') {
    return <NotFoundPage />;
  }

  if (pathname !== '/' && pathname !== '') {
    return <NotFoundPage />;
  }

  return <HomeGate />;
}

export function App() {
  return resolvePage(globalThis.location.pathname);
}
