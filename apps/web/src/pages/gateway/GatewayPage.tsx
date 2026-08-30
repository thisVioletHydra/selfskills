import { useEffect, useRef } from 'react';

import { FaultPage } from '#web/pages/gateway/FaultPage';
import { useHealth } from '#web/shared/api/useHealth';
import { useLocale } from '#web/shared/i18n/locale-context';
import { ApiDbProbe } from '#web/widgets/cosmos/chrome/ApiDbProbe';
import { StatusChips } from '#web/widgets/cosmos/chrome/StatusChips';

type GatewayPageProps = {
  busy?: boolean;
  onRetry: () => void;
  onHome?: () => void | Promise<void>;
};

function isBackendReady(health: { api: string; db: string }) {
  return health.api === 'up' && health.db === 'up';
}

export function GatewayPage({ busy = false, onRetry, onHome }: GatewayPageProps) {
  const { t } = useLocale();
  const health = useHealth();
  const autoRetriedRef = useRef(false);

  useEffect(() => {
    if (!isBackendReady(health)) {
      autoRetriedRef.current = false;
      return;
    }

    if (busy || autoRetriedRef.current) {
      return;
    }

    autoRetriedRef.current = true;
    onRetry();
  }, [busy, health, onRetry]);

  return (
    <>
      <FaultPage
        code={502}
        title={t('gateway502Title')}
        text={t('gateway502Text')}
        hint={t('gateway502WakeHint')}
        busy={busy}
        onRetry={onRetry}
        onHome={onHome}
      />
      <StatusChips />
      <ApiDbProbe />
    </>
  );
}
