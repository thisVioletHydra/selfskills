import type { Planet } from '#web/entities/planet/planets';

type PlanetCopy = Pick<Planet, 'reading' | 'summary' | 'experience'>;

export const planetsLocale: Record<string, PlanetCopy> = {
  javascript: {
    reading: 'javascript',
    summary: 'The language that runs the frontend and Node.',
    experience: 'The base of everything. The rest of the stack does not live without it — confident daily use.',
  },
  typescript: {
    reading: 'typescript',
    summary: 'Typed JS — types at development time, not runtime.',
    experience: 'Plus: fewer prod bugs. Minus: occasional type gymnastics. In production — yes, I want it.',
  },
  node: {
    reading: 'node',
    summary: 'JS on the server — a runtime, not a framework.',
    experience: 'Backend, CLI, scripts. Plus: one language everywhere. Minus: heavy CPU is not its forte.',
  },
  react: {
    reading: 'react',
    summary: 'UI library for JS — components and state.',
    experience:
      'Moving from Vue in practice: components, hooks, state. I will not claim five years of React, but the foundation is the same.',
  },
  vue: {
    reading: 'vue',
    summary: 'JS framework — reactive UI out of the box.',
    experience: 'Main production UI stack for recent years. SFC, Vite, ecosystem — home turf.',
  },
  vite: {
    reading: 'vite',
    summary: 'Next-gen bundler / dev server.',
    experience: 'Default for frontend. Fast HMR, simple config, no Webpack suffering.',
  },
  nest: {
    reading: 'nest',
    summary: 'Node framework with modules, DI, and an Angular-like structure for the backend.',
    experience: 'For APIs and GraphQL: modules, providers, a clear service skeleton.',
  },
  prisma: {
    reading: 'prisma',
    summary: 'ORM with types and migrations.',
    experience: 'Schema → client → less hand-written SQL. Fits Nest and GraphQL well.',
  },
  graphql: {
    reading: 'graphql',
    summary: 'API query language — the client takes only the fields it needs.',
    experience: 'Schemas, resolvers, typing. Not a silver bullet, but fine for product APIs.',
  },
  postcss: {
    reading: 'postcss',
    summary: 'CSS pipeline: plugins, prefixes, modern syntax.',
    experience: 'Years in production: Browserslist, legacy/modern builds, targeted fixes for old browsers.',
  },
  docker: {
    reading: 'docker',
    summary: 'Containers — the same environment for everyone.',
    experience: 'Dev and deploy: services in compose, less “works on my machine”.',
  },
  pnpm: {
    reading: 'pnpm',
    summary: 'Package manager with strict node_modules and disk savings.',
    experience: 'Default in monorepos. Faster than npm, more predictable hoisting.',
  },
  git: {
    reading: 'git',
    summary: 'Version control.',
    experience: 'Branches, review, CI, rollbacks. Production does not exist without it.',
  },
  github: {
    reading: 'github',
    summary: 'Repo hosting, PRs, Actions, releases.',
    experience: 'Public repos, code review, CI. Personal projects and forks live there too.',
  },
  gitlab: {
    reading: 'gitlab',
    summary: 'Git + CI/CD + review in one place, often self-hosted.',
    experience: 'Production pipeline: merges, runners, auto-deploy, rollbacks without manual copy.',
  },
  tsdown: {
    reading: 'tsdown',
    summary: 'Build TypeScript libraries / packages on a modern pipeline.',
    experience: 'For internal packages and libs — faster and simpler than classic tsc + bundler zoo.',
  },
  eslint: {
    reading: 'eslint',
    summary: 'Linter for JS/TS — rules and autofixes.',
    experience: 'Team configs, flat config, antifou stack. Without a linter the repo rots fast.',
  },
  nginx: {
    reading: 'nginx',
    summary: 'Web server and reverse proxy.',
    experience: 'Static files, proxy to Node/API, SSL, configs without mystery 502s.',
  },
  sass: {
    reading: 'sass',
    summary: 'CSS with variables, mixins, and nesting (SCSS).',
    experience: 'Years of layout and themes: variables, partials, before CSS could do it natively.',
  },
  rust: {
    reading: 'rust',
    summary: 'Systems language with ownership and no GC.',
    experience: 'Hobby: trying to understand the borrow checker and not quit. Not shipping prod Rust yet — learning.',
  },
  vscode: {
    reading: 'vscode',
    summary: 'Code editor — extensions, debug, terminal in one window.',
    experience: 'Main daily tool: TS, Vue/React, Nest, lint, git — all from here.',
  },
};
