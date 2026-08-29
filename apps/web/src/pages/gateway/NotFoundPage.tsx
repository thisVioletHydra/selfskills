import { FaultPage } from '#web/pages/gateway/FaultPage';

type NotFoundPageProps = {
  onHome: () => void | Promise<void>;
};

export function NotFoundPage({ onHome }: NotFoundPageProps) {
  return (
    <FaultPage
      code={404}
      title="Страницы нет"
      text="Такого адреса нет. Возможно, опечатка в ссылке или устаревшая закладка."
      onHome={onHome}
    />
  );
}
