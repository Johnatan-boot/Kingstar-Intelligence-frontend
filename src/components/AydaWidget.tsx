import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RefreshCw, ChevronDown, Loader2, CheckCircle2, Wrench } from 'lucide-react';
import { useAydaChat, nomeAmigavel } from '../hooks/useAydaChat';

const QUICK_ACTIONS = [
  'Quantos itens estão em estoque crítico?',
  'Quais pedidos estão em atraso?',
  'Qual fornecedor mais atrasa?',
];

const WELCOME =
  'Olá! 👋 Sou a **Ayda**, assistente inteligente do KingStar WMS. Pergunte qualquer coisa sobre as operações — você vai ver, em tempo real, quais automações eu executo para responder.';

function renderContent(content: string) {
  return content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');
}

export default function AydaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, send, loading, online, checkStatus, clear } = useAydaChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSend = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput('');
    send(msg);
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: 30,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 10px 25px rgba(56, 189, 248, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={30} />
        </button>
      )}

      {isOpen && (
        <div style={{
          width: 400, height: 640, background: '#161616',
          border: '1px solid #242424', borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'scaleIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e1e', borderBottom: '1px solid #242424' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #38bdf820, #0ea5e920)', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#38bdf8" />
              </div>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, margin: 0, color: '#fff' }}>
                  Ayda <span style={{ fontSize: 9, background: '#38bdf820', color: '#38bdf8', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>IA</span>
                </h1>
                <p style={{ fontSize: 11, color: online ? '#4ade80' : '#8b9dc3', margin: 0, marginTop: 2 }}>
                  {online === null ? 'Conectando...' : online ? '● Online (web-automate ativo)' : '● Backend/web-automate offline'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={clear} style={{ background: 'none', border: 'none', color: '#8b9dc3', cursor: 'pointer', padding: 4 }} title="Limpar conversa">
                <RefreshCw size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#8b9dc3', cursor: 'pointer', padding: 4 }}>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid #242424' }} className="hide-scrollbar">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => handleSend(action)}
                style={{
                  flexShrink: 0, padding: '6px 12px',
                  borderRadius: 12, border: '1px solid #242424',
                  background: '#121212', color: '#8b9dc3',
                  cursor: 'pointer', fontSize: 11, transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf850'; e.currentTarget.style.color = '#e5e5e5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#242424'; e.currentTarget.style.color = '#8b9dc3'; }}>
                {action}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.length === 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="#38bdf8" />
                </div>
                <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: '14px 14px 14px 2px', background: '#121212', border: '1px solid #242424', color: '#e5e5e5', fontSize: 13, lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: renderContent(WELCOME) }} />
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="#38bdf8" />
                  </div>
                )}
                <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Passos de automação em tempo real */}
                  {msg.role === 'assistant' && msg.steps && msg.steps.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {msg.steps.map(step => (
                        <div key={step.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          fontSize: 11, padding: '6px 10px', borderRadius: 10,
                          background: step.status === 'rodando' ? '#38bdf815' : '#4ade8015',
                          border: `1px solid ${step.status === 'rodando' ? '#38bdf840' : '#4ade8040'}`,
                          color: step.status === 'rodando' ? '#38bdf8' : '#4ade80',
                        }}>
                          {step.status === 'rodando'
                            ? <Loader2 size={12} className="animate-spin" />
                            : <CheckCircle2 size={12} />}
                          <Wrench size={11} style={{ opacity: 0.7 }} />
                          <span>{nomeAmigavel(step.ferramenta)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {(msg.content || msg.isStreaming) && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#121212',
                      border: msg.role === 'user' ? 'none' : '1px solid #242424',
                      color: msg.role === 'user' ? '#fff' : '#e5e5e5',
                      fontSize: 13, lineHeight: 1.5,
                    }}>
                      {msg.content ? (
                        <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                      ) : (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                          ))}
                        </div>
                      )}
                      <p style={{ fontSize: 9, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #242424' }}>
            <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#121212', border: '1px solid #333', borderRadius: 20 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Mensagem para Ayda..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
              />
              <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#242424', color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <Send size={12} style={{ marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-4px); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
