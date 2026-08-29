/** Dev: `/graphql` via Vite proxy. Prod/Pages: full URL to remote Nest. */
export function graphqlUrl(): string {
  const fromEnv = import.meta.env.VITE_GRAPHQL_URL;

  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim().replace(/\/$/, '');
  }

  return '/graphql';
}
