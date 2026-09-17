import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './services/loggerService.js';
import App from './App.jsx';

// One-time startup cleanup of legacy localStorage caches
(() => {
  const legacyKeys = [
    'codelift_data',
    'codelift_admin_data_v2',
    'codelift_students',
    'codelift_students_cache',
    'codelift_coding_problems',
    'codelift_coding_attempts',
    'codelift_enrollments'
  ];
  legacyKeys.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  });
})();

// Automatically recover from stale Vite chunk hashes after production deployments
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('[CodeLift] Detected Vite preload chunk error after deployment. Reloading fresh assets...', event);
    window.location.reload();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Importing a module script failed')
    ) {
      console.warn('[CodeLift] Detected stale dynamic chunk rejection. Reloading page...', msg);
      const lastReload = sessionStorage.getItem('codelift_last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('codelift_last_chunk_reload', now.toString());
        window.location.reload();
      }
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
