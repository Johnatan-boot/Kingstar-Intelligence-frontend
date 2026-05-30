import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EventBus } from '../../infra/messaging/EventBus';

// Shell Controls: Auth, Layout, Global Events
interface ShellContextType {
  user: any;
  permissions: string[];
  publishEvent: (eventName: string, payload: any) => void;
  subscribeEvent: (eventName: string, callback: (payload: any) => void) => () => void;
  activeMfe: string;
  navigate: (mfeId: string) => void;
}

const ShellContext = createContext<ShellContextType | null>(null);

export const useShell = () => {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within ShellProvider");
  return ctx;
};

export const ShellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState({ id: 'op_01', name: 'Operador 01', role: 'Gestor Logístico' });
  const [permissions] = useState(['VIEW_INVENTORY', 'MANAGE_PURCHASES', 'SYSTEM_ADMIN']);
  const [activeMfe, setActiveMfe] = useState('ayda-core');
  
  // Event Bus implementation (MFE Communication proxied to Backend Kafka Simulator)
  const [listeners, setListeners] = useState<Record<string, ((payload: any) => void)[]>>({});

  const publishEvent = useCallback((eventName: string, payload: any) => {
    console.log(`[Shell Event Bus Frontend] Publishing: ${eventName}`, payload);
    // Dispara para frontend
    if (listeners[eventName]) {
      listeners[eventName].forEach(cb => cb(payload));
    }
    // Repassa o evento transacional para o backend (Mensageria simulada)
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

  return (
    <ShellContext.Provider value={{ user, permissions, publishEvent, subscribeEvent, activeMfe, navigate }}>
      {children}
    </ShellContext.Provider>
  );
};
