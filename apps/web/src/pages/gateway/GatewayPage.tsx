import { FaultPage } from '#web/pages/gateway/FaultPage';

type GatewayPageProps = {
  busy?: boolean;
  onRetry: () => void;
  onHome?: () => void | Promise<void>;
};

export function GatewayPage({ busy = false, onRetry, onHome }: GatewayPageProps) {
  return (
    <FaultPage
      code={502}
      title="Сервер недоступен"
      text="Сервер не отвечает."
      busy={busy}
      onRetry={onRetry}
      onHome={onHome}
    />
  );
}
