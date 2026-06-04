import kingstarLogo from '../../assets/logo_kingstar.png';
import React, { Suspense, lazy } from 'react';
import { useShell } from './ShellProvider';
import { BrainCircuit, ShoppingCart, Truck, ClipboardCheck, LayoutDashboard, PackageSearch, BarChart3, CalendarDays, DollarSign } from 'lucide-react';
import AydaWidget from '../components/AydaWidget';
import { Toaster } from 'react-hot-toast';

// Simulating MFE Registry - each route could be a remote MFE using Module Federation
const MFE_REGISTRY = [
  { id: 'ayda-core', name: 'Ayda Core', icon: BrainCircuit, color: '#38bdf8', component: lazy(() => import('../apps/mfe-ayda').then(m => ({ default: m.AydaCoreMfe }))) },
  { id: 'finance', name: 'Financeiro', icon: DollarSign, color: '#22c55e', component: lazy(() => import('../apps/mfe-financeiro').then(m => ({ default: m.FinanceiroMfe })).catch(() => ({ default: () => <div className="p-10 text-emerald-400 font-mono text-center">MFE Financeiro em Desenvolvimento</div> }))) },
  { id: 'inventory', name: 'Estoque', icon: PackageSearch, color: '#f59e0b', component: lazy(() => import('../apps/mfe-estoque').then(m => ({ default: m.InventoryMfe }))) },
  { id: 'purchasing', name: 'Compras', icon: ShoppingCart, color: '#ec4899', component: lazy(() => import('../apps/mfe-compras').then(m => ({ default: m.PurchasingMfe }))) },
  { id: 'receiving', name: 'Recebimento', icon: Truck, color: '#8b5cf6', component: lazy(() => import('../apps/mfe-recebimento').then(m => ({ default: m.ReceivingMfe }))) },
  { id: 'conference', name: 'Conferência', icon: ClipboardCheck, color: '#06b6d4', component: lazy(() => import('../apps/mfe-conferencia').then(m => ({ default: m.ConferenceMfe }))) },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: '#ef4444', component: lazy(() => import('../apps/mfe-analytics').then(m => ({ default: m.AnalyticsMfe }))) },
  { id: 'schedule', name: 'Agenda', icon: CalendarDays, color: '#10b981', component: lazy(() => import('../apps/mfe-agenda').then(m => ({ default: m.AgendaMfe }))) },
];

export function ShellLayout() {
  const { user, activeMfe, navigate } = useShell();

  const ActiveComponent = MFE_REGISTRY.find(m => m.id === activeMfe)?.component;
  const activeDef = MFE_REGISTRY.find(m => m.id === activeMfe);

  return (
    <div className="flex h-screen w-full bg-[#121212] text-[#e5e5e5] overflow-hidden font-sans selection:bg-sky-500/30">
      
      {/* Shell Controlled Sidebar */}
      <aside className="w-64 bg-[#161616] border-r border-[#242424] flex flex-col h-full shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-[#242424] shrink-0">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(56,189,248,0.4)]">
   <img className="w-full h-full object-contain p-0.5" src={kingstarLogo} alt="KingStar" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest leading-none text-white" style={{ letterSpacing: '0.1em' }}>KINGSTAR</span>
            <span className="text-[10px] text-sky-400 tracking-widest font-mono font-bold" style={{ letterSpacing: '0.05em' }}>MFE ORCHESTRATOR</span>
          </div>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto px-3 hide-scrollbar">
          <div className="text-[10px] font-mono text-[#8b9dc3] uppercase px-3 mb-2 tracking-wider font-semibold">
            Microfrontends
          </div>
          
          {MFE_REGISTRY.map(mfe => {
            const isActive = activeMfe === mfe.id;
            const Icon = mfe.icon;
            return (
              <button
                key={mfe.id}
                onClick={() => navigate(mfe.id)}
                className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left outline-none group ${
                  isActive ? 'text-white bg-[#22252B]' : 'text-[#8b9dc3] hover:text-[#e5e5e5] hover:bg-[#22252B]/50'
                }`}
              >
                <Icon size={20} className="transition-colors duration-200" color={isActive ? mfe.color : 'currentColor'} />
                <span className="tracking-wide">{mfe.name}</span>
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full" style={{ backgroundColor: mfe.color }} />
                )}
              </button>
            )
          })}
        </div>
        
        {/* Shell Controlled Auth Status */}
        <div className="p-4 border-t border-[#242424] shrink-0 bg-[#161616]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-xs font-bold border border-[#333] text-sky-400">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">{user.name}</span>
              <span className="text-[10px] text-[#8b9dc3] font-mono truncate">{user.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0a0a0a]">
        
        <header className="h-16 border-b border-[#242424] bg-[#161616]/80 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <h1 className="text-lg font-bold tracking-wide text-white">{activeDef?.name || 'MFE'}</h1>
             <span className="px-2 py-0.5 rounded-md bg-[#242424] text-[#8b9dc3] text-[10px] font-mono border border-[#333]">
               MFE_ID: {activeMfe}
             </span>
          </div>
          <div className="flex items-center gap-6 text-xs font-mono text-[#8b9dc3]">
            <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                STATUS: <span className="text-emerald-400 font-bold ml-1">SHELL ONLINE</span>
            </div>
          </div>
        </header>

        {/* Dynamic MFE Mount Point */}
        <div className="flex-1 overflow-auto relative z-0" id="mfe-mount">
          <Suspense fallback={
            <div className="h-full flex flex-col items-center justify-center text-[#8b9dc3] gap-4 font-mono text-sm tracking-widest">
              <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-r-transparent animate-spin" />
              <span>CARREGANDO MFE REMOTO [{activeMfe}] ...</span>
            </div>
          }>
            {ActiveComponent ? <ActiveComponent /> : (
              <div className="flex items-center justify-center h-full p-8 text-red-400 font-mono text-sm">
                [Shell Error] MFE não encontrado no registro: {activeMfe}
              </div>
            )}
          </Suspense>
        </div>
      </main>

      {/* Global Widget injected by Shell */}
      <AydaWidget />
      
      {/* Global Notification System */}
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
