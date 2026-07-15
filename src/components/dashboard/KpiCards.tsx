import React, { useState, useEffect } from 'react';
import { Package, Truck, ClipboardCheck, AlertTriangle, Zap, ShieldAlert } from 'lucide-react';
import { analyticsApi } from '../../services/api';

export function KpiCards() {
  const [data, setData] = useState<any>(null);

  const fetchKpis = async () => {
    try {
      const res = await analyticsApi.dashboard();
      setData(res.data.data);
    } catch (e) {
      // Mantém o último valor conhecido em tela em vez de zerar tudo
      // por causa de uma falha pontual de rede.
    }
  };

  useEffect(() => {
    fetchKpis();
    const interval = setInterval(fetchKpis, 5000);
    return () => clearInterval(interval);
  }, []);

  const scoreTotal = data?.score?.total ?? 0;
  const scoreClass = data?.score?.classification ?? 'Aguardando dados';

  const kpis = [
    { label: 'Score Operacional', value: scoreTotal, sub: scoreClass, color: '#38bdf8', icon: Zap, up: scoreTotal >= 75 },
    { label: 'Pedidos Pendentes', value: data?.kpis?.pending_pos ?? 0, sub: 'aguardando recebimento', color: '#facc15', icon: Package, up: false },
    { label: 'Recebimentos Hoje', value: data?.kpis?.receiving_pos ?? 0, sub: 'carros/caminhões hoje', color: '#22c55e', icon: Truck, up: true },
    { label: 'Conferências Hoje', value: data?.kpis?.completed_conferences_today ?? 0, sub: 'NFs conferidas hoje', color: '#8b5cf6', icon: ClipboardCheck, up: true },
    { label: 'Avarias', value: data?.metrics?.totalDamages ?? 0, sub: 'registradas hoje', color: '#ef4444', icon: AlertTriangle, up: false },
    { label: 'Divergências', value: data?.metrics?.totalDivergences ?? 0, sub: 'em análise PCL hoje', color: '#f97316', icon: ShieldAlert, up: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={kpi.label}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group hover:border-[#38bdf8]/50 transition-colors duration-300"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
            <kpi.icon size={64} color={kpi.color} />
          </div>
          <div className="flex justify-between items-start z-10">
            <h3 className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold max-w-[80%] leading-tight">
              {kpi.label}
            </h3>
            <div
              className="p-1.5 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${kpi.color}15` }}
            >
              <kpi.icon size={16} color={kpi.color} />
            </div>
          </div>
          <div className="z-10 mt-auto">
            <div className="text-3xl font-bold font-mono tracking-tighter" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`text-xs font-bold font-mono ${kpi.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {kpi.up ? '↑' : '↓'}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {kpi.sub}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
