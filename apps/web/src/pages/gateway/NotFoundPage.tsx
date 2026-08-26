import { FaultPage } from '#web/pages/gateway/FaultPage';

export function NotFoundPage() {
  return (
    <FaultPage
      code={404}
      title="Страницы нет"
      text="Такого маршрута нет. Опечатка в URL, старый букмарк или кто-то скинул фигню."
    />
  );
}
