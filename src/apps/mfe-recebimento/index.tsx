import React, { useState, useEffect } from 'react';
import { Truck, Plus, ChevronDown, ChevronUp, X, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { receivingApi, purchasesApi, conferenceApi } from '../../services/api';

const VEHICLE_TYPES = ['TRUCK', 'VAN', 'CAR', 'MOTORCYCLE', 'OTHER'];
const VEHICLE_LABEL: Record<string, string> = { TRUCK: 'Caminhão', VAN: 'Van', CAR: 'Carro', MOTORCYCLE: 'Moto', OTHER: 'Outro' };

function Card({ children, className = '' }: any) {
  return <div className={`bg-[#1a1a1a] border border-[#242424] rounded-2xl overflow-hidden ${className}`}>{children}</div>;
}

export function ReceivingMfe() {
  const [receivings, setReceivings] = useState<any[]>([]);
  const [pendingPOs, setPendingPOs] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [expanded, setExpanded]     = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState({ purchaseOrderId: '', supplierName: '', nfNumber: '', licensePlate: '', vehicleType: 'TRUCK', driverName: '', dock: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [recs, pos]: any = await Promise.all([
        receivingApi.list().catch(() => ({ data: { data: [ { id: 'mock-rec-1', start_time: new Date().toISOString(), supplier_name: 'Fornecedor Mock', nf_number: '0001', license_plate: 'ABC-1234', vehicle_type: 'TRUCK', status: 'IN_PROGRESS', po_status: 'RECEIVING' } ] } })), 
        purchasesApi.list({ status: 'PENDING' }).catch(() => ({ data: { data: [{ id: 'mock-1', supplier_name: 'Mock', nf_number: '123' }] } }))
      ]);
      setReceivings(recs.data?.data ?? recs.data?.dados ?? []);
      setPendingPOs(pos.data?.data ?? pos.data?.dados ?? []);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handlePOChange = (e: any) => {
    const poId = e.target.value;
    const po = pendingPOs.find((p: any) => p.id === poId);
    setForm(p => ({
      ...p,
      purchaseOrderId: poId,
      supplierName: po ? (po.supplier_name || p.supplierName) : p.supplierName,
      nfNumber: po ? (po.nf_number || p.nfNumber) : p.nfNumber
    }));
  };

  const handleSubmit = async () => {
    if (!form.supplierName || !form.nfNumber || !form.licensePlate || !form.vehicleType) return toast.error('Preencha fornecedor, NF, placa e veículo');
    setSubmitting(true);
    try {
      await receivingApi.start(form);
      toast.success('Recebimento iniciado com sucesso!');
      setShowForm(false);
      setForm({ purchaseOrderId: '', supplierName: '', nfNumber: '', licensePlate: '', vehicleType: 'TRUCK', driverName: '', dock: '' });
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erro ao iniciar recebimento'); }
    finally { setSubmitting(false); }
  };

  const handleStartConference = async (rec: any) => {
    const poRes: any = await purchasesApi.list({ status: 'RECEIVING' }).catch(() => ({ data: { data: [{ id: rec.purchase_order_id, expected_quantity: 10 }] } }));
    const po = (poRes.data?.data ?? poRes.data?.dados ?? []).find((p: any) => p.id === rec.purchase_order_id);
    const totalPieces = (po?.items ?? []).reduce((s: number, i: any) => s + Number(i.expected_quantity || 0), 0) || 10;
    const tid = toast.loading('Iniciando conferência...');
    try {
      await conferenceApi.start({ receivingId: rec.id, purchaseOrderId: rec.purchase_order_id || 'Avulso', totalPieces, supplierName: rec.supplier_name, nfNumber: rec.nf_number, licensePlate: rec.license_plate, vehicleType: rec.vehicle_type });
      toast.success('Conferência iniciada!', { id: tid });
      // Remove standard navigation, we dispatch an event or just show toast for now
      // setTimeout(() => navigate('/conference'), 800);
      load();
    } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Erro', { id: tid }); }
  };

  const statusBadge = (rec: any) => {
    if (rec.status === 'COMPLETED' || rec.po_status === 'CONFERENCE' || rec.po_status === 'COMPLETED')
      return <span className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">Concluído</span>;
    return <span className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400">Em andamento</span>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Truck size={24} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Recebimento</h1>
            <p className="text-sm text-[#8b9dc3] mt-1 font-medium">Registro de chegada de veículos e cargas</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-sm font-bold transition-colors w-full sm:w-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Plus size={18} /> Novo Recebimento
        </button>
      </div>

      {showForm && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-[#242424] flex justify-between items-center bg-[#161616]">
            <h3 className="font-bold text-white text-base">Registrar Chegada de Veículo</h3>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white p-1 transition-colors"><X size={20} /></button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-5">
            {[
              { label: 'Pedido (PO)', el: (
                <select value={form.purchaseOrderId} onChange={handlePOChange}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors">
                  <option value="">Selecione o pedido (opcional)...</option>
                  {pendingPOs.map((po: any) => <option key={po.id} value={po.id}>{po.nf_number || po.id.slice(0,8)} — {po.supplier_name}</option>)}
                </select>
              )},
              { label: 'Fornecedor *', el: (
                <input placeholder="Ex: Fornecedor Ltda" value={form.supplierName} onChange={e => setForm(p => ({ ...p, supplierName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
              )},
              { label: 'Nota Fiscal *', el: (
                <input placeholder="Ex: 000123" value={form.nfNumber} onChange={e => setForm(p => ({ ...p, nfNumber: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors font-mono" />
              )},
              { label: 'Placa do Veículo *', el: (
                <input placeholder="ABC-1D234" value={form.licensePlate} onChange={e => setForm(p => ({ ...p, licensePlate: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors uppercase" />
              )},
              { label: 'Tipo de Veículo *', el: (
                <select value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors">
                  {VEHICLE_TYPES.map(v => <option key={v} value={v}>{VEHICLE_LABEL[v]}</option>)}
                </select>
              )},
              { label: 'Nome do Motorista', el: (
                <input placeholder="Opcional" value={form.driverName} onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
              )},
              { label: 'Doca', el: (
                <input placeholder="Ex: Doca 01" value={form.dock} onChange={e => setForm(p => ({ ...p, dock: e.target.value }))}
                   className="w-full px-3 py-2.5 bg-[#121212] border border-[#333] rounded-lg text-sm text-white focus:border-emerald-500/50 outline-none transition-colors" />
              )},
            ].map(({ label, el }, i) => (
              <div key={i} className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                {el}
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#242424] bg-[#161616] flex justify-end gap-3 flex-wrap">
            <button onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-lg border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-sm font-medium w-full sm:w-auto">Cancelar</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="px-8 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
              {submitting && <Loader2 size={16} className="animate-spin" />} Iniciar Recebimento
            </button>
          </div>
        </Card>
      )}

      <Card className="flex flex-col min-h-[400px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 text-gray-400">
            <Loader2 size={32} className="animate-spin text-emerald-500" /> Carregando...
          </div>
        ) : receivings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-[#161616] border border-[#242424] rounded-full flex items-center justify-center mb-6">
                <Truck size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium tracking-wide">Nenhum recebimento registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161616] border-b border-[#242424]">
                  {['', 'Data', 'Fornecedor', 'NF', 'Placa', 'Veículo', 'Status', 'Ação'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
                {receivings.map(rec => (
                   <React.Fragment key={rec.id}>
                    <tr onClick={() => toggle(rec.id)} className="cursor-pointer hover:bg-[#ffffff05] transition-colors group">
                      <td className="px-4 py-4 text-gray-500 group-hover:text-gray-300 transition-colors w-10">
                        {expanded[rec.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(rec.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-200">{rec.supplier_name ?? '—'}</td>
                      <td className="px-4 py-4 text-sm font-mono text-sky-400">{rec.nf_number || '—'}</td>
                      <td className="px-4 py-4 text-sm font-mono text-gray-300">{rec.license_plate}</td>
                      <td className="px-4 py-4 text-sm text-gray-400 whitespace-nowrap">{VEHICLE_LABEL[rec.vehicle_type] ?? rec.vehicle_type}</td>
                      <td className="px-4 py-4">{statusBadge(rec)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {rec.status === 'IN_PROGRESS' && rec.po_status === 'RECEIVING' && (
                          <button onClick={e => { e.stopPropagation(); handleStartConference(rec); }}
                            className="px-4 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold transition-colors">
                            Conferir
                          </button>
                        )}
                        {(rec.po_status === 'COMPLETED' || rec.po_status === 'CONFERENCE') && (
                          <div className="flex items-center gap-1 text-emerald-500 fill-emerald-500/20 text-xs font-bold px-2">
                              <CheckCircle size={16} />
                          </div>
                        )}
                      </td>
                    </tr>
                    {expanded[rec.id] && (
                      <tr className="bg-[#161616]">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400 border border-[#242424] rounded-lg p-4 bg-[#121212]">
                            <span className="flex items-center gap-2"><strong className="text-gray-500 font-medium">ID</strong> <span className="font-mono text-xs">{rec.id}</span></span>
                            {rec.driver_name && <span className="flex items-center gap-2"><strong className="text-gray-500 font-medium">Motorista</strong> {rec.driver_name}</span>}
                            {rec.dock && <span className="flex items-center gap-2"><strong className="text-gray-500 font-medium">Doca</strong> {rec.dock}</span>}
                            {rec.end_time && <span className="flex items-center gap-2"><strong className="text-gray-500 font-medium">Duração</strong> {rec.duration_minutes} min</span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
