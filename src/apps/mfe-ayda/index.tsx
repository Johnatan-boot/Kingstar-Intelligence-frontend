import { useEffect, useRef, useState } from 'react';
import { BrainCircuit, Activity, AlertTriangle, ShieldCheck, Zap, Send, Loader2, CheckCircle2, Wrench } from 'lucide-react';
import { TopHeader } from '../../components/dashboard/TopHeader';
import { KpiCards } from '../../components/dashboard/KpiCards';
import { VolumeTimeline } from '../../components/dashboard/VolumeTimeline';
import { StatusPie } from '../../components/dashboard/StatusPie';
import { useAydaChat, nomeAmigavel, type AydaStep } from '../../hooks/useAydaChat';

export function AydaCoreMfe() {
  const { messages, send, loading, online, checkStatus } = useAydaChat({ funcao: 'GESTOR' });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const texto = input.trim();
    setInput('');
    send(texto);
  };

  // Feed de "Eventos do Sistema" agora é real: junta todos os passos de
  // automação (ferramentas chamadas pelo agente) de toda a conversa, do
  // mais recente para o mais antigo — nada aqui é mais hardcoded.
  const eventosReais = messages
    .flatMap((m) => (m.steps ?? []).map((s) => ({ ...s, msgTime: m.timestamp })))
    .slice()
    .reverse()
    .slice(0, 12);

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
                <span className="text-[var(--text-muted)] hidden sm:inline">Status:</span>
                <span className={`px-1.5 py-0.5 rounded border ${online ? 'bg-[var(--color-kingstar-green)]/20 text-[var(--color-kingstar-green)] border-[var(--color-kingstar-green)]/30' : 'bg-[var(--color-kingstar-red)]/20 text-[var(--color-kingstar-red)] border-[var(--color-kingstar-red)]/30'}`}>
                  {online === null ? 'Verificando...' : online ? 'web-automate online' : 'web-automate offline'}
                </span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-[var(--color-kingstar-panel)] border border-[var(--border)]">
                  <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans">
                    Sistemas nominais. Pergunte algo sobre a operação e acompanhe, abaixo da minha resposta, cada automação que eu executar em tempo real.
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-[var(--color-kingstar-cyan)]/10 border border-[var(--color-kingstar-cyan)]/20' : 'bg-[var(--color-kingstar-panel)] border border-[var(--border)]'}`}>
                    {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-3">
                        {msg.steps.map((step: AydaStep) => (
                          <div key={step.id} className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-md border ${step.status === 'rodando' ? 'text-[var(--color-kingstar-cyan)] border-[var(--color-kingstar-cyan)]/30 bg-[var(--color-kingstar-cyan)]/5' : 'text-[var(--color-kingstar-green)] border-[var(--color-kingstar-green)]/30 bg-[var(--color-kingstar-green)]/5'}`}>
                            {step.status === 'rodando' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                            <Wrench className="w-3 h-3 opacity-70" />
                            <span>{nomeAmigavel(step.ferramenta)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(msg.content || msg.isStreaming) && (
                      <div className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans">
                        {msg.content || <Loader2 className="w-4 h-4 animate-spin text-[var(--color-kingstar-cyan)]" />}
                      </div>
                    )}
                 </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg-app)]/80">
            <div className="relative">
               <input
                 type="text"
                 className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[var(--color-kingstar-cyan)] focus:ring-1 focus:ring-[var(--color-kingstar-cyan)] transition-all"
                 placeholder="Solicite insights operacionais ou automações..."
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               />
               <button
                 onClick={handleSend}
                 disabled={!input.trim() || loading}
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

           {/* System Events — agora é a automação de verdade, não mais fake */}
           <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1">
              <div className="h-12 border-b border-[var(--border)] flex items-center px-4 shrink-0">
                <span className="font-semibold tracking-wider text-xs uppercase text-[#e5e5e5] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[var(--color-kingstar-cyan)]" />
                  Automações da Ayda (tempo real)
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {eventosReais.length === 0 ? (
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Nenhuma automação executada ainda nesta sessão. Converse com a Ayda para ver aqui.
                  </div>
                ) : (
                  <div className="relative border-l border-[var(--border)] ml-2 space-y-6 pb-4">
                     {eventosReais.map((evt) => (
                       <div key={evt.id} className="pl-6 relative">
                         <div className={`absolute -left-[5px] top-1 w-[9px] h-[9px] rounded-full border-2 border-[var(--bg-card)]
                           ${evt.status === 'concluida' ? 'bg-[var(--color-kingstar-green)]' : 'bg-[var(--color-kingstar-cyan)]'}`}
                         />
                         <div className="text-[10px] font-mono text-[var(--text-muted)] leading-none mb-1">
                           {evt.msgTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div className="text-xs">{nomeAmigavel(evt.ferramenta)}</div>
                       </div>
                     ))}
                  </div>
                )}
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
