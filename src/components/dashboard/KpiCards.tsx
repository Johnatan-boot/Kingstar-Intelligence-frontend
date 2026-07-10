import React from 'react';
import { Package, Truck, ClipboardCheck, AlertTriangle, Activity, Zap } from 'lucide-react';

const MOCK_KPI = [
  { label: 'Score Operacional', value: '87.4', sub: '+2.1 vs ontem',  color: '#38bdf8', icon: Zap,           up: true  },
  { label: 'Pedidos Pendentes', value: '23',   sub: '4 atrasados',     color: '#facc15', icon: Package,       up: false },
  { label: 'Recebimentos Hoje', value: '8',    sub: '3 em andamento',  color: '#22c55e', icon: Truck,         up: true  },
  { label: 'Conferências',      value: '12',   sub: '2 com divergência',color: '#8b5cf6', icon: ClipboardCheck,up: true  },
  { label: 'Estoque Crítico',   value: '7',    sub: 'requerem ação',   color: '#ef4444', icon: AlertTriangle, up: false },
  { label: 'Taxa de Acerto',    value: '96.2%',sub: 'conferências',    color: '#0ea5e9', icon: Activity,      up: true  },
];

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {MOCK_KPI.map((kpi, i) => (
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
