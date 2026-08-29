import type { IncomingMessage, ServerResponse } from 'node:http';

import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';
import { assetManifestPlugin } from './vite/asset-manifest-plugin.ts';

const logger = createLogger();
const warn = logger.warn.bind(logger);
const error = logger.error.bind(logger);

logger.warn = (msg, options) => {
  if (typeof msg === 'string' && msg.includes('http proxy error')) {
    return;
  }

  warn(msg, options);
};

logger.error = (msg, options) => {
  if (typeof msg === 'string' && msg.includes('http proxy error')) {
    return;
  }

  error(msg, options);
};

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: githubPages ? '/selfskills/' : '/',
  customLogger: logger,
  plugins: [assetManifestPlugin(), react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('error', (_err, _req, res) => {
            const response = res as ServerResponse | IncomingMessage;

            if (!('writeHead' in response) || response.headersSent) {
              return;
            }

            response.writeHead(502, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ errors: [{ message: 'Bad Gateway' }] }));
          });
        },
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
