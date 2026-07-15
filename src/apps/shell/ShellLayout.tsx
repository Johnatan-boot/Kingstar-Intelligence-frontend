import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useShell } from './ShellProvider';
import { BrainCircuit, ShoppingCart, Truck, ClipboardCheck, LayoutDashboard, PackageSearch, BarChart3, CalendarDays, DollarSign, Settings, LogOut, Menu, X } from 'lucide-react';
import AydaWidget from '../../components/AydaWidget';
import { Toaster } from 'react-hot-toast';

// Simulando o Registro de MFEs — cada rota pode ser um MFE remoto usando Module Federation
const MFE_REGISTRY = [
  { id: 'ayda-core', name: 'Ayda Core', icon: BrainCircuit, color: '#38bdf8', component: lazy(() => import('../mfe-ayda').then(m => ({ default: m.AydaCoreMfe }))) },
  { id: 'finance', name: 'Financeiro', icon: DollarSign, color: '#22c55e', component: lazy(() => import('../mfe-financeiro').then(m => ({ default: m.FinanceiroMfe })).catch(() => ({ default: () => <div className="p-10 text-emerald-400 font-mono text-center">MFE Financeiro em Desenvolvimento</div> }))) },
  { id: 'inventory', name: 'Estoque', icon: PackageSearch, color: '#f59e0b', component: lazy(() => import('../mfe-estoque').then(m => ({ default: m.InventoryMfe }))) },
  { id: 'purchasing', name: 'Compras', icon: ShoppingCart, color: '#ec4899', component: lazy(() => import('../mfe-compras').then(m => ({ default: m.PurchasingMfe }))) },
  { id: 'receiving', name: 'Recebimento', icon: Truck, color: '#8b5cf6', component: lazy(() => import('../mfe-recebimento').then(m => ({ default: m.ReceivingMfe }))) },
  { id: 'conference', name: 'Conferência', icon: ClipboardCheck, color: '#06b6d4', component: lazy(() => import('../mfe-conferencia').then(m => ({ default: m.ConferenceMfe }))) },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: '#ef4444', component: lazy(() => import('../mfe-analytics').then(m => ({ default: m.AnalyticsMfe }))) },
  { id: 'schedule', name: 'Agenda', icon: CalendarDays, color: '#10b981', component: lazy(() => import('../mfe-agenda').then(m => ({ default: m.AgendaMfe }))) },
  { id: 'admin', name: 'Configurações', icon: Settings, color: '#94a3b8', component: lazy(() => import('../mfe-admin').then(m => ({ default: m.AdminMfe }))) },
];

export function ShellLayout() {
  const { user, activeMfe, navigate, logout } = useShell();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = MFE_REGISTRY.find(m => m.id === activeMfe)?.component;
  const activeDef = MFE_REGISTRY.find(m => m.id === activeMfe);

  // Fecha a sidebar automaticamente ao trocar de tela no mobile.
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeMfe]);

  const handleNavigate = (id: string) => {
    navigate(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#121212] text-[#e5e5e5] overflow-hidden font-sans selection:bg-sky-500/30">

      {/* Fundo escuro (backdrop) — some apenas no mobile, quando a sidebar está aberta */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — vira uma gaveta (drawer) deslizante no mobile/tablet e fica fixa em telas grandes (lg+) */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 max-w-[85vw] bg-[#161616] border-r border-[#242424] flex flex-col h-full shrink-0 z-30
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[#242424] shrink-0 justify-between">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mr-3 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <span className="font-bold text-white tracking-widest text-lg leading-none">K</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-widest leading-none text-white truncate" style={{ letterSpacing: '0.1em' }}>KINGSTAR</span>
              <span className="text-[10px] text-sky-400 tracking-widest font-mono font-bold truncate" style={{ letterSpacing: '0.05em' }}>ORQUESTRADOR DE MFEs</span>
            </div>
          </div>
          {/* Botão de fechar a sidebar, visível apenas no mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-[#8b9dc3] hover:text-white rounded-md hover:bg-[#22252B] shrink-0"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto px-3 hide-scrollbar">
          <div className="text-[10px] font-mono text-[#8b9dc3] uppercase px-3 mb-2 tracking-wider font-semibold">
            Microfrontends
          </div>

          {MFE_REGISTRY.map(mfe => {
            // Só mostra "Configurações" (CRUD de usuários) para perfis ADMIN/SUPER_ADMIN reais
            if (mfe.id === 'admin' && !['ADMIN', 'SUPER_ADMIN'].includes(user?.role ?? '')) return null;

            const isActive = activeMfe === mfe.id;
            const Icon = mfe.icon;

            return (
              <button
                key={mfe.id}
                onClick={() => handleNavigate(mfe.id)}
                className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left outline-none group ${
                  isActive ? 'text-white bg-[#22252B]' : 'text-[#8b9dc3] hover:text-[#e5e5e5] hover:bg-[#22252B]/50'
                }`}
              >
                <Icon size={20} className="transition-colors duration-200 shrink-0" color={isActive ? mfe.color : 'currentColor'} />
                <span className="tracking-wide truncate">{mfe.name}</span>
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ backgroundColor: mfe.color }} />
                )}
              </button>
            )
          })}
        </div>

        {/* Status de autenticação e Sair, controlados pelo Shell */}
        <div className="p-4 border-t border-[#242424] shrink-0 bg-[#161616]">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-xs font-bold border border-[#333] text-sky-400 shrink-0">
                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">{user?.name}</span>
                <span className="text-[10px] text-[#8b9dc3] font-mono truncate">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair do Sistema"
              className="p-2 text-[#8b9dc3] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Container Principal */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a0a] min-w-0">

        <header className="h-16 border-b border-[#242424] bg-[#161616]/80 backdrop-blur-md flex items-center px-3 sm:px-6 justify-between shrink-0 z-10 sticky top-0 gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Botão hamburguer — abre a sidebar, visível apenas no mobile/tablet */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#8b9dc3] hover:text-white rounded-lg hover:bg-[#22252B] shrink-0"
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-white truncate">{activeDef?.name || 'MFE'}</h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#242424] text-[#8b9dc3] text-[10px] font-mono border border-[#333] shrink-0">
              ID_MFE: {activeMfe}
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 text-xs font-mono text-[#8b9dc3] shrink-0">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline">STATUS:</span>
                <span className="text-emerald-400 font-bold">SISTEMA ONLINE</span>
            </div>
          </div>
        </header>

        {/* Ponto de montagem dinâmico dos MFEs */}
        <div className="flex-1 overflow-auto relative z-0" id="mfe-mount">
          <Suspense fallback={
            <div className="h-full flex flex-col items-center justify-center text-[#8b9dc3] gap-4 font-mono text-sm tracking-widest px-4 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-r-transparent animate-spin" />
              <span>CARREGANDO MÓDULO [{activeMfe}] ...</span>
            </div>
          }>
            {ActiveComponent ? <ActiveComponent /> : (
              <div className="flex items-center justify-center h-full p-8 text-red-400 font-mono text-sm text-center">
                [Erro do Shell] Módulo não encontrado no registro: {activeMfe}
              </div>
            )}
          </Suspense>
        </div>
      </main>

      {/* Widget Global injetado pelo Shell */}
      <AydaWidget />

      {/* Sistema Global de Notificações */}
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1e1e1e', color: '#fff', border: '1px solid #333' }
      }} />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
