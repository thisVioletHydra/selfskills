export const profileLocaleSeed = {
  locale: 'en',
  name: 'Roman Rybchin',
  blurb:
    'Fullstack developer: JavaScript is the core — Vue and React on the front, Node.js and NestJS on the back, Prisma and GraphQL in between. Docker and CI/CD are part of the job. If the stack is jQuery or other legacy — fine, I will figure it out.',
  facts: [
    { label: 'Age', value: '29' },
    { label: 'City', value: 'Moscow' },
    { label: 'Format', value: 'Remote' },
    { label: 'Employment', value: 'Full-time' },
    { label: 'Experience', value: '5 years' },
    { label: 'Education', value: 'BSUIR, electronic marketing' },
  ],
  about: [
    'Fullstack developer with a frontend focus; most of my career has been on commercial products. Core stack: TypeScript, JavaScript, React, Vue 3, HTML, CSS, PostCSS, Vite, and Node.js. I work with REST APIs and GraphQL, build projects in pnpm monorepos, use Git, and set up CI/CD. On the backend I use NestJS, Fastify, Prisma, PostgreSQL, and SQLite: I ship APIs from scratch, integrate payments, and deploy to production. On frontend projects I use TanStack Query, Zustand, Tailwind CSS, shadcn/ui, Orval, and Zod; for testing and monitoring I add Vitest, Playwright, and Sentry.',

    'I can assemble a product end to end: frontend, GraphQL API, and database as one TypeScript-typed system. In my own projects I take React + NestJS + Prisma to production with deploys on Railway and GitHub Pages. In payment flows I implemented idempotent webhooks, concurrency-safe key delivery, and retry logic for external providers. I am comfortable with Docker and virtualization: I pick lean base images (Alpine instead of full Node images), write docker-compose for local dev, and configure GitHub Actions pipelines.',

    'I prefer AI agents over hand-typing routine code. That is not giving up thinking: I design the solution, set constraints, and own the outcome; the agent handles mechanics. Speed goes up; attention shifts to architecture and hard parts. On the right tasks that turns days of work into hours.',

    'I am looking for remote work on a product that keeps evolving — where there are problems to think through, not just a conveyor of identical pages.',
  ],
} as const;
