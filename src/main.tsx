import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { migrateLegacyStorage } from './constants/storage';
import { initOfflineService } from './services/offline';
import { Toaster } from './components/ui/sonner';

migrateLegacyStorage();

// Initialize offline service
initOfflineService();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      richColors
    />
  </StrictMode>,
);
