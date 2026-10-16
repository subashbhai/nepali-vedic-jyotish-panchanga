import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerSW';
import { initGlobalErrorLogging } from './utils/errorLogger';

// Initialize global error and rejection reporting to dedicated 'error-log' localStorage key
initGlobalErrorLogging();

// One-time purge of all demo accounts from browser localStorage
try {
  const PURGE_KEY = 'balananda_clean_production_purge_v2081';
  if (typeof window !== 'undefined' && localStorage.getItem(PURGE_KEY) !== 'done') {
    localStorage.removeItem('balananda_client_access_control_v2');
    localStorage.removeItem('balananda_rbac_users_v2');
    localStorage.removeItem('balananda_client_leads_v2');
    localStorage.removeItem('balananda_service_licenses_v1');
    localStorage.removeItem('balananda_all_registered_users_v1');
    localStorage.removeItem('balananda_approved_client_license_v2');
    localStorage.removeItem('sukdev_user_subscription_account_v1');
    localStorage.setItem(PURGE_KEY, 'done');
  }
} catch {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
