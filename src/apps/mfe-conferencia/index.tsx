import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertCircle, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { conferenceApi } from '../../services/api';
import { useShell } from '../shell/ShellProvider';

function Card({ children, className = '' }: any) {
  return <div className={`bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden ${className}`}>{children}</div>;
}

const STATUS_MAP: Record<string, { label: string; color: string; border: string; bg: string }> = {
  PENDING:      { label: 'Pendente',     color: 'text-zinc-400', border: 'border-zinc-500', bg: 'bg-zinc-900/50' },
  IN_PROGRESS:  { label: 'Em Andamento', color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-500/10' },
  APPROVED:     { label: 'Aprovado',     color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
  PCL_ANALYSIS: { label: 'Análise PCL',  color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10' },
};

const VEHICLE_LABEL: Record<string, string> = { TRUCK: 'Caminhão', VAN: 'Van', CAR: 'Carro', MOTORCYCLE: 'Moto', OTHER: 'Outro' };

export function ConferenceMfe() {
  const { publishEvent } = useShell();
  const [conferences, setConferences] = useState<any[]>([]);
  const [activeConf, setActiveConf]   = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm]               = useState({ checkedPieces: 0, damages: 0, hasDamages: false, notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await conferenceApi.list().catch(() => ({ data: { data: [ { id: 'mock-conf-1', nf_number: '001', purchase_order_id: 'po1', supplier_name: 'Fornecedor A', total_pieces: 100, attempts: 0, status: 'PENDING' } ] } }));
      setConferences(res.data?.data ?? res.data?.dados ?? []);
    } catch { toast.error('Erro ao carregar conferências'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handleSubmit = async () => {
    if (!activeConf) return;
    setSubmitting(true);
    try {
      const res: any = await conferenceApi.submit(activeConf.id, {
        checkedPieces: Number(form.checkedPieces),
        damages: form.hasDamages ? Number(form.damages) : 0,
        damageType: form.hasDamages ? 'AVARIA' : 'CONFERENCIA',
        notes: form.notes || undefined,
      });
      const status = res.data?.data?.status ?? res.data?.status ?? 'APPROVED';
      if (status === 'APPROVED') toast.success('✅ Conferência aprovada! Mercadoria movida para o estoque.');
      else if (status === 'PCL_ANALYSIS') toast.error('⚠️ Divergência detectada! Enviado para análise PCL.', { duration: 5000 });
      else toast(`Tentativa registrada. Conferência em andamento.`, { icon: '⚠️' });
      
      // PUBLICANDO O EVENTO PARA O BACKEND ASSINAR (KAFKA-style Message Broker simulado via Shell Event Bus)
      if (status === 'APPROVED') {
        publishEvent('CONFERENCIA_CONCLUIDA', {
          nf: activeConf.nf_number || '12345',
          fornecedorId: activeConf.supplier_id || 'FORN_01',
          fornecedor: activeConf.supplier_name,
          qtdTotal: form.checkedPieces,
          lote: `LT-${Math.floor(Math.random()*10000)}`,
          sku: 'SKU-GENERIC',
          valorTotal: 5490.50
        });
      }

      setActiveConf(null);
      setForm({ checkedPieces: 0, damages: 0, hasDamages: false, notes: '' });
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erro ao enviar conferência'); }
    finally { setSubmitting(false); }
  };

  const openConfs = conferences.filter(c => ['PENDING', 'IN_PROGRESS'].includes(c.status));
  const doneConfs = conferences.filter(c => !['PENDING', 'IN_PROGRESS'].includes(c.status));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
          <ClipboardCheck size={24} className="text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Conferência</h1>
          <p className="text-sm text-[#8b9dc3] mt-1 font-medium">Validação física da mercadoria recebida</p>
        </div>
      </div>

      {/* Active Conference Form */}
      {activeConf && (
        <Card className="border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#161616]">
            <div>
              <h3 className="font-bold text-white text-base">Realizar Conferência</h3>
              <p className="text-sm text-gray-400 mt-1">
                NF: <span className="text-purple-400 font-bold">{activeConf.nf_number || activeConf.purchase_order_id?.slice(0, 8)}</span> &nbsp;·&nbsp;
                Fornecedor: <span className="text-gray-300">{activeConf.supplier_name || '—'}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full border border-purple-500/50 text-purple-400 bg-purple-500/10 text-xs font-bold">
                Tentativa {(activeConf.attempts ?? 0) + 1}/3
              </span>
              <span className="hidden sm:inline px-3 py-1 rounded-full border border-[#333] text-gray-400 bg-[#1a1a1a] text-xs font-medium">
                Esperado: <strong className="text-white">{activeConf.total_pieces}</strong> peças
              </span>
              <button onClick={() => setActiveConf(null)} className="text-gray-500 hover:text-white p-1 ml-2 transition-colors"><X size={20} /></button>
            </div>
          </div>

          {activeConf.attempts > 0 && (
            <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 text-amber-500">
              <AlertCircle size={16} className="shrink-0" />
              <p className="text-sm font-medium">
                Atenção: tentativa anterior falhou. {3 - activeConf.attempts} tentativa(s) restante(s) antes de ir para análise PCL.
              </p>
            </div>
          )}

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Peças Conferidas *</label>
              <input type="number" min={0} value={form.checkedPieces}
                onChange={e => setForm(p => ({ ...p, checkedPieces: Number(e.target.value) }))}
                className="w-full px-4 py-3 bg-[#121212] border border-[#333] rounded-lg text-white font-mono text-lg focus:border-purple-500/50 outline-none transition-colors" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avarias</label>
              <div className="flex gap-2 mb-1">
                {[false, true].map(v => (
                  <button key={String(v)} onClick={() => setForm(p => ({ ...p, hasDamages: v }))}
                    className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                      form.hasDamages === v 
                        ? 'border-purple-500 bg-purple-500/15 text-purple-400' 
                        : 'border-[#333] bg-[#1a1a1a] text-gray-400 hover:bg-[#222]'
                    }`}>
                    {v ? 'Sim' : 'Não'}
                  </button>
                ))}
              </div>
              {form.hasDamages && (
                <input type="number" min={1} placeholder="Qtd. avarias" value={form.damages}
                  onChange={e => setForm(p => ({ ...p, damages: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 bg-red-500/5 border border-red-500/30 rounded-lg text-red-400 font-mono focus:border-red-500/50 outline-none transition-colors" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Observações</label>
              <textarea rows={3} placeholder="Opcional..." value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-purple-500/50 outline-none transition-colors resize-none" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#242424] bg-[#161616] flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-gray-400">
              Diferença: <strong className={`text-base ml-1 ${Number(form.checkedPieces) === activeConf.total_pieces ? 'text-emerald-500' : 'text-red-500'}`}>
                {Number(form.checkedPieces) - activeConf.total_pieces > 0 ? '+' : ''}{Number(form.checkedPieces) - activeConf.total_pieces}
              </strong>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={() => setActiveConf(null)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-sm font-medium">Cancelar</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white font-bold transition-all shadow-[0_4px_14px_rgba(168,85,247,0.2)] disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                {submitting && <Loader2 size={16} className="animate-spin" />} Confirmar Contagem
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Open conferences */}
      <Card className="flex flex-col">
        <div className="px-6 py-4 border-b border-[#242424] bg-[#161616] flex items-center gap-3">
          <h3 className="font-bold text-white text-base">Fila de Conferência</h3>
          {openConfs.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 text-[11px] font-black">{openConfs.length}</span>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-purple-500" /> Carregando...
          </div>
        ) : openConfs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-[#161616] border border-[#242424] rounded-full flex items-center justify-center mb-4">
                <ClipboardCheck size={28} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide">Nenhuma conferência na fila</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161616] border-b border-[#242424]">
                  {['', 'NF / Pedido', 'Fornecedor', 'Placa', 'Veículo', 'Total Esp.', 'Tentativas', 'Status', 'Ação'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {openConfs.map(conf => {
                  const s = STATUS_MAP[conf.status] ?? STATUS_MAP['PENDING'];
                  return (
                    <tr key={conf.id} onClick={() => toggle(conf.id)} className="cursor-pointer hover:bg-[#ffffff05] transition-colors group">
                      <td className="px-4 py-4 text-gray-500 group-hover:text-gray-300 transition-colors w-10">
                        {expanded[conf.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td className="px-4 py-4 text-sm font-mono text-purple-400 font-medium">{conf.nf_number || conf.purchase_order_id?.slice(0, 8)}</td>
                      <td className="px-4 py-4 text-sm text-gray-200">{conf.supplier_name ?? '—'}</td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-400">{conf.license_plate ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">{VEHICLE_LABEL[conf.vehicle_type] || conf.vehicle_type || '—'}</td>
                      <td className="px-4 py-4 text-sm font-bold text-white">{conf.total_pieces}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < (conf.attempts ?? 0) ? 'bg-red-500' : 'bg-[#333]'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${s.color} ${s.border} ${s.bg}`}>
                            {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={e => { e.stopPropagation(); setActiveConf(conf); setForm({ checkedPieces: 0, damages: 0, hasDamages: false, notes: '' }); }}
                          className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                          Conferir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Done conferences */}
      {doneConfs.length > 0 && (
        <Card>
          <div className="px-6 py-4 border-b border-[#242424] bg-[#161616]">
            <h3 className="font-bold text-gray-400 text-sm">Histórico de Conferências ({doneConfs.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse opacity-80 hover:opacity-100 transition-opacity">
              <thead>
                <tr className="bg-[#121212] border-b border-[#242424]">
                  {['NF / Pedido', 'Fornecedor', 'Total Esp.', 'Conferido', 'Avarias', 'Tentativas', 'Status'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {doneConfs.map(conf => {
                  const s = STATUS_MAP[conf.status] ?? STATUS_MAP['APPROVED'];
                  const isEqual = conf.checked_pieces === conf.total_pieces;
                  return (
                    <tr key={conf.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">{conf.nf_number || conf.purchase_order_id?.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{conf.supplier_name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-300 font-medium">{conf.total_pieces}</td>
                      <td className={`px-4 py-3 text-xs font-bold ${isEqual ? 'text-emerald-500' : 'text-red-500'}`}>{conf.checked_pieces ?? '—'}</td>
                      <td className={`px-4 py-3 text-xs font-medium ${conf.damages > 0 ? 'text-red-500' : 'text-gray-500'}`}>{conf.damages ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{conf.attempts ?? 0}/3</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border ${s.color} ${s.border} ${s.bg}`}>
                            {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
