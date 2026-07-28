import React, { useState } from 'react';
import { X, Upload, AlertTriangle, CheckCircle, Loader, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { stockApi } from '../../../services/api';

interface BatchRow {
  sku: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface Props {
  onClose: () => void;
  onDone: () => void;
}

const EXAMPLE_CSV = `SKU,Quantidade,Motivo
SKU-0001,150,Ajuste inventário físico
SKU-0005,80,Contagem cíclica zona A
SKU-0012,0,Produto danificado
SKU-0018,220,Inventário geral`;

export default function BatchAdjustModal({ onClose, onDone }: Props) {
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'done'>('upload');
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [csvText, setCsvText] = useState('');
  const [reason, setReason] = useState('Ajuste de inventário em lote');

  const parseCSV = (text: string): BatchRow[] => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    return lines.slice(1).map(line => {
      const [sku, qty, lineReason] = line.split(',').map(s => s.trim());
      return {
        sku: sku ?? '',
        quantity: parseInt(qty ?? '0') || 0,
        reason: lineReason || reason,
        status: 'pending' as const,
      };
    }).filter(r => r.sku);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setRows(parseCSV(text));
      setStep('review');
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (!csvText.trim()) { toast.error('Cole o CSV no campo abaixo'); return; }
    setRows(parseCSV(csvText));
    setStep('review');
  };

  const handleProcess = async () => {
    setStep('processing');
    const updated = rows.map(r => ({ ...r, status: 'processing' as const }));
    setRows(updated);

    // O backend processa o lote inteiro numa única transação
    // (POST /estoque/ajuste-lote) — não há como aplicar linha a linha,
    // então ou todo o lote é aplicado, ou nenhum (rollback automático).
    try {
      await stockApi.ajusteLote(
        updated.map(r => ({ sku: r.sku, quantidade: r.quantity }))
      );
      setRows(updated.map(r => ({ ...r, status: 'success' as const })));
      setStep('done');
      toast.success(`${updated.length} ajuste(s) aplicados com sucesso`, { duration: 4000 });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Erro ao gravar o lote no servidor';
      setRows(updated.map(r => ({ ...r, status: 'error' as const, error: msg })));
      setStep('done');
      toast.error(msg, { duration: 5000 });
    }
  };

  const downloadExample = () => {
    const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'modelo_ajuste_lote.csv';
    a.click();
  };

  const successCount = rows.filter(r => r.status === 'success').length;
  const errorCount = rows.filter(r => r.status === 'error').length;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #242424',
        borderRadius: '16px',
        width: '100%', maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #242424', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#fff' }}>Ajuste em Lote</h2>
            <p style={{ fontSize: '13px', color: '#8b9dc3', marginTop: '3px' }}>Importe um CSV para ajustar múltiplos SKUs de uma vez</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b9dc3', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Drop zone */}
              <label style={{
                border: '2px dashed #242424',
                borderRadius: '12px',
                padding: '40px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#22c55e')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#242424')}
              >
                <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFile} />
                <div style={{ background: 'rgba(34,197,94,0.1)', padding: '14px', borderRadius: '12px' }}>
                  <Upload size={24} color="#22c55e" />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Clique para selecionar um CSV</p>
                  <p style={{ fontSize: '13px', color: '#8b9dc3', marginTop: '4px' }}>Formato: SKU, Quantidade, Motivo</p>
                </div>
              </label>

              {/* Or paste */}
              <div>
                <p style={{ fontSize: '13px', color: '#8b9dc3', marginBottom: '8px' }}>Ou cole o conteúdo CSV diretamente:</p>
                <textarea
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="SKU,Quantidade,Motivo&#10;SKU-0001,150,Ajuste inventário&#10;SKU-0005,80,Contagem cíclica"
                  rows={5}
                  style={{
                    width: '100%', background: '#121212', border: '1px solid #333',
                    borderRadius: '8px', color: '#fff', fontSize: '13px',
                    fontFamily: 'monospace', padding: '12px', resize: 'vertical', boxSizing: 'border-box', outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={handlePaste} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#22c55e', color: '#fff', border: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <FileText size={14} /> Processar CSV colado
                  </button>
                  <button onClick={downloadExample} style={{ padding: '10px', borderRadius: '8px', background: 'transparent', color: '#fff', border: '1px solid #333', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Download size={14} /> Baixar modelo
                  </button>
                </div>
              </div>

              <div style={{ background: '#121212', borderRadius: '8px', padding: '14px', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={16} color="#facc15" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div style={{ fontSize: '12px', color: '#e5e5e5' }}>
                  O ajuste sobrescreve o saldo físico atual. Movimentações são registradas com tipo ADJUSTMENT.
                  Certifique-se de que o inventário foi devidamente realizado antes de aplicar.
                </div>
              </div>
            </div>
          )}

          {(step === 'review' || step === 'processing' || step === 'done') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {step === 'review' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#8b9dc3', marginBottom: '4px' }}>
                    {rows.length} item(s) identificados para ajuste
                  </p>
                  <label style={{ fontSize: '13px', color: '#e5e5e5', display: 'block', marginBottom: '6px' }}>
                    Motivo padrão (usado quando não especificado na linha):
                  </label>
                  <input
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{ width: '100%', background: '#121212', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px', padding: '9px 12px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              )}

              {step === 'done' && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, background: '#22c55e18', border: '1px solid #22c55e30', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', color: '#22c55e' }}>{successCount}</p>
                    <p style={{ fontSize: '12px', color: '#8b9dc3' }}>Aplicados com sucesso</p>
                  </div>
                  {errorCount > 0 && (
                    <div style={{ flex: 1, background: '#ef444418', border: '1px solid #ef444430', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                      <p style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', color: '#ef4444' }}>{errorCount}</p>
                      <p style={{ fontSize: '12px', color: '#8b9dc3' }}>Com erro</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rows table */}
              <div style={{ background: '#121212', borderRadius: '12px', border: '1px solid #242424', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #242424' }}>
                        {['SKU', 'Qtd.', 'Motivo', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#8b9dc3', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody style={{ color: '#fff' }}>
                      {rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #242424' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 600 }}>{row.sku}</td>
                          <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{row.quantity.toLocaleString()}</td>
                          <td style={{ padding: '10px 14px', color: '#e5e5e5', fontSize: '12px' }}>{row.reason}</td>
                          <td style={{ padding: '10px 14px' }}>
                            {row.status === 'pending' && <span style={{ color: '#8b9dc3', fontSize: '12px' }}>Pendente</span>}
                            {row.status === 'processing' && <Loader size={13} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />}
                            {row.status === 'success' && <CheckCircle size={14} color="#22c55e" />}
                            {row.status === 'error' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <X size={14} color="#ef4444" />
                                <span style={{ fontSize: '11px', color: '#ef4444' }}>{row.error}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #242424', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {step === 'upload' && (
            <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
          )}
          {step === 'review' && (
            <>
              <button onClick={() => setStep('upload')} style={{ padding: '10px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Voltar</button>
              <button onClick={handleProcess} style={{ padding: '10px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Aplicar {rows.length} Ajuste(s)
              </button>
            </>
          )}
          {step === 'processing' && (
            <button disabled style={{ padding: '10px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Processando...</button>
          )}
          {step === 'done' && (
            <>
              <button onClick={() => { setStep('upload'); setRows([]); setCsvText(''); }} style={{ padding: '10px 16px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Novo Lote
              </button>
              <button onClick={() => { onDone(); onClose(); }} style={{ padding: '10px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                Concluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
