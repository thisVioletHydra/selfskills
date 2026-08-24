export type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  href: string;
};

export const PROJECTS: ProjectItem[] = [
  {
    id: "selfskills",
    title: "selfskills",
    summary: "Эта визитка: орбитальный hero, физика иконок, космический UI на React + FSD.",
    stack: ["React", "TypeScript", "Vite"],
    href: "https://github.com/thisVioletHydra/selfskills",
  },
  {
    id: "api-kit",
    title: "Nest kit (скоро)",
    summary: "Бэкенд-заготовка под профиль и скилы: Nest, Prisma, GraphQL, Postgres в Docker.",
    stack: ["NestJS", "Prisma", "GraphQL"],
    href: "#",
  },
  {
    id: "ui-lab",
    title: "UI lab",
    summary:
      "Мелкие эксперименты с motion и интерфейсом — без дашборд-каши, только ощущение продукта.",
    stack: ["React", "CSS"],
    href: "#",
  },
  {
    id: "scripts",
    title: "Node scripts",
    summary: "Утилиты и CLI на Node: автоматизация рутины, без лишней магии.",
    stack: ["Node.js", "TypeScript"],
    href: "#",
  },
];
