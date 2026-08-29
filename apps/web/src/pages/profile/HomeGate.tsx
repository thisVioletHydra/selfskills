import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { ProfilePage } from '#web/pages/profile/ProfilePage';
import { pingBackend } from '#web/shared/api/ping-api';

import '#web/pages/gateway/gateway-page.css';

type Gate = 'pending' | 'up' | 'down';

export function HomeGate() {
  const [gate, setGate] = useState<Gate>('pending');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    pingBackend()
      .then((ok) => {
        if (!cancelled) {
          setGate(ok ? 'up' : 'down');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGate('down');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  const views: Record<Gate, ReactNode> = {
    pending: <main className="home-gate-pending" aria-busy="true" />,
    down: (
      <GatewayPage
        onRetry={() => {
          setGate('pending');
          setRetryKey((current) => current + 1);
        }}
        onHome={async () => {
          const ok = await pingBackend();
          if (ok) {
            setGate('up');
          }
        }}
      />
    ),
    up: <ProfilePage />,
  };

  return views[gate];
}
