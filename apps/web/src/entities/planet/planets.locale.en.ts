import type { Planet } from '#web/entities/planet/planets';

type PlanetCopy = Pick<Planet, 'reading' | 'summary' | 'experience'>;

export const planetsLocale: Record<string, PlanetCopy> = {
  javascript: {
    reading: 'javascript',
    summary: 'A language that promised to animate a few buttons, then took over browsers, servers, and my life.',
    experience: 'I write it every day. We are long past introductions; now we just deal with the consequences together.',
  },
  typescript: {
    reading: 'typescript',
    summary: 'JavaScript with anxiety: it needs to know whether we are absolutely sure about this.',
    experience: 'Always in production. Types save an evening or consume one whole, but plain JS no longer feels like home.',
  },
  node: {
    reading: 'node',
    summary: 'The moment JavaScript escaped the browser and decided it was backend now.',
    experience: 'My APIs, CLIs, and countless “five-minute” scripts run on it. For heavy computation, I call a different hero.',
  },
  react: {
    reading: 'react',
    summary: 'A UI library where everything is a component and the real argument is where state should live.',
    experience:
      'Moving over from Vue by building, not reading summaries: components, hooks, state. I will not manufacture five years of experience; I am earning the real kind.',
  },
  vue: {
    reading: 'vue',
    summary: 'A framework that starts by being helpful and quietly turns into home.',
    experience: 'My main production UI stack for the past few years. SFCs, reactivity, and the ecosystem are familiar without a map.',
  },
  vite: {
    reading: 'vite',
    summary: 'The “start a frontend without suffering first” button.',
    experience: 'My default for new projects: quick to start, easy to configure, and it does not demand a separate lifetime for build tooling.',
  },
  nest: {
    reading: 'nest',
    summary: 'Node backend in a suit: modules seated, dependencies introduced, chaos waiting outside.',
    experience: 'I use it for APIs and GraphQL when a service needs to survive both launch day and the following Monday.',
  },
  prisma: {
    reading: 'prisma',
    summary: 'An interpreter between the database and TypeScript, trying its best to keep them on speaking terms.',
    experience: 'Schemas, migrations, and typed queries beside Nest and GraphQL. It does not replace SQL, but it catches plenty of silly mistakes before I do.',
  },
  graphql: {
    reading: 'graphql',
    summary: 'An API where the client submits a wish list and gets exactly that—assuming the resolvers are feeling kind.',
    experience: 'I work with schemas, resolvers, and types. I do not drag it into every project; sometimes plain REST is the more honest deal.',
  },
  postcss: {
    reading: 'postcss',
    summary: 'A workshop where CSS passes through plugins before meeting actual browsers.',
    experience: 'Years in production: Browserslist, modern and legacy builds, and carefully negotiated truces with browsers we should have retired.',
  },
  docker: {
    reading: 'docker',
    summary: 'A box for an app, so it stops changing personality whenever it moves to another machine.',
    experience: 'I package development environments and services with Compose. “Works on my machine” gets much shorter and considerably sadder after that.',
  },
  pnpm: {
    reading: 'pnpm',
    summary: 'A package manager that saves disk space and stops dependencies from pretending they are family.',
    experience: 'My default, especially in monorepos. Fast, strict, and reasonably predictable—a rare combination around node_modules.',
  },
  git: {
    reading: 'git',
    summary: 'A time machine for code where pressing the wrong button can still feel terrifying.',
    experience: 'Branches, reviews, releases, and rollbacks are daily routine. I particularly enjoy deleting a bad decision from the future.',
  },
  github: {
    reading: 'github',
    summary: 'Where code lives in public, gets reviewed, and occasionally earns a star from a stranger at 3 a.m.',
    experience: 'Public repositories, pull requests, Actions, and releases. My projects live here, along with the full history of questionable decisions.',
  },
  gitlab: {
    reading: 'gitlab',
    summary: 'A whole factory built around Git: reviews upstairs, pipelines clanking below.',
    experience: 'I have set up production pipelines, runners, automated deploys, and rollbacks. Fewer release rituals mean quieter nights.',
  },
  tsdown: {
    reading: 'tsdown',
    summary: 'A young bundler that wants the TypeScript library packed before the coffee cools.',
    experience: 'I use it for internal packages and libraries. Fewer tools in the chain means fewer places for a build to become a mystery.',
  },
  eslint: {
    reading: 'eslint',
    summary: 'The colleague who quietly underlines the problem before a reviewer has to.',
    experience: 'I build flat configs, team rules, and shared presets. It is picky, but arguing with it is usually cheaper than shipping a bug.',
  },
  nginx: {
    reading: 'nginx',
    summary: 'The doorman: serves static files, sends requests to the right place, and hears the first scream of “502”.',
    experience: 'I have configured proxies to Node APIs, SSL, and static delivery. If the config is boring and readable, the evening went well.',
  },
  sass: {
    reading: 'sass',
    summary: 'CSS from the days when variables and nesting were things you had to bring yourself.',
    experience: 'Years of layouts, themes, partials, and mixins. CSS has grown up, but old friendships are not discarded without a reason.',
  },
  rust: {
    reading: 'rust',
    summary: 'A language that takes the bugs away, then asks you to prove ownership of every object in the house.',
    experience: 'Still learning for myself and honestly losing individual rounds to the borrow checker. No invented production story—this planet is still far away.',
  },
  vscode: {
    reading: 'vscode',
    summary: 'An editor that started lightweight, collected extensions, and now knows far too much about me.',
    experience: 'My main work window every day: TypeScript, Vue, React, Nest, terminal, and Git. It is usually the last thing I close.',
  },
};
