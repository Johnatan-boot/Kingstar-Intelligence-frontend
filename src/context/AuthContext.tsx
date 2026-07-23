import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { http } from '../services/httpClient';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email?: string, password?: string) => Promise<void>;
  register: (email: string, pass: string, name: string, dept: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('kg_token');
  });
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem('kg_user_profile');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  });

  // Login real: autentica contra POST /auth/login e guarda o JWT.
  // Esse token é o que libera o acesso aos KPIs de Analytics/AYDA Core
  // (rotas restritas a perfis de acesso total no backend).
  const login = async (email?: string, password?: string) => {
    const { data } = await http.post('/auth/login', { email, password });
    const token = data.token;
    const usuario = data.usuario;

    localStorage.setItem('kg_token', token);
    // Mantido por compatibilidade com telas que checam essa flag legada.
    localStorage.setItem('kg_user_session', 'true');

    const profile: UserProfile = {
      name: usuario?.nome ?? email ?? 'Usuário',
      email: usuario?.email ?? email ?? '',
      role: usuario?.funcao ?? 'RECEBIMENTO',
    };
    setUser(profile);
    localStorage.setItem('kg_user_profile', JSON.stringify(profile));
    setIsAuthenticated(true);
  };

  const register = async (email: string, pass: string, name: string, dept: string, role: string) => {
    await http.post('/auth/register', { name, email, password: pass, departamento: dept, funcao: role });
    // Cadastro não loga automaticamente — segue o mesmo comportamento anterior.
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('kg_token');
    localStorage.removeItem('kg_user_session');
    localStorage.removeItem('kg_user_profile');
  };

  // Reage à expiração/invalidação do token (detectada pelo interceptor
  // de resposta 401 em httpClient.ts): sem isto, a UI continuava se
  // achando autenticada mesmo com a sessão local já limpa.
  useEffect(() => {
    const aoExpirarSessao = () => {
      setIsAuthenticated(false);
      setUser(null);
      toast.error('Sua sessão expirou. Faça login novamente.');
    };
    window.addEventListener('kg:sessao-expirada', aoExpirarSessao);
    return () => window.removeEventListener('kg:sessao-expirada', aoExpirarSessao);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
       {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
