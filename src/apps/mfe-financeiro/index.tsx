import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, TrendingDown, TrendingUp, AlertCircle, Banknote, FileCheck2, ArrowUpRight } from 'lucide-react';
import { EventBus } from '../../backend/infra/messaging/EventBus';

export function FinanceiroMfe() {
  const [pagamentos, setPagamentos] = useState<any[]>([
    { id: 1, nf: '12345', fornecedor: 'Logística Alfa', valor: 15400.00, status: 'PROVISIONADO', dataInfo: 'Em 10 dias' },
    { id: 2, nf: '12346', fornecedor: 'Transportes Brasil', valor: 8900.50, status: 'PAGO', dataInfo: 'Há 2 dias' },
  ]);

  useEffect(() => {
    // Escutando eventos do event bus vindos do simulador no backend
    const unsubscribe = EventBus.subscribe('CONFERENCIA_CONCLUIDA', (data: any) => {
      // Quando ouvimos, aguardamos igual o service do MFE Financeiro aguarda
      setTimeout(() => {
        setPagamentos((prev) => [
          {
            id: Date.now(),
            nf: data.nf || `NF-${Math.floor(Math.random() * 90000)}`,
            fornecedor: data.fornecedor || 'Fornecedor Novo',
            valor: data.valorTotal || Math.floor(Math.random() * 20000),
            status: 'PROVISIONADO',
            dataInfo: 'Agora'
          },
          ...prev
        ]);
      }, 4500); 
    });

    return unsubscribe;
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-400">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Painel Financeiro</h1>
            <p className="text-zinc-400 text-sm">Conciliações de NF & Contas a Pagar</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-sm font-medium">Contas a Pagar (Mês)</span>
            <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white mb-1">R$ 143.500,00</div>
          <div className="text-xs text-red-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12% do previsto
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-sm font-medium">NFs Conciliadas</span>
            <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white mb-1">84 notas</div>
          <div className="text-xs text-blue-400">Processadas eletronicamente via EventBus</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="text-zinc-400 text-sm font-medium">Economia Inteligente</span>
            <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-semibold text-white mb-1">R$ 12.450,00</div>
          <div className="text-xs text-emerald-400">Desvios prevenidos pela IA</div>
        </div>
      </div>

      {/* Listagem de Provisões */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-zinc-400" />
            Agenda de Pagamentos / Provisões
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 text-zinc-400 text-xs border-b border-zinc-800">
                <th className="py-3 px-5 font-medium">Nota Fiscal</th>
                <th className="py-3 px-5 font-medium">Fornecedor</th>
                <th className="py-3 px-5 font-medium">Valor (R$)</th>
                <th className="py-3 px-5 font-medium">Situação</th>
                <th className="py-3 px-5 font-medium">Data / Previsão</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((pag, i) => (
                <tr key={pag.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="py-4 px-5">
                    <span className="text-white font-mono text-sm">{pag.nf}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-white text-sm">{pag.fornecedor}</span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-zinc-300 font-mono text-sm">R$ {pag.valor.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-5">
                    {pag.status === 'PROVISIONADO' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-400/10 text-yellow-500 border border-yellow-500/20 text-xs font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> PROVISIONADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" /> PAGO
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-zinc-400 text-sm">{pag.dataInfo}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
