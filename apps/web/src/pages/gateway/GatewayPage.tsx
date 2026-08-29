import { FaultPage } from '#web/pages/gateway/FaultPage';
import { ApiDbProbe } from '#web/widgets/cosmos/chrome/ApiDbProbe';
import { StatusChips } from '#web/widgets/cosmos/chrome/StatusChips';

type GatewayPageProps = {
  busy?: boolean;
  onRetry: () => void;
  onHome?: () => void | Promise<void>;
};

export function GatewayPage({ busy = false, onRetry, onHome }: GatewayPageProps) {
  return (
    <>
      <FaultPage
        code={502}
        title="Сервер недоступен"
        text="Сервер не отвечает. Статус API и БД — внизу слева."
        busy={busy}
        onRetry={onRetry}
        onHome={onHome}
      />
      <StatusChips />
      <ApiDbProbe />
    </>
  );
}
