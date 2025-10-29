import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from '@/stores/StoreContext';
import { OpenAPI } from '../services/api-client';
import { authStore } from '@/stores/AuthStore';
import { setupApiInterceptors } from '@/utils/setupApiInterceptors';
import App from './App';

// Import global styles
import '@/styles/variables.css';
import '@/styles/reset.css';
import '@/styles/global.css';
import '@/styles/animations.css';

// Настройка базового URL для API
OpenAPI.BASE = 'http://localhost:5201';

// Настройка interceptors для автоматического обновления токенов
setupApiInterceptors(authStore);

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
