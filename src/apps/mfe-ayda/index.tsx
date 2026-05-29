import React, { useState, useRef, useEffect } from 'react';
import { aydaService } from '../../services/ai/AiOrchestrator';
import { BrainCircuit, Activity, AlertTriangle, ShieldCheck, Zap, Send, Loader2 } from 'lucide-react';
import { KpiCards } from '@/src/components/dashboard/KpiCards';
import { VolumeTimeline } from '@/src/components/dashboard/VolumeTimeline';
import { StatusPie } from '@/src/components/dashboard/StatusPie';
import { TopHeader } from '@/src/components/dashboard/TopHeader';



declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export function jsxDEV(type: any, props: any, key?: any): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export function AydaCoreMfe() {
  const [messages, setMessages] = useState<Array<{role: string, text: string, provider?: string}>>([
    { role: 'assistant', text: 'Sistemas nominais. Inteligência Operacional operando e pronta. Em que posso otimizar a cadeia logística hoje?', provider: 'System' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userPrompt = input.trim();
    setInput('');
    setMessages((prev: any) => [...prev, { role: 'user', text: userPrompt }]);
    setIsTyping(true);

    try {
      // Coletando o contexto operacional real:
      const context = `
        Volume Diário Atual: 85% de uso da malha.
        Conferências: Doca 1 (Liberada). Doca 2 (Descarregando NF-4992). Doca 3 (Atraso crítico: 45mins).
        Contas a Pagar (Mês): R$ 143.500,00 previstos.
        Estoque: Corredor A em 92% (Curva A - Alta Rotatividade).
      `;
      const res = await aydaService.processRequest(userPrompt, context);
      
      setMessages((prev: any) => [...prev, { role: 'assistant', text: res.text, provider: res.provider }]);
    } catch (err) {
      console.error(err);
      setMessages((prev: any) => [...prev, { role: 'assistant', text: 'ERRO Crítico: Fallback final falhou. Verifique integrações de endpoint logístico.', provider: 'ERROR' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      <TopHeader />
      
      <KpiCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-auto xl:h-[500px]">
        {/* Left Panel: AI Chat interface */}
        <div className="xl:col-span-2 flex flex-col glass-panel rounded-xl overflow-hidden shadow-base relative h-full min-h-[400px]">
          <div className="h-14 border-b border-[var(--border)] flex items-center px-6 shrink-0 bg-[var(--bg-app)]/80 justify-between">
              <div className="flex items-center gap-3 text-[var(--color-kingstar-cyan)]">
               <BrainCircuit className="w-5 h-5" />
               <span className="font-semibold tracking-widest text-sm uppercase">AYDA Copilot</span>
             </div>
             
             <div className="flex gap-2 items-center text-[10px] uppercase tracking-wider font-mono">
                <span className="text-[var(--text-muted)] hidden sm:inline">Engine:</span>
                <span className="px-1.5 py-0.5 rounded bg-[var(--color-kingstar-green)]/20 text-[var(--color-kingstar-green)] border border-[var(--color-kingstar-green)]/30">Gemini 3.1 Pro</span>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.map((msg: {
  role: string;
  text: string;
  provider?: string;
}, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-[var(--color-kingstar-cyan)]/10 border border-[var(--color-kingstar-cyan)]/20' : 'bg-[var(--color-kingstar-panel)] border border-[var(--border)]'}`}>
                    {msg.provider && msg.role === 'assistant' && (
                      <div className="text-[10px] text-[var(--color-kingstar-cyan)] uppercase font-mono tracking-wider mb-2 font-semibold">
                        ENGINE: {msg.provider}
                      </div>
                    )}
                    <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans">
                      {msg.text}
                    </div>
                 </div>
              </div>
            ))}
            {isTyping && (
               <div className="flex justify-start">
                 <div className="bg-[var(--color-kingstar-panel)] border border-[var(--border)] rounded-2xl px-5 py-4 flex items-center gap-3 text-[var(--color-kingstar-cyan)]">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   <span className="text-xs uppercase tracking-widest font-mono">Processando contexto operacional...</span>
                 </div>
               </div>
            )}
          </div>
          
          <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg-app)]/80">
            <div className="relative">
               <input 
                 type="text" 
                 className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[var(--color-kingstar-cyan)] focus:ring-1 focus:ring-[var(--color-kingstar-cyan)] transition-all"
                 placeholder="Solicite insights operacionais ou automações..."
                 value={input}
                 onChange={(e: { target: { value: any; }; }) => setInput(e.target.value)}
                 onKeyDown={(e: { key: string; }) => e.key === 'Enter' && handleSend()}
               />
               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isTyping}
                 className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded bg-[var(--color-kingstar-cyan)]/10 text-[var(--color-kingstar-cyan)] hover:bg-[var(--color-kingstar-cyan)] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-[var(--color-kingstar-cyan)]/10 disabled:hover:text-[var(--color-kingstar-cyan)]"
               >
                 <Send className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
        
        {/* Right Panel: Operations Overview Dashboard */}
        <div className="xl:col-span-1 flex flex-col gap-6 h-full min-h-[400px]">
           {/* Live Status Board */}
           <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
              <div className="h-12 border-b border-[var(--border)] flex items-center px-4 shrink-0 justify-between">
                <span className="font-semibold tracking-wider text-xs uppercase text-[#e5e5e5] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--color-kingstar-green)]" />
                  Alertas Críticos
                </span>
              </div>
              <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                <div className="space-y-3 mt-1">
                  <div className="flex items-start gap-3 p-3 rounded bg-[var(--color-kingstar-red)]/10 border border-[var(--color-kingstar-red)]/20">
                    <AlertTriangle className="w-4 h-4 text-[var(--color-kingstar-red)] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[var(--color-kingstar-red)]">Atraso Crítico - Doca 3</span>
                      <span className="text-[10px] text-gray-400 mt-1">Gargalo identificado no descarregamento. 45 min acima do SLA.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded bg-[var(--color-kingstar-yellow)]/10 border border-[var(--color-kingstar-yellow)]/20">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-kingstar-yellow)] shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-[var(--color-kingstar-yellow)]">Risco de Ruptura SKUs</span>
                      <span className="text-[10px] text-gray-400 mt-1">Análise preditiva aponta 12 SKUs críticos para as próximas 2h.</span>
                    </div>
                  </div>
                </div>
              </div>
           </div>
           
           {/* System Events */}
           <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
              <div className="h-12 border-b border-[var(--border)] flex items-center px-4 shrink-0">
                <span className="font-semibold tracking-wider text-xs uppercase text-[#e5e5e5] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--color-kingstar-cyan)]" />
                  Eventos do Sistema
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="relative border-l border-[var(--border)] ml-2 space-y-6 pb-4">
                   {[
                     { time: '14:32', title: 'Integração Recebimento Sincronizada', status: 'ok' },
                     { time: '14:28', title: 'AYDA Core: Roteirização Re-calculada', status: 'ai' },
                     { time: '14:15', title: 'Cluster de Docas rebalanceado', status: 'warn' },
                     { time: '13:58', title: 'Lote #4992 Conferência Iniciada', status: 'ok' },
                   ].map((evt, i) => (
                     <div key={i} className="pl-6 relative">
                       <div className={`absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full border-2 border-[var(--bg-card)]
                         ${evt.status === 'ok' ? 'bg-[var(--color-kingstar-green)]' 
                         : evt.status === 'warn' ? 'bg-[var(--color-kingstar-yellow)]' 
                         : evt.status === 'ai' ? 'bg-[var(--color-kingstar-cyan)]' : 'bg-[var(--color-kingstar-red)]'}`} 
                       />
                       <div className="text-[10px] font-mono text-[var(--text-muted)] leading-none mb-1">{evt.time}</div>
                       <div className="text-xs">{evt.title}</div>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeTimeline />
        </div>
        <div className="lg:col-span-1">
          <StatusPie />
        </div>
      </div>
      
    </div>
  );
}
