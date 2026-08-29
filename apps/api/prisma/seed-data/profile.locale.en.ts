export const profileLocaleSeed = {
  locale: 'en',
  name: 'Roman Rybchin',
  blurb:
    'Fullstack developer: JavaScript is the core — Vue and React on the front, Node.js and NestJS on the back, Prisma and GraphQL in between. Docker and CI/CD are part of the job. If the stack is jQuery, PHP, or other legacy — fine, I will figure it out.',
  facts: [
    { label: 'Age', value: '29' },
    { label: 'City', value: 'Moscow' },
    { label: 'Format', value: 'Remote' },
    { label: 'Employment', value: 'Full-time' },
    { label: 'Experience', value: '5 years' },
    { label: 'Education', value: 'BSUIR, electronic marketing' },
  ],
  about: [
    'My main stack is TypeScript, JavaScript, Vue 3, and Vite. I have worked on auth flows, large interfaces, legacy code, and old-browser compatibility. One of the products I contributed to is listed in the Russian software registry and passed FSTEC certification.',
    'I am learning React hands-on: migrating interfaces from Vue, working with hooks and state. I will not claim five years of production React if that is not true. But a Vue → React transition on a real project is a normal task for me, not theory.',
    'I try to offload routine work to AI tools and stay where decisions, trade-offs, and ownership matter. I am looking for remote work on a product worth growing — not just closing identical tickets on a conveyor.',
  ],
} as const;
