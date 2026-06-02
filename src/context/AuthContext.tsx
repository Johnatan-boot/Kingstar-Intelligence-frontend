import React, { createContext, useContext, useState, ReactNode } from 'react';
import { http, setAuthToken } from '../services/http';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // POST /auth/login → { message, token, usuario }
  const login = async (email?: string, password?: string) => {
    const { data } = await http.post('/auth/login', { email, password });
    const token = data?.token;
    if (!token) throw new Error('Resposta de login sem token');

    setAuthToken(token);

    // O backend devolve `usuario`; se faltar, decodifica o payload do JWT.
    let u: AuthUser | null = data?.usuario ?? null;
    if (!u) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        u = {
          id: payload.sub ?? '',
          nome: payload.name ?? '',
          email: email ?? '',
          funcao: payload.funcao ?? 'RECEBIMENTO',
          departamento: payload.departamento ?? '',
        };
      } catch {
        u = { id: '', nome: email ?? '', email: email ?? '', funcao: 'RECEBIMENTO', departamento: '' };
      }
    }

    setUser(u);
    setIsAuthenticated(true);
  };

  // Registro público cria sempre o perfil de menor privilégio (definido no backend).
  const register = async (email: string, pass: string, name: string, _dept: string, _role: string) => {
    await http.post('/auth/register', { name, email, password: pass });
  };

  const logout = () => {
    setAuthToken(null);
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
