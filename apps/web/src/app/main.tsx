import { App } from '#web/app/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '#web/app/styles/global.css';

const root = document.getElementById('root');

if (root === null || root === undefined) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
