export type ResumeJob = {
  id: string;
  period: string;
  duration: string;
  company: string;
  location: string;
  url?: string;
  industry?: string;
  role: string;
  productNote?: string;
  stack: string[];
  highlights: string[];
};

export type ResumeInfo = {
  id: string;
  fullName: string;
  ageLine: string;
  location: string;
  status: string;
  updatedAt: string;
  phone: string;
  email: string;
  preferredContact: string;
  title: string;
  specializations: string[];
  employment: string;
  workFormat: string;
  experienceYears: string;
  about: string[];
  skills: string[];
  languages: { name: string; level: string }[];
  education: {
    level: string;
    school: string;
    details: string;
  };
  courses: string[];
  portfolio: { label: string; href: string }[];
  jobs: ResumeJob[];
  sourceUrl?: string;
};

/** Демо-резюме — потом придёт с Prisma/GraphQL */
export const DEMO_RESUME: ResumeInfo = {
  id: "roman-rybchin",
  fullName: "Рыбчин Роман Александрович",
  ageLine: "Мужчина, 29 лет, родился 18 сентября 1996",
  location: "Москва · удалённо · готов к командировкам",
  status: "Активно ищет работу",
  updatedAt: "24.08.2026",
  phone: "+7 977 653-03-60",
  email: "workonsunday@yandex.ru",
  preferredContact: "Telegram (пишите в телегу — отвечу быстрее всего)",
  title: "Frontend-разработчик",
  specializations: ["Программист", "разработчик"],
  employment: "Полная занятость",
  workFormat: "Удалённо",
  experienceYears: "5 лет",
  about: [
    "Frontend-разработчик с большим опытом коммерческой продуктовой разработки. Основной стек — TypeScript, JavaScript, Vue 3, Vite, PostCSS, Node.js. Последние годы работал над IAM/SSO-платформой: security-critical интерфейсы авторизации, модернизация legacy, производительность, совместимость со старыми браузерами. Продукт, в который входит мой frontend, включён в Реестр российского ПО и сертифицирован ФСТЭК России.",
    "Сейчас осваиваю React на практике: переношу интерфейсы с Vue на React, разбираюсь с компонентной моделью, хуками и управлением состоянием. Не называю себя React-разработчиком с продовым стажем — но переход Vue → React для меня рабочая задача, а не теория.",
    "Не коллекционирую технологии ради длинного списка в резюме. Предпочитаю глубоко знать рабочий инструмент, а недостающее добирать под конкретную задачу.",
    "Предпочитаю AI-агентов, а не ручной набор рутинного кода. Проектирую решение, задаю ограничения и отвечаю за результат — агент берёт механику.",
    "Ищу удалённую работу над продуктом, который развивается: где есть задачи на подумать, а не только конвейер однотипных страниц.",
  ],
  skills: [
    "TypeScript",
    "JavaScript",
    "Vue",
    "React",
    "Vite",
    "Node.js",
    "Nuxt.js",
    "HTML5",
    "CSS3",
    "PostCSS",
    "Sass",
    "Git",
    "GitLab CI",
    "Webpack",
    "REST API",
  ],
  languages: [{ name: "Русский", level: "Родной" }],
  education: {
    level: "Высшее образование",
    school: "БГУИР, Минск",
    details: "ФНИДО, Электронный маркетинг · 2018",
  },
  courses: ['Книга — «Выразительный JavaScript», 2-е издание · 2018'],
  portfolio: [
    { label: "vds.by", href: "https://vds.by" },
    { label: "tylkopolski.by/s1/", href: "https://tylkopolski.by/s1/" },
    { label: "mazgi.by", href: "https://mazgi.by" },
    { label: "infinity.servit.by", href: "https://infinity.servit.by" },
    { label: "servit.by", href: "https://servit.by" },
    { label: "7777taxi.com/dev/", href: "https://7777taxi.com/dev/" },
  ],
  jobs: [
    {
      id: "reak-soft",
      period: "Окт 2022 — Авг 2026",
      duration: "3 года 11 мес",
      company: 'ООО «РЕАК СОФТ»',
      location: "Москва",
      url: "https://identityblitz.ru/company/about-us/",
      industry: "ИТ, системная интеграция",
      role: "Ведущий инженер-программист",
      productNote:
        "Blitz Identity Provider — IAM/SSO. Публичный пример: https://login.mos.ru/sps/profile",
      stack: [
        "TypeScript",
        "JavaScript",
        "Vue",
        "Node.js",
        "Vite",
        "PostCSS",
        "GitLab CI/CD",
        "Bootstrap",
        "jQuery",
        "RequireJS",
        "Scala/Twirl",
      ],
      highlights: [
        "Модернизировал legacy клиентских тем: вынес HTML/CSS/JS из админки в отдельный TypeScript-проект со сборкой, Git и проверками.",
        "Настроил GitLab CI/CD: история версий, ветки, безопасный откат без ручного копирования на сервер.",
        "Собрал модульную frontend-архитектуру и Bridge между Scala/Twirl, HTML и TypeScript с ленивой загрузкой модулей.",
        "С нуля сделал аналитику действий пользователей на динамических формах + runtime-диагностику без явных ошибок в консоли.",
        "Обеспечил работу современного кода в IE, Safari 10 и на старых iPhone (Browserslist, modern/legacy, полифилы).",
        "~2 года параллельно на Vue: экраны, UI Kit, перенос админки; расширения Chrome/Firefox.",
        "Общие инструменты команды: каталог ассетов, приватный npm, монорепо пакетов, линтеры; техинтервью.",
        "Продакшен-инциденты: воспроизведение, гипотезы, hotfix.",
      ],
    },
    {
      id: "servicepipe",
      period: "Сен 2021 — Окт 2022",
      duration: "1 год 2 мес",
      company: 'ООО «Сервиспайп»',
      location: "Москва",
      url: "https://www.servicepipe.ru/",
      role: "Программист-разработчик",
      productNote: "Личный кабинет и интеграции для платформы защиты от DDoS на базе Arbor.",
      stack: [
        "TypeScript",
        "JavaScript",
        "Node.js",
        "Express.js",
        "Vue.js",
        "Nuxt.js",
        "MongoDB",
        "PostCSS",
        "Pug",
        "PM2",
      ],
      highlights: [
        "ЛК на Nuxt.js + REST API на Express + MongoDB.",
        "Интеграционный слой Arbor: CLI runner, XML-парсер под клиента.",
        "Realtime-поток данных, недоступный через штатный API Arbor (перехват → UDP клиенту).",
        "Сервис анализа уязвимостей с подтверждением DNS TXT/HTML и OWASP ZAP через Express API.",
        "Email-отчёты: Pug → PDF → рассылка.",
        "Участие в переходе монолита → сервисы и TypeScript.",
      ],
    },
  ],
};
