import dockerIcon from '#app/icons/docker.svg';
import eslintIcon from '#app/icons/eslint.svg';
import gitIcon from '#app/icons/git.svg';
import githubIcon from '#app/icons/github.svg';
import gitlabIcon from '#app/icons/gitlab.svg';
import graphqlIcon from '#app/icons/graphql.svg';
import javascriptIcon from '#app/icons/javascript.svg';
import nestIcon from '#app/icons/nest.svg';
import nginxIcon from '#app/icons/nginx.svg';
import nodeIcon from '#app/icons/node.svg';
import pnpmIcon from '#app/icons/pnpm.svg';
import postcssIcon from '#app/icons/postcss.svg';
import prismaIcon from '#app/icons/prisma.svg';
import reactIcon from '#app/icons/react.svg';
import rustIcon from '#app/icons/rust.svg';
import sassIcon from '#app/icons/sass.svg';
import tsdownIcon from '#app/icons/tsdown.svg';
import typescriptIcon from '#app/icons/typescript.svg';
import viteIcon from '#app/icons/vite.svg';
import vueIcon from '#app/icons/vue.svg';

export type TechStackItem = {
  id: string;
  name: string;
  reading: string;
  summary: string;
  experience: string;
  icon: string;
  size: number;
  isCore?: boolean;
};

