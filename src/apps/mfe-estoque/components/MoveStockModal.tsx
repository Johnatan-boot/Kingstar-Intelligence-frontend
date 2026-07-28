import React, { useState } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { stockApi } from '../../../services/api';

interface Props { onClose(): void; }

const TYPES = [
  { value: 'IN',         label: 'Entrada (IN)',      icon: ArrowUpCircle,   color: '#22c55e' },
  { value: 'OUT',        label: 'Saída (OUT)',        icon: ArrowDownCircle, color: '#ef4444'  },
  { value: 'ADJUSTMENT', label: 'Ajuste',             icon: RotateCcw,       color: '#38bdf8'  },
  { value: 'LOSS',       label: 'Perda/Avaria',       icon: AlertCircle,     color: '#facc15' },
];

export default function MoveStockModal({ onClose }: Props) {
  const [form, setForm] = useState({ type: 'IN', skuId: '', quantity: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.skuId || !form.quantity) { setError('SKU e quantidade são obrigatórios'); return; }
    setLoading(true); setError('');
    try {
      const result: any = await stockApi.move({
        type:       form.type,
        skuId:      form.skuId,
        quantity:   parseFloat(form.quantity),
        reason:     form.reason || undefined,
      });
      setSuccess(`Movimentação registrada com sucesso`);
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Erro ao movimentar estoque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#1a1a1a', border: '1px solid #242424', borderRadius: '16px', width: '480px', boxShadow: '0 24px 48px rgba(0,0,0,0.4)', color: '#fff' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Movimentação de Estoque</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b9dc3' }}><X size={18}/></button>
        </div>

        <form onSubmit={submit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Tipo</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {TYPES.map(t => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${form.type === t.value ? t.color : '#333'}`,
                    background: form.type === t.value ? `${t.color}15` : 'transparent',
                    color: form.type === t.value ? t.color : '#8b9dc3',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    fontWeight: 500,
                  }}
                >
                  <t.icon size={15}/> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, display: 'block', marginBottom: '6px' }}>SKU *</label>
              <input value={form.skuId} onChange={e => setForm(f => ({...f, skuId: e.target.value}))} placeholder="SKU-0001" style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '9px 12px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Quantidade *</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} min="1" style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '9px 12px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          </div>

          {(form.type === 'ADJUSTMENT' || form.type === 'LOSS') && (
            <div>
              <label style={{ fontSize: '12px', color: '#8b9dc3', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Motivo</label>
              <input value={form.reason} onChange={e => setForm(f => ({...f, reason: e.target.value}))} placeholder="Descreva o motivo..." style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '9px 12px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
          )}

          {error   && <p style={{ color: '#ef4444',  fontSize: '13px', padding: '8px 12px', background: '#ef444418', borderRadius: '8px' }}>{error}</p>}
          {success && <p style={{ color: '#22c55e', fontSize: '13px', padding: '8px 12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }}>{success}</p>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {loading ? 'Processando...' : 'Confirmar Movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
