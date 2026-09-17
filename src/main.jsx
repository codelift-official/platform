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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
