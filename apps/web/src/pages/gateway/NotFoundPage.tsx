import { FaultPage } from '#web/pages/gateway/FaultPage';

type NotFoundPageProps = {
  onHome: () => void | Promise<void>;
};

export function NotFoundPage({ onHome }: NotFoundPageProps) {
  return (
    <FaultPage
      code={404}
      title="Страницы нет"
      text="Такого маршрута нет. Опечатка в URL, старый букмарк или кто-то скинул фигню."
      onHome={onHome}
    />
  );
}
