import { useState, useRef, useEffect } from 'react';
import { Bot, Send, RefreshCw, Zap, X, ChevronDown, MessageSquare } from 'lucide-react';
import { aydaApi } from '../services/api';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

const QUICK_ACTIONS = [
  'Quantos itens estão em estoque crítico?',
  'Como criar pedido?',
  'O que está atrasado?',
];

const WELCOME = `Olá! 👋 Sou a **Ayda**, assistente inteligente do KingStar WMS. Pergunte qualquer coisa sobre as operações da Kingstar!`;

export default function AydaWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [botStatus, setBotStatus] = useState<any>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    aydaApi.status().then(r => setBotStatus(r.data.dados)).catch(() => {});
  }, []);

  const send = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const historico = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const res = await aydaApi.chat(msg, historico);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.data.dados?.resposta ?? 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.',
        timestamp: new Date(),
      }]);
    } finally { setLoading(false); }
  };

  const clear = () => setMessages([{ role: 'assistant', content: WELCOME, timestamp: new Date() }]);

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {/* Widget Button */}
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

      {/* Chat Popover */}
      {isOpen && (
        <div style={{
          width: 380, height: 600, background: '#161616',
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
                <p style={{ fontSize: 11, color: '#8b9dc3', margin: 0, marginTop: 2 }}>
                  {botStatus ? 'Online' : 'Conectando...'}
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

          {/* Quick Actions (Horizontal scroll) */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid #242424' }} className="hide-scrollbar">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => send(action)}
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
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 8,
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="#38bdf8" />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#121212',
                  border: msg.role === 'user' ? 'none' : '1px solid #242424',
                  color: msg.role === 'user' ? '#fff' : '#e5e5e5',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}>
                  <div dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                  <p style={{ fontSize: 9, marginTop: 4, opacity: 0.6, textAlign: 'right' }}>
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#38bdf820', border: '1px solid #38bdf840', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="#38bdf8" />
                </div>
                <div style={{ padding: '10px 14px', background: '#121212', border: '1px solid #242424', borderRadius: '14px 14px 14px 2px', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px', borderTop: '1px solid #242424' }}>
            <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: '#121212', border: '1px solid #333', borderRadius: 20 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Mensagem para Ayda..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
              />
              <button onClick={() => send()} disabled={!input.trim() || loading}
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
      `}</style>
    </div>
  );
}
