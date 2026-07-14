import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    return !!localStorage.getItem('kg_user_session');
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

  const login = async (email?: string, password?: string) => { 
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAuthenticated(true); 
    localStorage.setItem('kg_user_session', 'true'); 
    const profile: UserProfile = { name: email ?? 'User', email: email ?? '', role: 'user' };
    setUser(profile);
    localStorage.setItem('kg_user_profile', JSON.stringify(profile));
  };

  // Garanta que a função register exista aqui:
  const register = async (email: string, pass: string, name: string, dept: string, role: string) => { 
    await new Promise(resolve => setTimeout(resolve, 800));
    // Por padrão, o cadastro não loga o usuário, então não mexemos no setIsAuthenticated
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('kg_user_session');
    localStorage.removeItem('kg_user_profile');
  };

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