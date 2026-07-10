import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RefreshCw, X, ChevronDown, Zap } from 'lucide-react';
import { aydaService } from '../services/aydaService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  ferramentas?: string[];
}

const QUICK_ACTIONS = [
  'Quais pedidos estão atrasados?',
  'Resumo de compras dos últimos 30 dias',
  'Qual fornecedor mais atrasa?',
  'O que chega essa semana?',
  'Volume por categoria',
];

const WELCOME = `Olá! 👋 Sou a **Ayda**, assistente inteligente do KingStar.\n\nPosso consultar pedidos, estoque, fornecedores, agenda de chegadas e muito mais — em tempo real!`;

export default function AydaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Verifica status do AYDA ao abrir
  useEffect(() => {
    if (isOpen && online === null) {
      aydaService.status().then(setOnline);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const { resposta, ferramentas } = await aydaService.chat(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resposta,
        timestamp: new Date(),
        ferramentas,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Não consegui conectar com o AYDA. Verifique se o serviço está rodando.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    aydaService.resetSession();
    setMessages([{ role: 'assistant', content: WELCOME, timestamp: new Date() }]);
  };

  const renderContent = (content: string) =>
    content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

  const statusColor = online === null ? '#f59e0b' : online ? '#22c55e' : '#ef4444';
  const statusText = online === null ? 'Verificando...' : online ? 'Online' : 'Offline';

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Botão flutuante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: 30,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            border: 'none', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 10px 25px rgba(56,189,248,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={30} />
        </button>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div style={{
          width: 390, height: 620, background: '#161616',
          border: '1px solid #242424', borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', animation: 'scaleIn 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', borderBottom: '1px solid #242424' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #38bdf820, #0ea5e920)', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Ayda <span style={{ fontSize: 9, background: '#38bdf820', color: '#38bdf8', padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>IA</span>
                </div>
                <div style={{ fontSize: 11, color: statusColor, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                  {statusText}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={clear} style={{ background: 'none', border: 'none', color: '#8b9dc3', cursor: 'pointer', padding: 4 }} title="Nova conversa">
                <RefreshCw size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#8b9dc3', cursor: 'pointer', padding: 4 }}>
                <ChevronDown size={20} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 8, padding: '10px 14px', overflowX: 'auto', borderBottom: '1px solid #242424', scrollbarWidth: 'none' }}>
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => send(action)}
                style={{
                  flexShrink: 0, padding: '5px 11px',
                  borderRadius: 12, border: '1px solid #2a2a2a',
                  background: '#111', color: '#8b9dc3',
                  cursor: 'pointer', fontSize: 11, transition: 'all .15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf860'; e.currentTarget.style.color = '#e5e5e5'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#8b9dc3'; }}>
                {action}
              </button>
            ))}
          </div>

          {/* Mensagens */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8 }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <Bot size={14} color="#38bdf8" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#111',
                    border: msg.role === 'user' ? 'none' : '1px solid #2a2a2a',
                    color: msg.role === 'user' ? '#fff' : '#e5e5e5',
                    fontSize: 13, lineHeight: 1.55,
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                    <div style={{ fontSize: 9, marginTop: 5, opacity: 0.5, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                      {msg.ferramentas && msg.ferramentas.length > 0 && (
                        <span style={{ color: '#38bdf8', opacity: 0.7, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Zap size={8} /> {msg.ferramentas.length} ferramenta{msg.ferramentas.length > 1 ? 's' : ''}
                        </span>
                      )}
                      {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="#38bdf8" />
                </div>
                <div style={{ padding: '10px 14px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '14px 14px 14px 2px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #242424' }}>
            <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: 20, transition: 'border-color 0.2s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#38bdf860')}
              onBlur={e => (e.currentTarget.style.borderColor = '#2a2a2a')}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Pergunte para a Ayda..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#242424',
                  color: '#fff', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                  transition: 'background 0.2s',
                }}>
                <Send size={12} style={{ marginLeft: 2 }} />
              </button>
            </div>
            <div style={{ fontSize: 10, color: '#444', textAlign: 'center', marginTop: 6 }}>
              AYDA · KingStar WMS · LangGraph + Groq
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-4px); } }
      `}</style>
    </div>
  );
}
