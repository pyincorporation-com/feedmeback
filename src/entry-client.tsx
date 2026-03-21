import './index.css';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// Make sure we're on client side
if (typeof window !== 'undefined') {
  hydrateRoot(
    document.getElementById('root') as HTMLElement,
    <StrictMode>
      <App />
    </StrictMode>
  );
}