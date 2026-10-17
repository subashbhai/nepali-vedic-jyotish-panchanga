import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerSW';
import { initGlobalErrorLogging } from './utils/errorLogger';

// Initialize global error and rejection reporting to dedicated 'error-log' localStorage key
initGlobalErrorLogging();

// Register and manage service worker lifecycle
registerServiceWorker();



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
