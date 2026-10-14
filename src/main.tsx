import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return;
  }
  
  const { worker } = await import('./mocks/browser');
  
  // Iniciando sem parâmetros extras para evitar erro de tipagem (ts2353)
  return worker.start();
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