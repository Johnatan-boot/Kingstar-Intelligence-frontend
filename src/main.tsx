import './index.css';
import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import App from './App';

// Inicia os microserviços simulados no "Backend"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
