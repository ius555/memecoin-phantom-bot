import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/inter/index.css';
import '@fontsource-variable/jetbrains-mono/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setConsoleFunction } from 'three';
import App from './App';
import './index.css';

// React Three Fiber folosește încă THREE.Clock, pe care three.js îl anunță ca învechit la fiecare pornire.
// Filtrăm doar acel mesaj; toate celelalte avertismente three.js ajung neschimbate în consolă.
setConsoleFunction((type: 'log' | 'warn' | 'error', message: string, ...rest: unknown[]) => {
  if (type === 'warn' && message.includes('THREE.Clock')) return;
  console[type](message, ...rest);
});

/**
 * Texturile PCB-urilor sunt desenate pe canvas cu fonturile site-ului, deci le așteptăm
 * înainte de prima randare (cel mult 2,5 s — după aceea pornim cu fonturile sistemului).
 */
async function fontsReady() {
  if (!('fonts' in document)) return;
  const sample = 'ABCabc0123ĂÂÎȘȚăâîșț';
  const wanted = ['600 16px "Inter Variable"', '500 16px "JetBrains Mono Variable"', '500 16px "Fraunces Variable"'];
  await Promise.race([
    Promise.all(wanted.map((f) => document.fonts.load(f, sample))).catch(() => undefined),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
}

// Pentru depanare din consolă: adaugă ?debug la adresă.
if (import.meta.env.DEV || location.search.includes('debug')) {
  void Promise.all([import('./state/stage'), import('./state/app')]).then(([s, a]) => {
    Object.assign(window, { __lab: { stage: s.stage, app: a.useApp } });
  });
}

void fontsReady().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
