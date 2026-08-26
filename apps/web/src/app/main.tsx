import { App } from '#app/app/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '#app/app/styles/global.css';

const root = document.getElementById('root');

if (root == null) {
  throw new Error('Root element #root not found');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
