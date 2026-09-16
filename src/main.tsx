import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.tsx';
import './index.css';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

// Defensive startup cleanup: older builds may have registered a service worker
// or populated Cache Storage, which can keep serving a stale profile image even
// after a hard refresh. Unregister workers and clear caches once on startup.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
    .catch(() => {
      /* ignore cleanup failures */
    });
}

if ('caches' in window) {
  caches
    .keys()
    .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    .catch(() => {
      /* ignore cleanup failures */
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
