import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { StoreProvider } from '@/stores/StoreContext';
import { theme, GlobalStyles } from '@/styles';
import { OpenAPI } from '../services/api-client';
import App from './App';

// Настройка базового URL для API
OpenAPI.BASE = 'http://localhost:5201';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StoreProvider>
  </StrictMode>,
);
