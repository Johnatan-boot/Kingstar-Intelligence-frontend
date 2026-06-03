import axios from 'axios';

/**
 * Cliente HTTP central do frontend.
 *
 * - baseURL vem de VITE_API_URL (configurada no Render).
 * - O token JWT é PERSISTIDO no localStorage, então a sessão SOBREVIVE ao
 *   refresh / F5 (não desloga mais ao recarregar a página).
 * - Um interceptor injeta automaticamente o header Authorization: Bearer <token>.
 */

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:3000';

export const http = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Token persistido (localStorage) ─────────────────────────────────
const TOKEN_KEY = 'kingstar.token';

// Inicia já com o token salvo (se houver), para o interceptor funcionar após o F5.
let authToken: string | null =
  typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage indisponível (ex.: modo privado) — segue só em memória */
  }
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
  (error) => Promise.reject(error)
);