export const TECH_STACK: TechStackItem[] = [
  {
    id: 'javascript',
    name: 'JavaScript',
    reading: 'джаваскрипт',
    summary: 'Язык, на котором крутится весь фронт и Node.',
    experience: 'База всего. Без него остальной стек не живёт — знаю уверенно, пишу каждый день.',
    icon: javascriptIcon,
    size: 96,
    isCore: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    reading: 'тайпскрипт',
    summary: 'Типизированный JS — типы на этапе разработки, не в рантайме.',
    experience:
      'Плюс: меньше багов на проде. Минус: иногда типовая дрочь. В проде — да, без него не хочу.',
    icon: typescriptIcon,
    size: 42,
  },
  {
    id: 'node',
    name: 'Node.js',
    reading: 'нода',
    summary: 'JS на сервере — рантайм, не фреймворк.',
    experience:
      'Бэкенд, CLI, скрипты. Плюс: один язык везде. Минус: тяжёлые CPU-таски не его конёк.',
    icon: nodeIcon,
    size: 42,
  },
  {
    id: 'react',
    name: 'React',
    reading: 'реакт',
    summary: 'UI-библиотека для JS — компоненты и состояние.',
    experience:
      'Перехожу с Vue на практике: компоненты, хуки, стейт. Не продаю себя как «5 лет React», но фундамент тот же.',
    icon: reactIcon,
    size: 42,
  },
  {
    id: 'vue',
    name: 'Vue',
    reading: 'вью',
    summary: 'Фреймворк для JS — реактивный UI из коробки.',
    experience:
      'Основной продовый UI-стек последние годы. SFC, Vite, экосистема — родная территория.',
    icon: vueIcon,
    size: 42,
  },
  {
    id: 'vite',
    name: 'Vite',
    reading: 'вит',
    summary: 'Сборщик / dev-server нового поколения.',
    experience: 'Дефолт для фронта. Быстрый HMR, простая конфигурация, без Webpack-страданий.',
    icon: viteIcon,
    size: 42,
  },
  {
    id: 'nest',
    name: 'NestJS',
    reading: 'нест',
    summary: 'Node-фреймворк с модулями, DI и структурой «как в Angular», но для бэка.',
    experience: 'Беру под API и GraphQL: модули, провайдеры, понятный скелет сервиса.',
    icon: nestIcon,
    size: 42,
  },
  {
    id: 'prisma',
    name: 'Prisma',
    reading: 'призма',
    summary: 'ORM с типами и миграциями.',
    experience: 'Схема → клиент → меньше ручного SQL. Удобно стыковать с Nest и GraphQL.',
    icon: prismaIcon,
    size: 42,
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    reading: 'графкьюэл',
    summary: 'Язык запросов к API — клиент берёт только нужные поля.',
    experience: 'Схемы, резолверы, типизация. Не серебряная пуля, но для продуктового API — ок.',
    icon: graphqlIcon,
    size: 42,
  },
  {
    id: 'postcss',
    name: 'PostCSS',
    reading: 'постссиэсэс',
    summary: 'Пайплайн для CSS: плагины, префиксы, современный синтаксис.',
    experience:
      'Годы в проде: Browserslist, legacy/modern-сборки, точечные фиксы под старые браузеры.',
    icon: postcssIcon,
    size: 42,
  },
  {
    id: 'docker',
    name: 'Docker',
    reading: 'докер',
    summary: 'Контейнеры — одинаковое окружение у всех.',
    experience: 'Dev и деплой: сервисы в compose, без «у меня локально работает».',
    icon: dockerIcon,
    size: 42,
  },
  {
    id: 'pnpm',
    name: 'pnpm',
    reading: 'пиэнпиэм',
    summary: 'Пакетный менеджер с жёстким node_modules и экономией диска.',
    experience: 'Дефолт в монорепах. Быстрее npm, предсказуемее hoist.',
    icon: pnpmIcon,
    size: 42,
  },
  {
    id: 'git',
    name: 'Git',
    reading: 'гит',
    summary: 'Система контроля версий.',
    experience: 'Ветки, ревью, CI, откаты. Без этого продакшен не существует.',
    icon: gitIcon,
    size: 42,
  },
  {
    id: 'github',
    name: 'GitHub',
    reading: 'гитхаб',
    summary: 'Хостинг репозиториев, PR, Actions, релизы.',
    experience: 'Публичные репы, код-ревью, CI. Там же живут личные проекты и форки.',
    icon: githubIcon,
    size: 42,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    reading: 'гитлаб',
    summary: 'Git + CI/CD + ревью в одном месте, часто self-hosted.',
    experience: 'Продовый пайплайн: мержи, runners, автодеплой, откаты без ручного копирования.',
    icon: gitlabIcon,
    size: 42,
  },
  {
    id: 'tsdown',
    name: 'tsdown',
    reading: 'тиэсдаун',
    summary: 'Сборка TypeScript-библиотек / пакетов на современном пайплайне.',
    experience:
      'Для внутренних пакетов и либ — быстрее и проще классического tsc+бандлер-зоопарка.',
    icon: tsdownIcon,
    size: 42,
  },
  {
    id: 'eslint',
    name: 'ESLint',
    reading: 'ислинт',
    summary: 'Линтер для JS/TS — правила и автофиксы.',
    experience: 'Конфиги команды, flat config, антифу-стек. Без линтера репа быстро гниёт.',
    icon: eslintIcon,
    size: 42,
  },
  {
    id: 'nginx',
    name: 'Nginx',
    reading: 'энжинкс',
    summary: 'Веб-сервер и реверс-прокси.',
    experience: 'Статика, прокси на Node/API, SSL, конфиги без магии «почему 502».',
    icon: nginxIcon,
    size: 42,
  },
  {
    id: 'sass',
    name: 'Sass',
    reading: 'саас',
    summary: 'CSS с переменными, миксинами и вложенностью (SCSS).',
    experience: 'Годы вёрстки и тем: переменные, partials, до того как CSS сам это умел.',
    icon: sassIcon,
    size: 42,
  },
  {
    id: 'rust',
    name: 'Rust',
    reading: 'раст',
    summary: 'Системный язык с ownership и без GC.',
    experience:
      'Хобби: пытаюсь понять borrow checker и не сдаться. В прод на нём пока не пишу — учусь.',
    icon: rustIcon,
    size: 42,
  },
];

export const CORE_TECH = TECH_STACK.find((item) => item.isCore === true)!;
export const ORBIT_TECH = TECH_STACK.filter((item) => item.isCore !== true);
