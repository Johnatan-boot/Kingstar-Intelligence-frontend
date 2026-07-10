import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, X, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { pclApi } from '../../services/api';

function Card({ children, className = '' }: any) {
  return <div className={`bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden ${className}`}>{children}</div>;
}

export function ManagementMfe() {
  const [divergences, setDivergences] = useState<any[]>([]);
  const [activeDiv, setActiveDiv]     = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [notes, setNotes]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [filter, setFilter]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await pclApi.list(filter ? { status: filter } : undefined).catch(() => ({ data: { data: [{ id: 'mock-pcl-1', nf_number: '001', supplier_name: 'Fornecedor A', error_type: 'DIVERGENCIA_CONTAGEM', total_pieces: 100, checked_pieces: 95, damages: 0, attempts: 3, status: 'IN_ANALYSIS' }] } }));
      setDivergences(res.data?.data ?? res.data?.dados ?? []);
    } catch { toast.error('Erro ao carregar divergências'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleAnalyze = async (approved: boolean) => {
    if (!activeDiv) return;
    if (!notes.trim()) return toast.error('Informe as notas da análise');
    setSubmitting(true);
    try {
      await pclApi.analyze(activeDiv.id, { approved, notes });
      toast[approved ? 'success' : 'error'](approved ? '✅ Aprovado com ressalva — movido para estoque' : '❌ Carga rejeitada', { duration: 5000 });
      setActiveDiv(null);
      setNotes('');
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erro ao analisar'); }
    finally { setSubmitting(false); }
  };

  const pending = divergences.filter(d => d.status === 'IN_ANALYSIS');

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldAlert size={24} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Gestor — Análise PCL</h1>
            <p className="text-sm text-[#8b9dc3] mt-1 font-medium">Tratativa de divergências de conferência</p>
          </div>
        </div>
        {pending.length > 0 && (
          <div className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm">
            {pending.length} pendente{pending.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Active analysis panel */}
      {activeDiv && (
        <div className="bg-[#1a1a1a] border border-red-500/50 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-start bg-[#161616] rounded-t-2xl">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={20} className="text-red-500" />
                <h3 className="font-bold text-white text-lg">Analisar Divergência</h3>
                <span className="px-3 py-1 rounded-full border border-red-500/40 bg-red-500/10 text-red-500 text-xs font-bold tracking-wider">
                  {activeDiv.error_type}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                NF: <span className="text-sky-400 font-mono">{activeDiv.nf_number || activeDiv.purchase_order_id?.slice(0, 8)}</span>
                &nbsp;·&nbsp; Fornecedor: <span className="text-gray-200">{activeDiv.supplier_name ?? '—'}</span>
              </p>
            </div>
            <button onClick={() => setActiveDiv(null)} className="text-gray-500 hover:text-white transition-colors p-1"><X size={20} /></button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Detalhes da Divergência</p>
              <div className="bg-[#121212] rounded-xl p-5 border border-[#333] flex flex-col gap-4">
                {[
                  { label: 'Total Esperado', value: `${activeDiv.total_pieces} peças`, colorClass: 'text-gray-200' },
                  { label: 'Total Conferido', value: `${activeDiv.checked_pieces} peças`, colorClass: activeDiv.checked_pieces === activeDiv.total_pieces ? 'text-emerald-500' : 'text-red-500' },
                  { label: 'Avarias', value: `${activeDiv.damages ?? 0}`, colorClass: activeDiv.damages > 0 ? 'text-red-500' : 'text-emerald-500' },
                  { label: 'Tentativas', value: `${activeDiv.attempts}/3`, colorClass: 'text-amber-500' },
                ].map(({ label, value, colorClass }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-400">{label}</span>
                    <span className={`text-sm font-bold ${colorClass}`}>{value}</span>
                  </div>
                ))}
              </div>
              {activeDiv.description && (
                <div className="mt-2 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-medium text-gray-400 mb-1">Descrição</p>
                  <p className="text-sm text-gray-200">{activeDiv.description}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Notas da Análise *</p>
              <textarea rows={6} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Descreva a tratativa: divergência de contagem aceita pelo fornecedor, avaria documentada, carga rejeitada por qualidade..."
                className="w-full bg-[#121212] border border-[#333] rounded-xl p-4 text-sm text-white focus:border-red-500/50 outline-none transition-colors resize-none" />
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleAnalyze(false)} disabled={submitting || !notes.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                  <X size={18} /> Rejeitar Carga
                </button>
                <button onClick={() => handleAnalyze(true)} disabled={submitting || !notes.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-sm hover:bg-emerald-500/20 disabled:opacity-50 transition-colors">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />} Aprovar com Ressalva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#161616]">
          <h3 className="font-bold text-white text-base">Fila de Análise</h3>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-[#121212] border border-[#333] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-red-500/50 transition-colors">
            <option value="">Pendentes (IN_ANALYSIS)</option>
            <option value="APPROVED">Aprovados</option>
            <option value="REJECTED">Rejeitados</option>
          </select>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-red-500" /> Carregando...
          </div>
        ) : divergences.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-[#161616] border border-[#242424] rounded-full flex items-center justify-center mb-4">
              <ShieldAlert size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">Nenhuma divergência pendente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161616] border-b border-[#242424]">
                  {['NF / Pedido', 'Fornecedor', 'Tipo Erro', 'Esp.', 'Conf.', 'Avarias', 'Status', 'Ação'].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {divergences.map(div => {
                  const statusColorClass = div.status === 'APPROVED' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : div.status === 'REJECTED' ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10';
                  const statusLabel = div.status === 'APPROVED' ? 'Aprovado' : div.status === 'REJECTED' ? 'Rejeitado' : 'Em Análise';
                  return (
                    <tr key={div.id} className="hover:bg-[#ffffff05] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-sky-400 font-medium">{div.nf_number || div.purchase_order_id?.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-200">{div.supplier_name ?? '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-bold">{div.error_type}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-400">{div.total_pieces}</td>
                      <td className={`px-6 py-4 text-sm font-bold ${div.checked_pieces === div.total_pieces ? 'text-emerald-500' : 'text-red-500'}`}>{div.checked_pieces ?? '—'}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${div.damages > 0 ? 'text-red-500' : 'text-gray-500'}`}>{div.damages ?? 0}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${statusColorClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-6 py-4">
                        {div.status === 'IN_ANALYSIS' && (
                          <button onClick={() => { setActiveDiv(div); setNotes(''); }}
                            className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                            Analisar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
