import { FaultPage } from '#web/pages/gateway/FaultPage';

type GatewayPageProps = {
  busy?: boolean;
  onRetry: () => void;
};

export function GatewayPage({ busy = false, onRetry }: GatewayPageProps) {
  return (
    <FaultPage
      code={502}
      title="Шлюз сбежал"
      text="Сервер не отвечает. Страница тут ни при чём — просто шлюз молчит."
      busy={busy}
      onRetry={onRetry}
    />
  );
}
