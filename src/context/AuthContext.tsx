import React, { createContext, useContext, useState, ReactNode } from 'react';
import { http, setAuthToken, getAuthToken } from '../services/http';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  funcao: string;        // papel (RBAC): ADMIN, COMPRAS, RECEBIMENTO, ...
  departamento: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (email: string, pass: string, name: string, dept: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'kingstar.user';

// Decodifica o usuário a partir do payload do JWT (fallback).
function usuarioDoToken(token: string, email?: string): AuthUser {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? '',
      nome: payload.name ?? '',
      email: email ?? '',
      funcao: payload.funcao ?? 'RECEBIMENTO',
      departamento: payload.departamento ?? '',
    };
  } catch {
    return { id: '', nome: email ?? '', email: email ?? '', funcao: 'RECEBIMENTO', departamento: '' };
  }
}

// Reidrata a sessão salva (token + usuário) — chamado uma vez na inicialização.
function carregarSessao(): AuthUser | null {
  const token = getAuthToken(); // já vem do localStorage (ver http.ts)
  if (!token) return null;
  try {
    const salvo = window.localStorage.getItem(USER_KEY);
    if (salvo) return JSON.parse(salvo) as AuthUser;
  } catch { /* ignora */ }
  return usuarioDoToken(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial já considera uma sessão persistida → não desloga no F5.
  const sessaoInicial = carregarSessao();
  const [user, setUser] = useState<AuthUser | null>(sessaoInicial);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!sessaoInicial);

  // POST /auth/login → { message, token, usuario }
  const login = async (email?: string, password?: string) => {
    const { data } = await http.post('/auth/login', { email, password });
    const token = data?.token;
    if (!token) throw new Error('Resposta de login sem token');

    setAuthToken(token); // persiste no localStorage

    const u: AuthUser = data?.usuario ?? usuarioDoToken(token, email);

    try { window.localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch { /* ignora */ }

    setUser(u);
    setIsAuthenticated(true);
  };

  // Registro público cria sempre o perfil de menor privilégio (definido no backend).
  const register = async (email: string, pass: string, name: string, _dept: string, _role: string) => {
    await http.post('/auth/register', { name, email, password: pass });
  };

  const logout = () => {
    setAuthToken(null);
    try { window.localStorage.removeItem(USER_KEY); } catch { /* ignora */ }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
