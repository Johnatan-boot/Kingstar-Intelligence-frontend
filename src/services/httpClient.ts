// src/services/httpClient.ts
// Cliente HTTP real, conectado ao backend Kingstar (Fastify + MySQL).
// Substitui as chamadas mockadas que existiam antes em `api.ts`.
import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const http = axios.create({ baseURL });

// Anexa o JWT salvo no login em toda requisição autenticada.
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('kg_token');
  if (token) {
    (config.headers as any) = { ...(config.headers as any), Authorization: `Bearer ${token}` };
  }
  return config;
});

// Se o token expirar/for inválido, limpa a sessão local para forçar
// um novo login (evita ficar preso com um token morto).
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('kg_token');
      localStorage.removeItem('kg_user_profile');
      localStorage.removeItem('kg_user_session');
    }
    return Promise.reject(err);
  }
);

export default http;
