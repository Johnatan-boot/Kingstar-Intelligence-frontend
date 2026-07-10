import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  register: (email: string, pass: string, name: string, dept: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simple auth state for demo purposes.
  // In a real app this would check JWT tokens from cookies or local storage.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (email?: string, password?: string) => { 
    // Mock login API
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAuthenticated(true); 
  };
  
  const register = async (email: string, pass: string, name: string, dept: string, role: string) => { 
    // Mock registration API 
    await new Promise(resolve => setTimeout(resolve, 800));
  };
  
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
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
