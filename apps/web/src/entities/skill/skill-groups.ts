import { TECH_STACK } from '#app/entities/skill/tech-stack';

export type SkillGroup = {
  id: string;
  title: string;
  items: string[];
};

const byId = (...ids: string[]) =>
  TECH_STACK.filter((item) => ids.includes(item.id)).map((item) => item.name);

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: 'core',
    title: 'Core',
    items: byId('javascript', 'typescript'),
  },
  {
    id: 'frontend',
    title: 'Frontend',
    items: byId('vue', 'react', 'vite', 'postcss', 'sass'),
  },
  {
    id: 'backend',
    title: 'Backend',
    items: byId('node', 'nest', 'prisma', 'graphql', 'nginx'),
  },
  {
    id: 'toolchain',
    title: 'Toolchain',
    items: byId('pnpm', 'git', 'github', 'gitlab', 'docker', 'tsdown', 'eslint'),
  },
  {
    id: 'hobby',
    title: 'Hobby',
    items: byId('rust'),
  },
];
