import { useEffect, useState } from 'react';

import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { ProfilePage } from '#web/pages/profile/ProfilePage';
import { pingBackend } from '#web/shared/api/ping-api';
import '#web/pages/gateway/gateway-page.css';

type Gate = 'pending' | 'up' | 'down';

export function HomeGate() {
  const [gate, setGate] = useState<Gate>('pending');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setGate('pending');

    pingBackend().then((ok) => {
      if (!cancelled) {
        setGate(ok ? 'up' : 'down');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (gate === 'pending') {
    return <main className="fault-page fault-page--blank" aria-busy="true" />;
  }

  if (gate === 'down') {
    return <GatewayPage onRetry={() => setGate('up')} />;
  }

  return <ProfilePage />;
}
