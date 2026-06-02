import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { EventBus } from '../../infra/messaging/EventBus';
import { useAuth } from '../../context/AuthContext';
import { mfesPermitidos, podeVerSigiloso, rotuloFuncao } from '../../auth/permissions';

// Shell Controls: Auth, Layout, Global Events
interface ShellContextType {
  user: { id: string; name: string; role: string; funcao: string; departamento: string };
  permissions: string[];          // MFE ids liberados para o perfil
  canViewSensitive: boolean;       // pode ver NF / valor de mercadoria
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
  const { user: authUser } = useAuth();

  const funcao = authUser?.funcao ?? 'RECEBIMENTO';

  const user = useMemo(() => ({
    id: authUser?.id ?? '',
    name: authUser?.nome || authUser?.email || 'Usuário',
    role: rotuloFuncao(funcao),
    funcao,
    departamento: authUser?.departamento ?? '',
  }), [authUser, funcao]);

  const permissions = useMemo(() => mfesPermitidos(funcao), [funcao]);
  const canViewSensitive = useMemo(() => podeVerSigiloso(funcao), [funcao]);

  // Primeira tela permitida (fallback de navegação).
  const primeiraTela = permissions[0] ?? 'inventory';
  const [activeMfe, setActiveMfe] = useState(
    permissions.includes('ayda-core') ? 'ayda-core' : primeiraTela
  );

  const [listeners, setListeners] = useState<Record<string, ((payload: any) => void)[]>>({});

  const publishEvent = useCallback((eventName: string, payload: any) => {
    if (listeners[eventName]) listeners[eventName].forEach(cb => cb(payload));
    EventBus.publish(eventName, payload);
  }, [listeners]);

  const subscribeEvent = useCallback((eventName: string, callback: (payload: any) => void) => {
    setListeners(prev => ({ ...prev, [eventName]: [...(prev[eventName] || []), callback] }));
    return () => {
      setListeners(prev => ({ ...prev, [eventName]: prev[eventName]?.filter(cb => cb !== callback) || [] }));
    };
  }, []);

  // Navegação respeitando permissões.
  const navigate = useCallback((mfeId: string) => {
    if (!permissions.includes(mfeId)) {
      console.warn(`[Shell] Acesso negado ao MFE: ${mfeId}`);
      return;
    }
    setActiveMfe(mfeId);
    window.location.hash = mfeId;
  }, [permissions]);

  useEffect(() => {
    const aplicarHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && permissions.includes(hash)) {
        setActiveMfe(hash);
      } else if (hash && !permissions.includes(hash)) {
        // tentou acessar tela sem permissão → volta pra primeira liberada
        setActiveMfe(primeiraTela);
        window.location.hash = primeiraTela;
      }
    };
    aplicarHash();
    window.addEventListener('hashchange', aplicarHash);
    return () => window.removeEventListener('hashchange', aplicarHash);
  }, [permissions, primeiraTela]);

  // Se o perfil mudar (novo login) e a tela ativa não for permitida, corrige.
  useEffect(() => {
    if (!permissions.includes(activeMfe)) {
      setActiveMfe(permissions.includes('ayda-core') ? 'ayda-core' : primeiraTela);
    }
  }, [permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ShellContext.Provider value={{ user, permissions, canViewSensitive, publishEvent, subscribeEvent, activeMfe, navigate }}>
      {children}
    </ShellContext.Provider>
  );
};
