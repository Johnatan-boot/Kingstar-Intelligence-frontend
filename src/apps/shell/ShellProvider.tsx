import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EventBus } from '../../backend/infra/messaging/EventBus';
import { useAuth } from '../../context/AuthContext';

// Shell Controls: Auth, Layout, Global Events
interface ShellContextType {
  user: any;
  permissions: string[];
  publishEvent: (eventName: string, payload: any) => void;
  subscribeEvent: (eventName: string, callback: (payload: any) => void) => () => void;
  activeMfe: string;
  navigate: (mfeId: string) => void;
  logout: () => void;
}

const ShellContext = createContext<ShellContextType | null>(null);

export const useShell = () => {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
};

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  
  // Baseando permissões no role do user (RF-005: Controle de permissões por perfil)
  const getPermissions = () => {
    if (!user) return [];
    if (user.role === 'SYSTEM_ADMIN') return ['VIEW_INVENTORY', 'MANAGE_PURCHASES', 'SYSTEM_ADMIN', 'MANAGE_USERS'];
    if (user.role === 'GESTOR') return ['VIEW_INVENTORY', 'MANAGE_PURCHASES'];
    return ['VIEW_INVENTORY'];
  };
  
  const [permissions] = useState<string[]>(getPermissions());
  const [activeMfe, setActiveMfe] = useState('ayda-core');

  // Event Bus implementation (MFE Communication proxied to Backend Kafka Simulator)
  const [listeners, setListeners] = useState<Record<string, ((payload: any) => void)[]>>({});

  const publishEvent = useCallback((eventName: string, payload: any) => {
    console.log(`[Shell Event Bus Frontend] Publishing: ${eventName}`, payload);
    if (listeners[eventName]) {
      listeners[eventName].forEach(cb => cb(payload));
    }
    EventBus.publish(eventName, payload);
  }, [listeners]);

  const subscribeEvent = useCallback((eventName: string, callback: (payload: any) => void) => {
    setListeners(prev => ({
      ...prev,
      [eventName]: [...(prev[eventName] || []), callback]
    }));
    return () => {
      setListeners(prev => ({
        ...prev,
        [eventName]: prev[eventName]?.filter(cb => cb !== callback) || []
      }));
    };
  }, []);

  const navigate = useCallback((mfeId: string) => {
    console.log(`[Shell Router] Navigating to MFE: ${mfeId}`);
    setActiveMfe(mfeId);
    window.location.hash = mfeId;
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveMfe(hash);
    }
    const handleHashChange = () => {
        const _hash = window.location.hash.replace('#', '');
        if(_hash) setActiveMfe(_hash);
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Make sure we have a fallback for user to avoid crashes if somehow null 
  // (though AppContent guards this, good to be safe)
  const safeUser = user || { id: '0', name: 'Unknown', role: 'GUEST' };

  return (
    <ShellContext.Provider value={{ user: safeUser, permissions, publishEvent, subscribeEvent, activeMfe, navigate, logout }}>
      {children}
    </ShellContext.Provider>
  );
};
