import axios from 'axios';

/**
 * Cliente HTTP central do frontend.
 *
 * - baseURL vem de VITE_API_URL (configurada no Render).
 * - O token JWT é mantido EM MEMÓRIA (perde ao recarregar a página, por opção de segurança).
 * - Um interceptor injeta automaticamente o header Authorization: Bearer <token>.
 */

// Em dev, se VITE_API_URL não estiver setada, cai no backend local.
const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:3000';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Token em memória ────────────────────────────────────────────────
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

// ── Interceptor de request: anexa o Bearer ──────────────────────────
http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// ── Interceptor de response: normaliza mensagens de erro ────────────
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Mantém o formato err.response.data.message que as telas já leem.
    return Promise.reject(error);
  }
);
