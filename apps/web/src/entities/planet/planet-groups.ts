import { PLANETS } from '#web/entities/planet/planets';

export type PlanetGroup = {
  id: string;
  title: string;
  items: string[];
};

const byId = (...ids: string[]) =>
  PLANETS.filter((item) => ids.includes(item.id)).map((item) => item.name);

export const PLANET_GROUPS: PlanetGroup[] = [
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
    items: byId('rust', 'vscode'),
  },
];
