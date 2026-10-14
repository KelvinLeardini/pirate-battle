import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { setupAxiosFallback } from './mocks/handlers';

const queryClient = new QueryClient();

// Inicializa o fallback do Axios para suporte imediato em produção e Vercel
setupAxiosFallback();

async function enableMocking() {
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  } catch (err) {
    console.warn('MSW worker registration notice:', err);
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
});