import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle, Clock, XCircle, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { scheduleApi } from '../../services/api';

function Card({ children, className = '' }: any) {
  return <div className={`bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden ${className}`}>{children}</div>;
}

export function AgendaMfe() {
  const [schedules, setSchedules]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ supplierName: '', nfNumber: '', expectedAt: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.list();
      setSchedules((res.data as any).data ?? res.data.dados ?? []);
    } catch {
       toast.error('Usando roteamento mock...');
       setSchedules([
         { id: '1', supplier_name: 'Fornecedor Exemplo', nf_number: '1234', expected_at: new Date().toISOString(), status: 'SCHEDULED' }
       ]);
    }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.expectedAt) return toast.error('Informe a data esperada');
    setSubmitting(true);
    try {
      await scheduleApi.create({ ...form, expectedAt: new Date(form.expectedAt).toISOString() });
      toast.success('Agendamento criado!');
      setShowForm(false);
      setForm({ supplierName: '', nfNumber: '', expectedAt: '', notes: '' });
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erro ao agendar'); }
    finally { setSubmitting(false); }
  };

  const handleArrive = async (id: string) => {
    try { await scheduleApi.arrive(id); toast.success('Status atualizado: veículo no pátio!'); load(); }
    catch { toast.error('Erro ao atualizar status'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancelar agendamento?')) return;
    try { await scheduleApi.cancel(id); toast.success('Agendamento cancelado'); load(); }
    catch { toast.error('Erro ao cancelar'); }
  };

  const byStatus = (st: string) => schedules.filter(s => s.status === st);
  const upcoming = byStatus('SCHEDULED');
  const arrived  = byStatus('ARRIVED');
  const cancelled = byStatus('CANCELLED');

  const statusIcon = (s: string) => s === 'ARRIVED' ? <CheckCircle size={20} className="text-emerald-500" /> : s === 'CANCELLED' ? <XCircle size={20} className="text-red-500" /> : <Clock size={20} className="text-sky-400" />;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Calendar size={24} className="text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Agenda de Recebimento</h1>
            <p className="text-sm text-[#8b9dc3] mt-1 font-medium">Agendamentos de entregas dos fornecedores</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-black rounded-lg text-sm font-bold transition-colors w-full sm:w-auto shadow-[0_0_15px_rgba(56,189,248,0.2)]"
        >
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Aguardando', value: upcoming.length, colorClass: 'text-sky-400' },
          { label: 'No Pátio', value: arrived.length, colorClass: 'text-emerald-500' },
          { label: 'Cancelados', value: cancelled.length, colorClass: 'text-red-500' },
        ].map(({ label, value, colorClass }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#242424] rounded-2xl p-5 flex justify-between items-center relative overflow-hidden group">
            <span className="text-sm font-semibold tracking-wide text-gray-400 uppercase">{label}</span>
            <span className={`text-4xl font-black font-mono ${colorClass}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#161616]">
            <h3 className="font-bold text-white text-base">Novo Agendamento</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-1 transition-colors">
                <X size={20} />
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Fornecedor', key: 'supplierName', placeholder: 'Nome do fornecedor' },
              { label: 'Nota Fiscal (NF)', key: 'nfNumber', placeholder: 'Número da NF' },
              { label: 'Data Esperada *', key: 'expectedAt', type: 'datetime-local' },
              { label: 'Observações', key: 'notes', placeholder: 'Opcional' },
            ].map(f => (
              <div key={f.key} className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input 
                  type={f.type ?? 'text'} 
                  placeholder={f.placeholder} 
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-sky-500/50 outline-none transition-colors" 
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#242424] bg-[#161616] flex justify-end gap-3 flex-wrap">
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-lg border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-sm font-medium w-full sm:w-auto">
                Cancelar
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-8 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold transition-all shadow-[0_4px_14px_rgba(56,189,248,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Salvar Agendamento
            </button>
          </div>
        </Card>
      )}

      {/* List */}
      <Card className="flex flex-col min-h-[400px]">
        <div className="px-6 py-4 border-b border-[#242424] bg-[#161616]">
          <h3 className="font-bold text-white text-base">Próximos Agendamentos</h3>
        </div>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 text-gray-400">
            <Loader2 size={32} className="animate-spin text-sky-500" /> Carregando...
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-[#161616] border border-[#242424] rounded-full flex items-center justify-center mb-6">
                <Calendar size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide">Nenhum agendamento cadastrado</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#242424]">
            {schedules.map((sc) => (
              <div key={sc.id} className={`flex flex-col md:flex-row md:items-center gap-4 p-5 hover:bg-[#ffffff05] transition-colors ${sc.status === 'CANCELLED' ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#121212] border border-[#333] flex items-center justify-center shrink-0">
                    {statusIcon(sc.status)}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-white text-sm md:text-base truncate">
                            {sc.supplier_name ?? sc.supplier_name_free ?? 'Sem fornecedor'}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                            {sc.nf_number && <span>NF: <strong className="text-sky-400 font-mono tracking-tight">{sc.nf_number}</strong></span>}
                            <span>Data: <strong className="text-white">{new Date(sc.expected_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                            {sc.notes && <span className="truncate max-w-[200px] block" title={sc.notes}>Obs: {sc.notes}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:justify-end shrink-0 pl-16 md:pl-0 border-t md:border-none border-[#242424] pt-4 md:pt-0 mt-2 md:mt-0">
                  {sc.status === 'SCHEDULED' && (
                    <>
                      <button onClick={() => handleArrive(sc.id)}
                        className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 text-xs font-bold transition-colors">
                        Sinalizar Chegada
                      </button>
                      <button onClick={() => handleCancel(sc.id)}
                        className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-colors" title="Cancelar Agendamento">
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                  {sc.status === 'ARRIVED' && (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[11px] font-black tracking-wider">
                        NO PÁTIO
                    </span>
                  )}
                  {sc.status === 'CANCELLED' && (
                    <span className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-black tracking-wider">
                        CANCELADO
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
