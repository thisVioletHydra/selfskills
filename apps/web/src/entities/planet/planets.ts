import { iconUrl } from '#web/generated/asset-urls';

export type Planet = {
  id: string;
  name: string;
  reading: string;
  summary: string;
  experience: string;
  icon: string;
  size: number;
  isCore?: boolean;
};

type PlanetData = Omit<Planet, 'icon'>;

const PLANET_DATA: PlanetData[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    reading: 'джаваскрипт',
    summary: 'Язык, на котором крутится весь фронт и Node.',
    experience: 'База всего. Без него остальной стек не живёт — знаю уверенно, пишу каждый день.',
    size: 96,
    isCore: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    reading: 'тайпскрипт',
    summary: 'Типизированный JS — типы на этапе разработки, не в рантайме.',
    experience:
      'Плюс: меньше багов на проде. Минус: иногда слишком сложные типы. В проде — да, без него не хочу.',
    size: 42,
  },
  {
    id: 'node',
    name: 'Node.js',
    reading: 'нода',
    summary: 'JS на сервере — рантайм, не фреймворк.',
    experience:
      'Бэкенд, CLI, скрипты. Плюс: один язык везде. Минус: тяжёлые CPU-таски не его конёк.',
    size: 42,
  },
  {
    id: 'react',
    name: 'React',
    reading: 'реакт',
    summary: 'UI-библиотека для JS — компоненты и состояние.',
    experience:
      'Перехожу с Vue на практике: компоненты, хуки, стейт. Не продаю себя как «5 лет React», но фундамент тот же.',
    size: 42,
  },
  {
    id: 'vue',
    name: 'Vue',
    reading: 'вью',
    summary: 'Фреймворк для JS — реактивный UI из коробки.',
    experience:
      'Основной продовый UI-стек последние годы. SFC, Vite, экосистема — родная территория.',
    size: 42,
  },
  {
    id: 'vite',
    name: 'Vite',
    reading: 'вит',
    summary: 'Сборщик / dev-server нового поколения.',
    experience: 'Дефолт для фронта. Быстрый HMR, простая конфигурация — без тяжёлого Webpack-пайплайна.',
    size: 42,
  },
  {
    id: 'nest',
    name: 'NestJS',
    reading: 'нест',
    summary: 'Node-фреймворк с модулями, DI и структурой «как в Angular», но для бэка.',
    experience: 'Беру под API и GraphQL: модули, провайдеры, понятный скелет сервиса.',
    size: 42,
  },
  {
    id: 'prisma',
    name: 'Prisma',
    reading: 'призма',
    summary: 'ORM с типами и миграциями.',
    experience: 'Схема → клиент → меньше ручного SQL. Удобно стыковать с Nest и GraphQL.',
    size: 42,
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    reading: 'графкьюэл',
    summary: 'Язык запросов к API — клиент берёт только нужные поля.',
    experience: 'Схемы, резолверы, типизация. Не универсальное решение, но для продуктового API подходит.',
    size: 42,
  },
  {
    id: 'postcss',
    name: 'PostCSS',
    reading: 'постссиэсэс',
    summary: 'Пайплайн для CSS: плагины, префиксы, современный синтаксис.',
    experience:
      'Годы в проде: Browserslist, legacy/modern-сборки, точечные фиксы под старые браузеры.',
    size: 42,
  },
  {
    id: 'docker',
    name: 'Docker',
    reading: 'докер',
    summary: 'Контейнеры — одинаковое окружение у всех.',
    experience: 'Dev и деплой: сервисы в compose, без «у меня локально работает».',
    size: 42,
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    reading: 'пиэнпиэм',
    summary: 'Пакетный менеджер с жёстким node_modules и экономией диска.',
    experience: 'Дефолт в монорепах. Быстрее npm, предсказуемее hoist.',
    size: 42,
  },
  {
    id: 'git',
    name: 'Git',
    reading: 'гит',
    summary: 'Система контроля версий.',
    experience: 'Ветки, ревью, CI, откаты. Без этого продакшен не существует.',
    size: 42,
  },
  {
    id: 'github',
    name: 'GitHub',
    reading: 'гитхаб',
    summary: 'Хостинг репозиториев, PR, Actions, релизы.',
    experience: 'Публичные репы, код-ревью, CI. Там же живут личные проекты и форки.',
    size: 42,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    reading: 'гитлаб',
    summary: 'Git + CI/CD + ревью в одном месте, часто self-hosted.',
    experience: 'Продовый пайплайн: мержи, runners, автодеплой, откаты без ручного копирования.',
    size: 42,
  },
  {
    id: 'tsdown',
    name: 'tsdown',
    reading: 'тиэсдаун',
    summary: 'Сборка TypeScript-библиотек / пакетов на современном пайплайне.',
    experience:
      'Для внутренних пакетов и библиотек — быстрее и проще классической связки tsc и отдельных бандлеров.',
    size: 42,
  },
  {
    id: 'eslint',
    name: 'ESLint',
    reading: 'ислинт',
    summary: 'Линтер для JS/TS — правила и автофиксы.',
    experience: 'Конфиги команды, flat config, общие пресеты. Без линтера качество репозитория быстро падает.',
    size: 42,
  },
  {
    id: 'nginx',
    name: 'Nginx',
    reading: 'энжинкс',
    summary: 'Веб-сервер и реверс-прокси.',
    experience: 'Статика, прокси на Node/API, SSL, конфиги без магии «почему 502».',
    size: 42,
  },
  {
    id: 'sass',
    name: 'Sass',
    reading: 'саас',
    summary: 'CSS с переменными, миксинами и вложенностью (SCSS).',
    experience: 'Годы вёрстки и тем: переменные, partials, до того как CSS сам это умел.',
    size: 42,
  },
  {
    id: 'rust',
    name: 'Rust',
    reading: 'раст',
    summary: 'Системный язык с ownership и без GC.',
    experience:
      'Хобби: пытаюсь понять borrow checker и не сдаться. В прод на нём пока не пишу — учусь.',
    size: 42,
  },
  {
    id: 'vscode',
    name: 'VS Code',
    reading: 'виэскод',
    summary: 'Редактор кода — расширения, дебаг, терминал в одном окне.',
    experience: 'Основной инструмент каждый день: TS, Vue/React, Nest, линт, git — всё отсюда.',
    size: 42,
  },
];

export const PLANETS: Planet[] = PLANET_DATA.map((planet) => ({
  ...planet,
  icon: iconUrl(planet.id),
}));

export const CORE_PLANET = PLANETS.find((item) => item.isCore === true)!;
export const ORBIT_PLANETS = PLANETS.filter((item) => item.isCore !== true);
