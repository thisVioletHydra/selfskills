import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { ProfilePage } from '#web/pages/profile/ProfilePage';
import { pingBackend } from '#web/shared/api/ping-api';
import '#web/pages/gateway/gateway-page.css';

type Gate = 'pending' | 'up' | 'down';

export function HomeGate() {
  const [gate, setGate] = useState<Gate>('pending');

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
  }, []);

  const views: Record<Gate, ReactNode> = {
    pending: <main className="fault-page fault-page--blank" aria-busy="true" />,
    down: <GatewayPage onRetry={() => setGate('up')} />,
    up: <ProfilePage />,
  };

  return views[gate];
}
