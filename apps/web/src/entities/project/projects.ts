export type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  href: string;
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'blitz-mos',
    title: 'login.mos.ru — Blitz IdP',
    summary:
      'Публичный security-critical интерфейс единого входа Москвы. IAM/SSO: авторизация, регистрация, внешние провайдеры и клиентские темы примерно для десяти проектов.',
    stack: ['TypeScript', 'Vue', 'Vite', 'PostCSS'],
    href: 'https://login.mos.ru/sps/profile',
  },
  {
    id: 'servit',
    title: 'servit.by · infinity.servit.by',
    summary:
      'Корпоративный сайт и продуктовый лендинг: вёрстка, адаптив, интеграция контента и форм. Работа в связке с внутренними сервисами компании.',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Vue'],
    href: 'https://servit.by',
  },
  {
    id: 'vds-by',
    title: 'vds.by',
    summary:
      'Коммерческий сайт VDS-хостинга: посадочные блоки, тарифы, формы заявок и аккуратная типографика под B2B-аудиторию.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://vds.by',
  },
  {
    id: 'tylkopolski',
    title: 'tylkopolski.by',
    summary:
      'Промо-страница и посадочный сценарий для польскоязычного продукта: структура контента, UI-блоки и мобильная вёрстка.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://tylkopolski.by/s1/',
  },
  {
    id: 'mazgi',
    title: 'mazgi.by',
    summary:
      'Сайт под ключ: главная, каталог/услуги, контакты. Фокус на читаемости, скорости загрузки и предсказуемой вёрстке без лишней магии.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://mazgi.by',
  },
  {
    id: '7777taxi',
    title: '7777taxi.com',
    summary:
      'Dev-версия сайта такси: интерфейс заказа, статические макеты и клиентская логика форм до выкладки в прод.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    href: 'https://7777taxi.com/dev/',
  },
  {
    id: 'email-templates',
    title: 'Email-шаблоны (внутренние)',
    summary:
      'Набор HTML-писем для продуктовых рассылок: табличная вёрстка, inline-стили, тест в клиентах и согласование с брендом.',
    stack: ['HTML', 'CSS', 'Pug'],
    href: '#projects',
  },
];
