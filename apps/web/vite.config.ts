import type { IncomingMessage, ServerResponse } from 'node:http';

import react from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';

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

export default defineConfig({
  customLogger: logger,
  plugins: [react()],
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
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
