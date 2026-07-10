import './index.css';
import { createRoot } from 'react-dom/client';
import React, { StrictMode } from 'react';
import App from './App';
import { bootstrapBackend } from './backend/bootstrap';

// Inicia os microserviços simulados no "Backend"
bootstrapBackend();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
